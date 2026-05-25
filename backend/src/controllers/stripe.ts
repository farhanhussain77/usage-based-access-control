import { Subscriptions } from '../models/subscriptions.ts';
import { User } from '../models/users.ts';
import { Plans } from '../models/plans.ts';
import { WebhookEvent } from '../models/webhookevents.ts';
import { Team } from '../models/team.ts';
import type { Request, Response } from 'express';
import { Types } from "mongoose";
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

        const isAdmin = user.role === "admin" ;     

        let session;
        let subscription = await Subscriptions.findOne({user_id: user._id}).populate("plan_id");

        const hasSubscription = !!subscription;

        if (!hasSubscription && isAdmin) {
            session = await stripe.checkout.sessions.create({
                success_url,
                mode: "subscription",
                line_items: [
                    {
                        price: newPlan.stripe_price_id as string,
                        quantity: 1
                    }
                ],
                metadata: {
                    user_id: user._id.toString(),
                    plan_id: newPlan._id.toString()
                },
                ...(user.stripe_customer_id && {
                    customer: user.stripe_customer_id
                }),
                ...(!user.stripe_customer_id && {
                    customer_email: user.email
                })
            });

            return res.status(201).json({ success: true, session });
        }
        
        const currentPlan = subscription?.plan_id as any;
        const isSamePlan = currentPlan._id.toString() === newPlan._id.toString();
        const isUpgrading = currentPlan?.name === "pro" && newPlan?.name === "plus"; //currentPlan === "pro" && newPlan === "plus";
        const isDowngrading = currentPlan.max_usage_limit > newPlan.max_usage_limit;
        if (isSamePlan) {
            return res.status(400).json({
                message: "You are already subscribed to this plan"
            });
        }


        const hasStripeSubscription = !!subscription?.stripe_subscription_id;

        if(isUpgrading && hasStripeSubscription){

            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

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
                proration_behavior: "always_invoice"
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

        const subscriptionId = data.subscription;
        if(!subscriptionId){
            console.log("subscriptionId not found in invoice");
            return false;
        }

        const user = await User.findOne({ stripe_customer_id: customerId });
        if(!user){
            console.log("User does not exist against the id");
            return false;
        }

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

        const primaryItem = stripeSub.items.data[0];
        if (!primaryItem) {
            console.log("No items found inside the subscription");
            return false;
        }

        const subscriptionStartDate = new Date(primaryItem.current_period_start * 1000);
        const subscriptionEndDate = new Date(primaryItem.current_period_end * 1000);

        const lineItems = data.lines?.data || [];
        let invoiceProductId: string | null = null;

        const upgradeLine = lineItems.find((line: any) => 
            line.description && line.description.includes("Remaining time")
        );

        if (upgradeLine) {

            invoiceProductId = upgradeLine.pricing?.price_details?.product || null;
            console.log(`[Upgrade Detected] New Plan Product ID: ${invoiceProductId}`);
        } else if (lineItems.length > 0) {
            // Case B: This is a standard renewal invoice. Use the primary plan on the billing statement.
            invoiceProductId = lineItems[0].pricing?.price_details?.product || null;
            console.log(`[Standard Renewal Detected] Renewing Plan Product ID: ${invoiceProductId}`);
        }

        if (invoiceProductId) {
            const plan = await Plans.findOne({ stripe_product_id: invoiceProductId });
            const currentSub = await Subscriptions.findOne({ user_id: user._id });

            if (plan && currentSub && String(currentSub.plan_id) !== String(plan._id)) {
                await Subscriptions.findOneAndUpdate(
                    { user_id: user._id },
                    {
                        plan_id: plan._id,
                        stripe_subscription_id: data.subscription,
                        current_usage: 0,
                        status: "active",
                        start_date: subscriptionStartDate,
                        end_date: subscriptionEndDate
                    }
                );
                console.log(`Successfully upgraded user to plan: ${plan._id}`);
                return true;
            }
        }

        await Subscriptions.findOneAndUpdate(
            { user_id: user._id },
            {
                current_usage: 0,
                status: "active",
                start_date: subscriptionStartDate,
                end_date: subscriptionEndDate
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
        
        const planId = obj.metadata?.plan_id;
        if(!planId){
            console.log("plan id not found in checkout session");
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

        const primaryItem = stripeSub.items.data[0];
        if (!primaryItem) {
            console.log("No items found inside the subscription");
            return false;
        }

        const productId = stripeSub.items.data[0]?.plan?.product as string;

        const plan = await Plans.findOne({
            stripe_product_id: productId
        });

        if (!plan) return false;


        const user = await User.findById(userId);

if (!user) {
    console.log("user not found");
    return false;
}

const email = user.email ?? "";

const teamName = email.split("@")[0] || "team";

        const subscriptionStartDate = new Date(primaryItem.current_period_start * 1000);
        const subscriptionEndDate = new Date(primaryItem.current_period_end * 1000);

        await Promise.all([
            User.findByIdAndUpdate(userId, {
                stripe_customer_id: customerId
            }),

            Subscriptions.findOneAndUpdate(
                { user_id: userId },
                {
                    plan_id: plan._id,
                    stripe_subscription_id: subscriptionId,
                    start_date: subscriptionStartDate,
                    end_date: subscriptionEndDate,
                    status: "active"
                },
                { upsert: true }
            )
        ]);

        if (plan.plan_type === "team") {

            let team = await Team.findOne({ owner_id: userId });

            // create team if not exists
            if (!team) {
                team = await Team.create({
                    name: teamName,
                    owner_id: userId,
                    members: [userId],
                    status: "active"
                });
            }

            // attach user to team
            await User.findByIdAndUpdate(userId, {
                team_id: team._id
            });
        }

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
    const basicPlan = await Plans.findOne({ name: "basic" });
    if (!basicPlan) {
        console.log("[handleSubscriptionDeleted]: basic plan not exists.");
        return false;
    }

    const user = await User.findOne({stripe_customer_id: customerId});
    if(!user){
        console.log("[handleSubscriptionDeleted]: user not found against this customer: ", customerId);
        return false;
    }

    await Subscriptions.findOneAndUpdate({user_id: user._id.toString()}, {plan_id: basicPlan._id,});
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

        const user = await User.findOne({ stripe_customer_id: customerId });
        if(!user){
            console.log("User does not exist against the id");
            return false;
        }

        const dbSubscription = await Subscriptions.findOne({ user_id: user._id });
        if (!dbSubscription) return false;

        let updateFields: any = {
            status: data.status || "active"
        };


        if (dbSubscription.pending_plan_id) {
            const planProductId = data.items.data[0]?.price?.product;
            const targetPlan = await Plans.findOne({ stripe_product_id: planProductId });

            if (targetPlan && String(targetPlan._id) === String(dbSubscription.pending_plan_id)) {
                updateFields.plan_id = targetPlan._id;
                updateFields.$unset = { pending_plan_id: "" };
                console.log("[subscription.updated]: Scheduled downgrade successfully applied.");
            }
        }

        // Apply the changes safely
        await Subscriptions.findOneAndUpdate(
            { user_id: user._id },
            updateFields,
            { returnDocument: "after" }
        );



        return true;

    }catch (err) {
            console.error("[invoice.payment_failed]: error", err);
            return false;
        }


};