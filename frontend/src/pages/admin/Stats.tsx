import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

type Stats = {
    totalUsers: number;
    totalAdmins: number;
    totalTeams: number;
    totalTeamMembers: number;
    paidSubscribers: number;
    monthlyRevenue: number;
    teamPlans: number;
    individualPlans: number;
    revenueChart: {
        month: string;
        revenue: number;
    }[];
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const AdminStats = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const token = Cookies.get("token");

    const fetchStats = async () => {
        setLoading(true);

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/admin/stats`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (res.ok) {
            setStats(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return <p className="p-6">Loading stats...</p>;
    }

    if (!stats) {
        return <p className="p-6">No data found</p>;
    }

    const Card = ({
        title,
        value
    }: {
        title: string;
        value: any;
    }) => (
        <div className="border rounded-xl p-5 bg-white shadow-sm">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
    );

    const chartData = {
        labels: stats.revenueChart.map((r) => r.month),
        datasets: [
            {
                label: "Revenue ($)",
                data: stats.revenueChart.map((r) => r.revenue),
                borderColor: "#000",
                backgroundColor: "rgba(0,0,0,0.1)",
                tension: 0.4
            }
        ]
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">
                Platform Overview
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

                <Card title="Total Users" value={stats.totalUsers} />
                <Card title="Admins" value={stats.totalAdmins} />
                <Card title="Teams" value={stats.totalTeams} />

                <Card title="Paid Subscribers" value={stats.paidSubscribers} />

                <Card
                    title="Monthly Revenue"
                    value={`$${stats.monthlyRevenue}`}
                />

                <Card title="Team Plans" value={stats.teamPlans} />
                <Card title="Individual Plans" value={stats.individualPlans} />

            </div>

            <div className="mt-10 max-w-2xl mx-auto bg-white border rounded-xl p-6">
    <h2 className="text-lg font-semibold mb-4">
        Revenue (Last 6 Months)
    </h2>

    <Line data={chartData} />
</div>
        </div>
    );
};

export default AdminStats;