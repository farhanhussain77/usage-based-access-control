import type { Request, Response } from "express";
import { Plans } from "../models/plans.ts";
import { Subscriptions } from "../models/subscriptions.ts";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)


export const getPlans = async (
  req: Request,
  res: Response
) => {
  try {
    const plans = await Plans.find({
      is_active: true
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      plans
    });
  } catch (err) {
    console.error("[GET_PLANS_ERROR]: ", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const createPlan = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      max_usage_limit,
      features,
      stripe_product_id,
      stripe_price_id
    } = req.body;


    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Plan name is required"
      });
    }

    if (!max_usage_limit) {
      return res.status(400).json({
        success: false,
        message: "Max usage limit is required"
      });
    }

    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: "Features must be an array"
      });
    }

    const existingPlan = await Plans.findOne({
      name: name.toLowerCase()
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Plan already exists"
      });
    }

    const hasStripeData =
      !!stripe_product_id || !!stripe_price_id;

    const hasFullStripeData =
      !!stripe_product_id && !!stripe_price_id;

    if (hasStripeData && !hasFullStripeData) {
      return res.status(400).json({
        message:
          "Both stripe_product_id and stripe_price_id are required for Stripe plans"
      });
    }

    const isStripePlan = hasFullStripeData;
    const isInternalPlan = !isStripePlan;


    const cleanedFeatures = features
      .map((f: string) => f.trim())
      .filter(Boolean);

    if (isInternalPlan) {
      const plan = await Plans.create({
        name: name.toLowerCase(),
        type: "internal",
        price: 0,
        currency: "usd",
        max_usage_limit: Number(max_usage_limit),
        features: cleanedFeatures,

        stripe_product_id: null,
        stripe_price_id: null
      });

      return res.status(201).json({
        success: true,
        message: "Basic plan created",
        plan
      });
    }

    const stripePrice = await stripe.prices.retrieve(stripe_price_id);

    if (!stripePrice.unit_amount) {
      throw new Error("Invalid Stripe price amount");
    }

    const plan = await Plans.create({
      name: name.toLowerCase(),
      type: "stripe",
      price: stripePrice.unit_amount ?? 0,
      currency: stripePrice.currency || "usd",
      max_usage_limit: Number(max_usage_limit),
      features: cleanedFeatures,

      stripe_product_id,
      stripe_price_id
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan
    });
  } catch (err) {
    console.error("[CREATE_PLAN_ERROR]: ", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    const {
      name,
      max_usage_limit,
      features,
      stripe_product_id,
      stripe_price_id
    } = req.body;

    const plan = await Plans.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // prevent breaking active users accidentally (optional safety)
    if (plan.name === "basic" && name && name !== "basic") {
      return res.status(400).json({
        success: false,
        message: "Basic plan name cannot be changed"
      });
    }

    const cleanedFeatures = Array.isArray(features)
      ? features.map((f: string) => f.trim()).filter(Boolean)
      : plan.features;

    let price = plan.price;
    let currency = plan.currency;

    const isStripePlan =
      !!stripe_product_id && !!stripe_price_id;

    if (isStripePlan) {
      let stripePrice;

      try {
        stripePrice = await stripe.prices.retrieve(stripe_price_id);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid Stripe price ID"
        });
      }

      if (!stripePrice.unit_amount) {
        return res.status(400).json({
          success: false,
          message: "Invalid Stripe price"
        });
      }

      price = stripePrice.unit_amount;
      currency = stripePrice.currency;
    }

    const updatedPlan = await Plans.findByIdAndUpdate(
      planId,
      {
        name: name?.toLowerCase() || plan.name,
        max_usage_limit:
          max_usage_limit !== undefined
            ? Number(max_usage_limit)
            : plan.max_usage_limit,
        features: cleanedFeatures,
        price,
        currency,
        stripe_product_id:
          stripe_product_id ?? plan.stripe_product_id,
        stripe_price_id:
          stripe_price_id ?? plan.stripe_price_id,
        type: isStripePlan ? "stripe" : "internal"
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan: updatedPlan
    });
  } catch (err) {
    console.error("[UPDATE_PLAN_ERROR]:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    const plan = await Plans.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }


    if (plan.name === "basic") {
      return res.status(400).json({
        success: false,
        message: "Basic plan cannot be deleted"
      });
    }


    const subscriptionExists = await Subscriptions.exists({
      plan_id: plan._id
    });

  
    if (!subscriptionExists) {
      await Plans.findByIdAndDelete(planId);

      return res.status(200).json({
        success: true,
        message: "Plan hard deleted (no active users)"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan soft deleted (has active subscriptions)"
    });
  } catch (err) {
    console.error("[DELETE_PLAN_ERROR]:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
