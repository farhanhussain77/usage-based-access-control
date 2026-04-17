import { planIdToLimitMapper, planIdToNameMapper } from '../lib/plansMapper.ts';
import { Subscriptions } from '../models/subscriptions.ts';
import { User } from '../models/users.ts';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export const createCheckoutSession = async (req: Request, res: Response) => {
    const { success_url, product_id } = req.body;
    try{
        if(!success_url){
            return res.status(400).json({message: "success url is required"});
        }

        if(!product_id){
            return res.status(400).json({message: "plan id is required"});
        }

        if(!req.user){
            return res.status(400).json({message: "user is required"});
        }

        const user = await User.findOne({ email: req.user.email });
        if(!user){
            return res.status(404).json({meesage: "user not found"});
        }
        const product = await stripe.products.retrieve(product_id);

        if(!product){
            return res.status(400).json({message: "Product not found"})
        }

        const subscription = await Subscriptions.findOne({user_id: user._id})
        if(!subscription){
            return res.status(400).json({message: "Subscription not found"})
        }
        const currentPlan = subscription?.plan;
        const newPlan = planIdToNameMapper[product_id as keyof typeof planIdToNameMapper];

        const isUpgrading = true //currentPlan === "pro" && newPlan === "plus";

        let session;
        if(isUpgrading){
            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
            console.log("current_period_end", (stripeSubscription as any).items);
            if(!stripeSubscription){
                return res.status(400).json({message: `Stripe Subscription not found with this id: ${subscription.stripe_subscription_id}`});
            }
            // await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            //     items: [
            //         {
            //           id: (stripeSubscription.items.data[0] as any)?.id,
            //           price: product.default_price as string,
            //         },
            //     ],
            //     proration_behavior: "create_prorations"
            // })
        }else{
            session = await stripe.checkout.sessions.create({
                success_url,
                line_items: [
                    {
                        price: product.default_price as string,
                        quantity: 1
                    }
                ],
                mode: "subscription",
                ...(req.user?._id && {
                    metadata: {
                        user_id: req.user?._id.toString()
                    }
                }),
                ...(user?.stripe_customer_id && {customer: user?.stripe_customer_id}),
                ...(!user?.stripe_customer_id && req.user?.email && {customer_email: req.user?.email})
            });
        }
    console.log("session", session);
        return res.status(201).json({success: true, session})
    }catch(err:any){
        console.log("Error while creating session: ", err?.raw?.message);
        return res.status(500).json({message: "Internal server error"})
    }
}

let order = 0;
export const handleWebhook = async (req: Request, res: Response) => {
    order++;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try{
        if(!webhookSecret){
            return res.status(400).json({message: "Webhook secret is required"});
        }
    
        const signature = req.headers['stripe-signature'];
        if(!signature){
            return res.status(400).json({message: "Webhook signature is required"});
        }
    
        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
        );

        // console.log("type: ", event.type);

        if(event.type === "checkout.session.completed"){
            const isCompleted = await handleCheckoutSessionCompleted(event);
            if(!isCompleted){
                return res.status(400)
            }
        }else if(event.type === "invoice.paid"){
            handleInvoicePaid(event);
        }else if(event.type === "customer.subscription.deleted"){
            handleSubscriptionDeleted(event);
        }else if(event.type === "invoice.payment_succeeded"){
            handlePaymentSucceeded(event);
        }

        return res.status(201);
    }catch(err){
        console.log("Error during webhook call: ", err);
        return res.status(500).json({message: "Internal server error"});
    }
}

const handleInvoicePaid = async (event: any) => {
    console.log("executing handleInvoicePaid...");
    const data = event?.data?.object;
    const customerId = data?.customer;

    const user = await User.findOne({stripe_customer_id: customerId});
    if(!user){
        console.log("[handleInvoicePaid]: user not found against this customer: ", customerId);
        return false;
    }

    await Subscriptions.findOneAndUpdate({user_id: user._id.toString()}, {status: 'active'});
}

export const handleCheckoutSessionCompleted = async (event: any): Promise<boolean> => {
    console.log("executing handleCheckoutSessionCompleted...");
    const object = event?.data?.object;

    try{
        const userId = object?.metadata?.user_id;

        if(!userId){
            console.log("user id not found in checkout session");
            return false;
        }

        const customerId = object?.customer;
        if(!customerId){
            console.log("customerId id not found in checkout session");
            return false;
        }

        const subscriptionId = object?.subscription;
        if(!subscriptionId){
            console.log("subscriptionId id not found in checkout session");
            return false;
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        const user = await User.findById(userId);
        if(!user){
            console.log("User does not exist against this id: ", userId);
            return false;
        }

        const updatedPlanId = stripeSubscription?.items?.data[0]?.plan?.product;
        if(!updatedPlanId){
            console.log("stripe product id agains updated plan not found for this customer: ", customerId);
            return false;
        }
        const planName = planIdToNameMapper[updatedPlanId as keyof typeof planIdToNameMapper];
        const planLimit = planIdToLimitMapper[planName as keyof typeof planIdToLimitMapper];

        await Promise.all([
            User.findByIdAndUpdate(userId, {stripe_customer_id: customerId}),
            Subscriptions.findOneAndUpdate({user_id: user._id.toString()}, {plan: planName, max_usage_limit: planLimit, stripe_subscription_id: subscriptionId, start_date: stripeSubscription?.start_date})
        ]);

        return true;
    }catch(err){
        return true;
    }

}

export const handleSubscriptionDeleted = async (event: any) => {
    console.log("executing handleSubscriptionDeleted...");
    const data = event?.object?.data;
    const customerId = data?.customer;

    const user = await User.findOne({stripe_customer_id: customerId});
    if(!user){
        console.log("[handleSubscriptionDeleted]: user not found against this customer: ", customerId);
        return false;
    }

    await Subscriptions.findOneAndUpdate({user_id: user._id.toString()}, {status: 'inactive'});
}

export const handlePaymentSucceeded = async (event: any) => {
    console.log("executing handlePaymentSucceeded...");
    const data = event?.data?.object;

    if(data?.billing_reason === "subscription_cycle"){
        try{
            const data = event?.data?.object;
            const customerId = data?.customer;
    
            const user = await User.findOne({stripe_customer_id: customerId});
            if(!user){
                console.log("[handleSubscriptionUpdated]: user not found against this customer: ", customerId);
                return false;
            }

            await Subscriptions.findOneAndUpdate({user_id: user._id.toString()}, {current_usage: 0, start_date: new Date()})
    
            return true;
        }catch(err){
            return true;
        }
    }
}