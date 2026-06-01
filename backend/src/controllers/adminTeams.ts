import type { Request, Response } from "express";
import { Subscriptions } from "../models/subscriptions.ts";
import { getUserSubscription } from "../lib/getUserSubscription.ts";
import { User } from '../models/users.ts';
import { Team } from '../models/team.ts';
import { TeamMember } from '../models/teammembers.ts';


export const getAdminTeam = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ email: req.user.email });

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        // 1. get team
        const team = await Team.findOne({ owner_id: user._id });

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // 2. get members from TeamMember collection (NOT User.team.members)
        const teamMembers = await TeamMember.find({
            team_id: team._id,
            status: "active"
        }).populate("user_id", "name email role");

        // 3. format response
        const members = teamMembers.map((m: any) => ({
            _id: m.user_id._id,
            name: m.user_id.name,
            email: m.user_id.email,
            role: m.role
        }));

        // 4. subscription (already correct logic)
        const subscription = await getUserSubscription(req.user!._id);

        return res.status(200).json({
            team,
            members,
            subscription
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};