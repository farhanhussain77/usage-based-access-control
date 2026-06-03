import { use } from "react";
import { Link } from "react-router";
import { AuthContext } from "@/contexts/Auth";

const SubscriptionPage = () => {
    const { getUser } = use(AuthContext);

    const user = getUser();

    const subscription = user?.subscription;

    const isTeamMember = user?.is_team_member;
    const isAdmin = user?.role === "admin";

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Subscription
                </h1>

                <p className="text-gray-500 mt-1">
                    View your subscription and usage details
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">


                <div className="border rounded-xl p-5 bg-white">
                    <p className="text-sm text-gray-500">
                        Current Usage
                    </p>

                    <p className="text-xl font-semibold mt-2">
                        {subscription?.current_usage ?? 0}
                    </p>
                </div>

                <div className="border rounded-xl p-5 bg-white">
                    <p className="text-sm text-gray-500">
                        Usage Limit
                    </p>

                    <p className="text-xl font-semibold mt-2">
                        {subscription?.max_usage_limit ?? 0}
                    </p>
                </div>

            </div>

            {/* Usage Progress */}
            <div className="border rounded-xl p-6 bg-white mb-8">

                <div className="flex justify-between mb-2">
                    <span className="font-medium">
                        Usage
                    </span>

                    <span className="text-sm text-gray-500">
                        {subscription?.current_usage ?? 0}
                        {" / "}
                        {subscription?.max_usage_limit ?? 0}
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                    <div
                        className="bg-black h-3 rounded-full"
                        style={{
                            width: `${
                                subscription?.max_usage_limit
                                    ? Math.min(
                                          100,
                                          (subscription.current_usage /
                                              subscription.max_usage_limit) *
                                              100
                                      )
                                    : 0
                            }%`
                        }}
                    />

                </div>

            </div>

            {/* Additional Details */}
            {!(user?.role === "customer" && isTeamMember) && (
                <div className="border rounded-xl p-6 bg-white">

                    <h2 className="text-lg font-semibold mb-4">
                        Subscription Details
                    </h2>

                    <div className="space-y-4">

                        <div className="flex justify-between border-b pb-3">
                            <span className="text-gray-500">
                                Plan Name
                            </span>

                            <span className="font-medium capitalize">
                                {subscription?.plan}
                            </span>
                        </div>

                        <div className="flex justify-between border-b pb-3">
                            <span className="text-gray-500">
                                Status
                            </span>

                            <span className="font-medium capitalize">
                                {subscription?.status}
                            </span>
                        </div>

                        <div className="flex justify-between border-b pb-3">
                            <span className="text-gray-500">
                                Expiry Date
                            </span>

                            <span className="font-medium">
                                {subscription?.expiry_date
                                    ? new Date(
                                          subscription.expiry_date
                                      ).toLocaleDateString()
                                    : "-"}
                            </span>
                        </div>

                    </div>

                    {subscription?.limit_exceeded && (
                        <div className="mt-6">

                            <p className="text-red-500 text-sm mb-3">
                                Your usage limit has been exceeded.
                            </p>

                            <Link
                                to="/pricing"
                                className="inline-flex items-center bg-black text-white px-4 py-2 rounded-lg"
                            >
                                Upgrade Plan
                            </Link>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default SubscriptionPage;