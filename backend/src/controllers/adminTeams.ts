import type { Request, Response } from "express";
import { Subscriptions } from "../models/subscriptions.ts";
import { getUserSubscription } from "../lib/getUserSubscription.ts";
import { User } from '../models/users.ts';
import { Team } from '../models/team.ts';


export const getAdminTeam = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ email: req.user.email });

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        const team = await Team.findOne({ owner_id: user._id });

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        const members = await User.find({
            _id: { $in: team.members.map(id => id.toString())} 
        }).select("name email role");

        const subscription = await getUserSubscription(
            req.user!._id
        );

        return res.status(200).json({
            team,
            members,
            subscription
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};