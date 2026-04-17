import { Schema, model, Types } from 'mongoose';
import { User } from './users.ts';

const Plan = {
    Basic: 'basic',
    Plus: 'plus',
    Pro: 'pro'
} as const;

export type PlanKeys = typeof Plan[keyof typeof Plan]

export const MAX_USAGE = {
    basic: 5,
    pro: 10,
    plus: 20
}

interface ISubscription {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    plan: PlanKeys;
    stripe_subscription_id: string;
    current_usage: number;
    max_usage_limit: number;
    start_date: Date
    status: string;
}



const subscriptionSchema = new Schema<ISubscription>({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: User, 
        required: true
    },
    plan: {
        type: String, 
        enum: ["basic", "plus", "pro"], 
        required: true, 
        default: Plan.Basic 
    },
    stripe_subscription_id: {
        type: String,
        required: false
    },
    current_usage: {
        type: Number,
        required: true,
        default: 0
    },
    max_usage_limit: {
        type: Number,
        required: true,
        default: MAX_USAGE.basic
    },
    start_date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'active'
    }
});


export const Subscriptions = model('Subscription', subscriptionSchema);
