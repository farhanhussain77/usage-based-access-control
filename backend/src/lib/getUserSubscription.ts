import { Types } from "mongoose";

import { User } from "../models/users.ts";
import { Team } from "../models/team.ts";
import { Subscriptions } from "../models/subscriptions.ts";
import { TeamMember } from "../models/teammembers.ts";

export const getUserSubscription = async (
    userId: string | Types.ObjectId
): Promise<any | null> => {

    const user = await User.findById(userId);
    if (!user) return null;

    // 1. find team membership
    const teamMember = await TeamMember.findOne({
        user_id: user._id
    });

    let subscription = null;

    if (teamMember) {
        const team = await Team.findById(teamMember.team_id);

        if (team) {
            subscription = await Subscriptions
                .findOne({ user_id: team.owner_id })
                .populate("plan_id");
        }
    }

    // 2. fallback: personal subscription
    if (!subscription) {
        subscription = await Subscriptions
            .findOne({ user_id: user._id })
            .populate("plan_id");
    }

    // 3. IMPORTANT: do NOT throw error
    return subscription || null;
};