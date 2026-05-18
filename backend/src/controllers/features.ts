import { Subscriptions } from "../models/subscriptions.ts";
import type { Request, Response } from "express";
import type { IPlan } from "@/models/plans.ts";

export const featureAccess = async (req: Request, res: Response) => {
    console.log("feature API called: ");

    if(!req.user?._id){
        return res.status(400).json({success: false, message: "Bad request"})
    }

    const subscription = await Subscriptions.findOne({user_id: req.user?._id.toString()}).populate("plan_id");
    if(!subscription){
        return res.status(404).json({succcess: false, message: "Subscription does not exists for this user"})
    }

    if (subscription.status === "past_due") {
        return res.status(402).json({ message: "Payment failed" });
      }

    const plan = subscription.plan_id as IPlan;

    if(subscription.current_usage >= plan.max_usage_limit){
        return res.status(429).json({success: false, message: "Your usage quota exceeded the limit. Please consider to upgrade!"})
    }

    subscription.current_usage = (subscription.current_usage ?? 0) + 1;
    await subscription.save();

    return res.status(201).json({success: true, current_usage: subscription.current_usage});
}