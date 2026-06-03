export const Plan = {
    Basic: 'basic',
    Plus: "plus",
    Pro: "pro"
}

export type PlanKeys = typeof Plan[keyof typeof Plan];


export interface IUser {
    _id: string;
    email: string;
    name: string;
    role: string;
    team_id?: string | null;
    is_team_member?: boolean;
    is_individual_customer?: boolean;
    subscription: {
        plan: string;
        limit_exceeded: boolean;
        status: string;
        current_usage?: number;
        max_usage_limit?: number;
        expiry_date?: string;
    }
}