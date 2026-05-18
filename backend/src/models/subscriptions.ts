import { Schema, model, Types } from 'mongoose';
import { User } from './users.ts';
import { Plans } from './plans.ts';
import type { IPlan } from './plans.ts'; 

interface ISubscription {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    plan_id: Types.ObjectId | IPlan; 
    stripe_subscription_id: string;
    current_usage: number;
    start_date: Date
    status: string;
}

const subscriptionSchema = new Schema<ISubscription>({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: User, 
        required: true
    },
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: Plans,
        required: true
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
    start_date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "past_due", "inactive", "canceled"],
        default: 'active'
    }
});


export const Subscriptions = model('Subscription', subscriptionSchema);
