import type { Request, Response } from "express";
import { Plans } from "../models/plans.ts";


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
      price,
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

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Price is required"
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


    const isInternalPlan = Number(price) === 0;


    if (
      !isInternalPlan &&
      (!stripe_product_id || !stripe_price_id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stripe product id and stripe price id are required"
      });
    }

    const cleanedFeatures = features
      .map((feature: string) => feature.trim())
      .filter((feature: string) => feature.length > 0);

    const plan = await Plans.create({
      name,
      type: isInternalPlan ? "internal" : "stripe",
      price: Number(price),
      currency: "usd",
      max_usage_limit: Number(max_usage_limit),

      features: cleanedFeatures,

      stripe_product_id: stripe_product_id || null,
      stripe_price_id: stripe_price_id || null
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