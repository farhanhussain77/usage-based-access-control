export const Plan = {
    Basic: 'basic',
    Plus: "plus",
    Pro: "pro"
}

export type PlanKeys = typeof Plan[keyof typeof Plan];


export interface IUser {
    _id: string;
    email: string;
    name?: string;
    subscription: {
        plan: string;
        limit_exceeded: boolean;
    }
}