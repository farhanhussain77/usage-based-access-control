import { Schema, model, Types } from 'mongoose';
import { User } from './users';

const enum Plan {
    Basic = 'basic',
    Plus = 'plus',
    Pro = 'pro'
}

interface ISubscription {
    user_id: Types.ObjectId;
    plan: Plan;
    stripe_subscription_id: string;
    usage_limit: string;
    max_usage_limit: string;
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
        required: true
    },
    usage_limit: {
        type: String,
        required: true
    },
    max_usage_limit: {
        type: String,
        required: true
    }
});


export const Subscriptions = model('User', subscriptionSchema);
