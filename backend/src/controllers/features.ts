import { Subscriptions } from "../models/subscriptions.ts";
import type { Request, Response } from "express";

export const featureAccess = async (req: Request, res: Response) => {
    console.log("feature API called: ");

    if(!req.user?._id){
        return res.status(400).json({success: false, message: "Bad request"})
    }

    const subscription = await Subscriptions.findOne({user_id: req.user?._id.toString()})
    if(!subscription){
        return res.status(404).json({succcess: false, message: "Subscription does not exists for this user"})
    }

    if(subscription.max_usage_limit === subscription.current_usage){
        return res.status(429).json({success: false, message: "Your usage quota exceeded the limit. Please consider to updarage!"})
    }

    subscription.current_usage = subscription.current_usage + 1;
    subscription.save();

    return res.status(201).json({success: true, current_usage: subscription.current_usage});
}