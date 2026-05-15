import { Schema, model } from "mongoose";

export type PlanKey = "basic" | "pro" | "plus";

export interface IPlan {
  _id: string;

  key: PlanKey;

  name: string;

  type: "internal" | "stripe";

  limits: {
    monthly_requests: number;
  };

  price: {
    amount: number; // cents
    currency: "usd";
  };

  stripe?: {
    product_id?: string;
    price_id?: string;
  };

  isActive: boolean;
}

const planSchema = new Schema<IPlan>(
  {
    key: {
      type: String,
      enum: ["basic", "pro", "plus"],
      required: true,
      unique: true
    },

    name: { type: String, required: true },

    type: {
      type: String,
      enum: ["internal", "stripe"],
      required: true
    },

    limits: {
      monthly_requests: {
        type: Number,
        required: true
      }
    },

    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "usd" }
    },

    stripe: {
      product_id: String,
      price_id: String
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Plan = model<IPlan>("Plan", planSchema);