import { Schema, model, Types } from "mongoose";

export interface IPlan {
  _id: Types.ObjectId;

  name: string;

  type: "internal" | "stripe";

  price: number;

  currency: string;

  max_usage_limit: number;

  features: string[];

  stripe_product_id?: string;

  stripe_price_id?: string;

  is_active: boolean;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["internal", "stripe"],
      required: true,
      default: "stripe"
    },

    price: {
      type: Number,
      required: true,
      default: 0
    },

    currency: {
      type: String,
      default: "usd"
    },

    max_usage_limit: {
      type: Number,
      required: true
    },

    features: {
      type: [String],
      required: true,
      default: []
    },

    stripe_product_id: {
      type: String,
      required: false,
      default: null
    },

    stripe_price_id: {
      type: String,
      required: false,
      default: null
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

planSchema.pre("validate", function () {
  if (this.type === "stripe") {
    if (!this.stripe_product_id || !this.stripe_price_id) {
      throw new Error(
        "stripe_product_id and stripe_price_id are required for stripe plans"
      );
    }
  }
});

export const Plans = model<IPlan>("Plan", planSchema);