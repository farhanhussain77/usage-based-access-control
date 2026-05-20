import { Subscriptions } from '../models/subscriptions.ts';
import { User } from '../models/users.ts';
import { Plans } from '../models/plans.ts';
import { WebhookEvent } from '../models/webhookevents.ts';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export const createCheckoutSession = async (req: Request, res: Response) => {
    const { success_url, plan_id } = req.body;
    try{
        if(!success_url){
            return res.status(400).json({message: "success url is required"});
        }

        if(!plan_id){
            return res.status(400).json({message: "plan id is required"});
        }

        if(!req.user){
            return res.status(400).json({message: "user is required"});
        }

        const user = await User.findOne({ email: req.user.email });
        if(!user){
            return res.status(404).json({meesage: "user not found"});
        }

        const newPlan = await Plans.findById(plan_id);
        if (!newPlan) {
            return res.status(400).json({ message: "Plan not found" });
        }
        if (newPlan.type === "internal") {
            return res.status(400).json({
                message: "Basic plan cannot be purchased. It is assigned only at signup."
            });
        }

        const subscription = await Subscriptions.findOne({user_id: user._id}).populate("plan_id");
        if(!subscription){
            return res.status(400).json({message: "Subscription not found"})
        }
        const currentPlan = subscription.plan_id as any;
        const isSamePlan = currentPlan._id.toString() === newPlan._id.toString();
        const isUpgrading = currentPlan?.name === "pro" && newPlan?.name === "plus"; //currentPlan === "pro" && newPlan === "plus";
        const isDowngrading = currentPlan.max_usage_limit > newPlan.max_usage_limit;
        if (isSamePlan) {
            return res.status(400).json({
                message: "You are already subscribed to this plan"
            });
        }

        let session;
        const hasStripeSubscription = !!subscription.stripe_subscription_id;

        if(isUpgrading && hasStripeSubscription){
            const stripeSubscription =
        await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );

        if (!stripeSubscription) {
            return res.status(400).json({
                message: "Stripe subscription not found"
            });
        }

        const subscriptionItem = stripeSubscription.items.data[0];

        if (!subscriptionItem) {
            return res.status(400).json({
                message: "Subscription item not found"
            });
        }

        await stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            {
                items: [
                    {
                        id: subscriptionItem.id,
                        price: newPlan.stripe_price_id as string
                    }
                ],
                proration_behavior: "create_prorations"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Plan upgraded successfully"
        });
        } else if (isDowngrading && hasStripeSubscription) {


            const stripeSubscription = await stripe.subscriptions.retrieve(
                subscription.stripe_subscription_id
            ) as any;
        
            if (!stripeSubscription) {
                return res.status(400).json({
                    message: "Stripe subscription not found"
                });
            }
        

            const subscriptionItem = stripeSubscription.items.data[0];
        
            if (!subscriptionItem) {
                return res.status(400).json({
                    message: "Subscription item not found"
                });
            }
        

            const periodEndTimestamp = subscriptionItem.current_period_end;
            console.log("Subscription period ends at timestamp: ", periodEndTimestamp);
        

            let scheduleId = stripeSubscription.schedule;

            let currentPhaseStart: number | null = null;
        
            if (!scheduleId) {

                const newSchedule = await stripe.subscriptionSchedules.create({
                    from_subscription: subscription.stripe_subscription_id,
                });
                scheduleId = newSchedule.id;
                currentPhaseStart = newSchedule.current_phase?.start_date || null;
            }else {
                const existingSchedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
                currentPhaseStart = existingSchedule.current_phase?.start_date || null;
            }
            
            await stripe.subscriptionSchedules.update(scheduleId, {

                proration_behavior: "none", 
                phases: [
                    {

                        items: [
                            {
                                price: currentPlan.stripe_price_id as string,
                                quantity: 1
                            }
                        ],
                        start_date: currentPhaseStart ? currentPhaseStart : undefined,
                        end_date: periodEndTimestamp
                    } as any,
                    {

                        items: [
                            {
                                price: newPlan.stripe_price_id as string,
                                quantity: 1
                            }
                        ]
                    }
                ]
            });
            

            await Subscriptions.findByIdAndUpdate(
                subscription._id,
                {
                    pending_plan_id: newPlan._id
                }
            );
        
            return res.status(200).json({
                success: true,
                message: "Downgrade successfully scheduled for your next billing cycle. No immediate charges have been made."
            });
        }

        

     else{
            session = await stripe.checkout.sessions.create({
                success_url,
                line_items: [
                    {
                        price: newPlan.stripe_price_id as string,
                        quantity: 1
                    }
                ],
                mode: "subscription",
                ...(req.user?._id && {
                    metadata: {
                        user_id: req.user?._id.toString(),
                        plan_id: newPlan._id.toString()
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

        const eventId = event.id;

        if (await WebhookEvent.findOne({ event_id: eventId })) {
            return res.sendStatus(200);
        }

        await WebhookEvent.create({
            event_id: eventId,
            type: event.type
        });

        // console.log("type: ", event.type);

        if(event.type === "checkout.session.completed"){
            const isCompleted = await handleCheckoutSessionCompleted(event);
            if(!isCompleted){
                return res.status(400)
            }
        }else if(event.type === "invoice.paid"){
           await handleInvoicePaid(event);
        }else if(event.type === "customer.subscription.deleted"){
           await handleSubscriptionDeleted(event);
        }else if (event.type === "invoice.payment_failed") {
            await handleInvoicePaymentFailed(event);
        }else if (event.type === "customer.subscription.updated") {
            await handleSubscriptionUpdated(event);
        }

        return res.sendStatus(200);
    }catch(err){
        console.log("Error during webhook call: ", err);
        return res.status(500).json({message: "Internal server error"});
    }
}

const handleInvoicePaid = async (event: any) => {
    console.log("invoice.paid");

    try {
        const data = event.data.object;
        const customerId = data.customer;
        if(!customerId){
            console.log("customerId id not found in checkout session");
            return false;
        }

        const user = await User.findOne({ stripe_customer_id: customerId });
        if(!user){
            console.log("User does not exist against the id");
            return false;
        }
        await Subscriptions.findOneAndUpdate(
            { user_id: user._id },
            {
                current_usage: 0,
                status: "active"
            }
        );

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const handleCheckoutSessionCompleted = async (event: any) => {
    console.log("checkout.session.completed");

    try {
        const obj = event.data.object;

        const userId = obj.metadata?.user_id;
        if(!userId){
            console.log("user id not found in checkout session");
            return false;
        }
        const customerId = obj.customer;
        if(!customerId){
            console.log("customerId id not found in checkout session");
            return false;
        }
        const subscriptionId = obj.subscription;
        if(!subscriptionId){
            console.log("subscriptionId id not found in checkout session");
            return false;
        }

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

        const productId = stripeSub.items.data[0]?.plan?.product as string;

        const plan = await Plans.findOne({
            stripe_product_id: productId as string
        });

        if (!plan) return false;

        await Promise.all([
            User.findByIdAndUpdate(userId, {
                stripe_customer_id: customerId
            }),

            Subscriptions.findOneAndUpdate(
                { user_id: userId },
                {
                    plan_id: plan._id,
                    stripe_subscription_id: subscriptionId,
                    start_date: new Date(stripeSub.start_date),
                    status: "active"
                },
                { upsert: true }
            )
        ]);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

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

export const handleInvoicePaymentFailed = async (event: any) => {
    console.log("executing handleInvoicePaymentFailed...");

    try {
        const invoice = event?.data?.object;

        const customerId = invoice?.customer;
        const subscriptionId = invoice?.subscription;

        if (!customerId || !subscriptionId) {
            console.log("[invoice.payment_failed]: missing data");
            return false;
        }

        const user = await User.findOne({ stripe_customer_id: customerId });

        if (!user) {
            console.log("[invoice.payment_failed]: user not found", customerId);
            return false;
        }

        const subscription = await Subscriptions.findOne({
            user_id: user._id.toString(),
            stripe_subscription_id: subscriptionId
        });

        if (!subscription) {
            console.log("[invoice.payment_failed]: subscription not found");
            return false;
        }

        await Subscriptions.findByIdAndUpdate(subscription._id, {
            status: "past_due"
        });

        console.log(
            `[invoice.payment_failed]: marked past_due for user ${user.email}`
        );

        return true;

    } catch (err) {
        console.error("[invoice.payment_failed]: error", err);
        return false;
    }
};


export const handleSubscriptionUpdated = async (event: any) => {
    console.log("executing handleSubscriptionUpdated...");

    try {
        const data = event.data.object;
        const customerId = data.customer;
        if(!customerId){
            console.log("customerId id not found in checkout session");
            return false;
        }
        const subscriptionId = data.subscription;

        const user = await User.findOne({ stripe_customer_id: customerId });
        if(!user){
            console.log("User does not exist against the id");
            return false;
        }

        const planProductId = data.items.data[0]?.plan?.product;
        if (!planProductId) {
            console.log("[subscription.updated]: no product id");
            return false;
        }

        const plan = await Plans.findOne({
            stripe_product_id: planProductId
        });
        if (!plan) {
            console.log("[subscription.updated]: plan not found");
            return false;
        }

        await Subscriptions.findOneAndUpdate(
            { user_id: user._id },
            {
                plan_id: plan._id,
                stripe_subscription_id: subscriptionId,
                status: data.status || "active"
            },
            { returnDocument: "after" }
        );


        return true;

    }catch (err) {
            console.error("[invoice.payment_failed]: error", err);
            return false;
        }


};