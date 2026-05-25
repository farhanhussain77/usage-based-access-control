import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeam extends Document {
    name: string;

    owner_id: Types.ObjectId;

    members: Types.ObjectId[];

    status: "active" | "inactive";
}

const TeamSchema = new Schema<ITeam>(
    {
        name: {
            type: String,
            required: true
        },

        owner_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

export const Team = mongoose.model<ITeam>("Team", TeamSchema);