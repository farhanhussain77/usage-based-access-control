import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const TeamSubscriptionPage = () => {

    const [subscription, setSubscription] =
        useState<any>(null);

    const token = Cookies.get("token");

    const fetchSubscription = async () => {

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/team/admin`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (res.ok) {
            setSubscription(data.subscription);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    if (!subscription) {
        return <p>Loading...</p>;
    }

    const usagePercent =
        (
            subscription.current_usage /
            subscription.plan_id.max_usage_limit
        ) * 100;

    return (
        <div className="p-8">

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    Subscription
                </h1>

                <p className="text-gray-500">
                    Team plan and usage information
                </p>

            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">

                <div className="border rounded-xl p-5">
                    <p className="text-gray-500 text-sm">
                        Plan
                    </p>

                    <p className="font-semibold text-xl">
                        {subscription.plan_id.name}
                    </p>
                </div>

                <div className="border rounded-xl p-5">
                    <p className="text-gray-500 text-sm">
                        Status
                    </p>

                    <p className="font-semibold text-xl capitalize">
                        {subscription.status}
                    </p>
                </div>

                <div className="border rounded-xl p-5">
                    <p className="text-gray-500 text-sm">
                        Current Usage
                    </p>

                    <p className="font-semibold text-xl">
                        {subscription.current_usage}
                    </p>
                </div>

                <div className="border rounded-xl p-5">
                    <p className="text-gray-500 text-sm">
                        Usage Limit
                    </p>

                    <p className="font-semibold text-xl">
                        {subscription.plan_id.max_usage_limit}
                    </p>
                </div>

            </div>

            <div className="border rounded-xl p-6 mb-6">

                <div className="flex justify-between mb-2">

                    <span>
                        Usage
                    </span>

                    <span>
                        {subscription.current_usage}
                        /
                        {subscription.plan_id.max_usage_limit}
                    </span>

                </div>

                <div className="w-full bg-gray-200 h-3 rounded">

                    <div
                        className="bg-black h-3 rounded"
                        style={{
                            width: `${usagePercent}%`
                        }}
                    />

                </div>

            </div>

            <div className="grid grid-cols-2 gap-4">

                <div className="border rounded-xl p-5">

                    <p className="text-gray-500 text-sm">
                        Start Date
                    </p>

                    <p className="font-medium">
                        {new Date(
                            subscription.start_date
                        ).toLocaleDateString()}
                    </p>

                </div>

                <div className="border rounded-xl p-5">

                    <p className="text-gray-500 text-sm">
                        Expiry Date
                    </p>

                    <p className="font-medium">
                        {new Date(
                            subscription.end_date
                        ).toLocaleDateString()}
                    </p>

                </div>

            </div>

        </div>
    );
};

export default TeamSubscriptionPage;