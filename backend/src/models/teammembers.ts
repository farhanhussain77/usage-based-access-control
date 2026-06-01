import { Schema, model, Types, Document } from "mongoose";

export type TeamMemberRole = "owner" | "member";

export interface ITeamMember extends Document {
    team_id: Types.ObjectId;
    user_id: Types.ObjectId;

    role: TeamMemberRole;

    status: "active" | "invited" | "removed";

    joined_at: Date;
    created_at: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        team_id: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true
        },

        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        role: {
            type: String,
            enum: ["owner", "member"],
            default: "member"
        },

        status: {
            type: String,
            enum: ["active", "invited", "removed"],
            default: "active"
        },

        joined_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);


TeamMemberSchema.index({ team_id: 1, user_id: 1 }, { unique: true });

export const TeamMember = model<ITeamMember>(
    "TeamMember",
    TeamMemberSchema
);