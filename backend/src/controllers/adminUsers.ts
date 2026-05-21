import { User } from '../models/users.ts';
import { Subscriptions } from '../models/subscriptions.ts';
import type { Request, Response } from "express";




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