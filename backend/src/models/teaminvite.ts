import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeamInvite extends Document {
    email: string;
    team_id: Types.ObjectId;
    invited_by: Types.ObjectId;

    token: string;

    status: "pending" | "accepted";

    expires_at: Date;

    used_at: Date | null;
}

const teamInviteSchema = new Schema<ITeamInvite>(
    {
        email: {
            type: String,
            required: true
        },

        team_id: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },

        invited_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        token: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted"],
            default: "pending"
        },

        expires_at: {
            type: Date,
            required: true
        },

        used_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const TeamInvite = mongoose.model<ITeamInvite>(
    "TeamInvite",
    teamInviteSchema
);