import { Types } from "mongoose";

import { User } from "../models/users.ts";
import { Team } from "../models/team.ts";
import { Subscriptions } from "../models/subscriptions.ts";



export const getUserSubscription = async (
    userId: string | Types.ObjectId
): Promise<any> => {


    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }


    if (user.team_id) {

     
        const team = await Team.findById(
            user.team_id
        );

        if (!team) {
            throw new Error("Team not found");
        }

   
        const subscription =
            await Subscriptions
                .findOne({
                    user_id: team.owner_id
                })
                .populate("plan_id");

        if (!subscription) {
            throw new Error(
                "Subscription not found"
            );
        }

        return subscription;
    }


    const subscription =
        await Subscriptions
            .findOne({
                user_id: user._id
            })
            .populate("plan_id");

    if (!subscription) {
        throw new Error(
            "Subscription not found"
        );
    }

    return subscription;
};