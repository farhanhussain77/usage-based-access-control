import { User } from '../models/users.ts';
import { Subscriptions } from '../models/subscriptions.ts';
import type { Request, Response } from "express";
import { hashPassword } from "../lib/passwordHelper.ts";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)



export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select("-password");

        const subscriptions = await Subscriptions.find({})
            .populate("plan_id");

        const subscriptionMap = new Map();

        subscriptions.forEach((sub) => {
            subscriptionMap.set(sub.user_id.toString(), sub);
        });

        const formatted = users.map((u) => {
            const sub = subscriptionMap.get(u._id.toString());

            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                subscription: sub
                    ? {
                          plan: sub.plan_id?.name,
                          status: sub.status,
                          current_usage: sub.current_usage,
                          max_usage_limit: sub.plan_id?.max_usage_limit
                      }
                    : {
                          plan: "none",
                          status: "inactive",
                          current_usage: 0,
                          max_usage_limit: 0
                      }
            };
        });

        return res.json({ success: true, users: formatted });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};




export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!["customer", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // prevent non-superadmin from changing roles
        // if (req.user.role !== "superadmin") {
        //     return res.status(403).json({ message: "Forbidden" });
        // }

        targetUser.role = role;
        await targetUser.save();

        return res.status(200).json({
            success: true,
            message: "Role updated successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existing = await User.findOne({
            email
        });

        if (existing) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: "admin",
        });

        return res.status(201).json({
            success: true,
            user
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal error"
        });
    }
};



export const disableUser = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.params.id;

        if (!userId || Array.isArray(userId)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        const subscription =
            await Subscriptions.findOne({
                user_id: userId
            });

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        subscription.status = "inactive";

        await subscription.save();

        return res.status(200).json({
            success: true,
            message: "User disabled successfully"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const subscription =
            await Subscriptions.findOne({
                user_id: user._id
            });

        if (
            subscription?.stripe_subscription_id
        ) {
            await stripe.subscriptions.cancel(
                subscription.stripe_subscription_id
            );
        }

        await Subscriptions.deleteOne({
            user_id: user._id
        });

        await User.findByIdAndDelete(user._id);

        return res.json({
            success: true
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal error"
        });
    }
};