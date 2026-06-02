import type { Request, Response } from "express";
import { User } from "../models/users.ts";
import { Team } from "../models/team.ts";
import { TeamMember } from "../models/teammembers.ts";
import { Subscriptions } from "../models/subscriptions.ts";

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalAdmins,
            totalTeams,
            totalTeamMembers,
            subscriptions
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "admin" }),
            Team.countDocuments(),
            TeamMember.countDocuments({ status: "active" }),
            Subscriptions.find({
                status: "active",
                stripe_subscription_id: { $ne: null }
            }).populate("plan_id")
        ]);

        const paidSubscribers = subscriptions.length;

        const teamPlans = subscriptions.filter(
            (s: any) => s.plan_id?.plan_type === "team"
        ).length;

        const individualPlans = subscriptions.filter(
            (s: any) => s.plan_id?.plan_type === "individual"
        ).length;


        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const currentMonthSubs = subscriptions.filter((sub: any) => {
            const start = new Date(sub.start_date);

            return start >= startOfMonth && start <= endOfMonth;
        });


        const monthlyRevenue = currentMonthSubs.reduce((sum: number, sub: any) => {
            return sum + (sub.plan_id?.price || 0);
        }, 0);

        const getLast6Months = () => {
            const months = [];

            const now = new Date();

            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

                months.push({
                    key: `${d.getFullYear()}-${d.getMonth()}`,
                    month: d.toLocaleString("default", { month: "short" }),
                    revenue: 0
                });
            }

            return months;
        };

        const revenueChart = getLast6Months();

        subscriptions.forEach((sub: any) => {
            if (!sub.start_date || !sub.plan_id?.price) return;

            const date = new Date(sub.start_date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            const bucket = revenueChart.find((m) => m.key === key);

            if (bucket) {
                bucket.revenue += sub.plan_id.price;
            }
        });


        const cleanRevenueChart = revenueChart.map(({ month, revenue }) => ({
            month,
            revenue
        }));


        return res.json({
            totalUsers,
            totalAdmins,
            totalTeams,
            totalTeamMembers,
            paidSubscribers,
            monthlyRevenue,
            teamPlans,
            individualPlans,
            revenueChart: cleanRevenueChart
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};