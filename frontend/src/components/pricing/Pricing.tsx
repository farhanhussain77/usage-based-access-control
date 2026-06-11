import { use, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AuthContext } from "@/contexts/Auth";
import { Plan } from "@/types";
import Cookies from 'js-cookie';
import { Loader2 } from "lucide-react";

type Plan = {
    _id: string;
    name: string;
    price: number;
    max_usage_limit: number;
    features: string[];
    stripe_price_id?: string;
};

const Pricing = () => {
    const { user } = use(AuthContext);

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"individual" | "team">("individual");

    const token = Cookies.get("token");

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/plans`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            if (res.ok) {
                setPlans(data.plans || []);
                setPendingPlanId(data.pending_plan_id || null);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const onClickPlan = async (plan: Plan) => {
        const token = Cookies.get("token");

        try {
            setSelectedPlan(plan._id);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/stripe/create-checkout`,
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        plan_id: plan._id,
                        success_url:
                            user?.role === "admin" ? "http://localhost:5173/team/dashboard" : "http://localhost:5173"
                    })
                }
            );

            const res = await response.json();

            if (!response.ok) {
                console.log("Error:", res);
                return;
            }

            if (res.session?.url) {
                window.location.replace(res.session.url);
            } else {
                window.location.replace("/");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setSelectedPlan(null);
        }
    };

    const currentPlan = user?.subscription?.plan;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    const filteredPlans = plans
        .filter((plan: any) => plan.plan_type === activeTab)
        .sort((a, b) => a.price - b.price);

    // const downgrade = async () => {
    //     const token = Cookies.get("token");

    //     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/feature/downgrade`, {
    //         method: "GET",
    //         headers: {
    //             'content-type': 'application/json',
    //             'Authorization': `Bearer ${token}`
    //         }
    //     });

    //     if(!response.ok){
    //         const error = await response.json();
    //         console.log("Error while creating checkout session: ", error);
    //     }
    // }

    return (
        <div className="flex justify-center min-h-screen p-10">
            <div className="w-full max-w-6xl">
                <p className="text-center text-4xl font-medium mb-10">
                    Choose the plan that scales with your usage
                </p>

                <div className="flex justify-center mb-8">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("individual")}
                            className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${activeTab === "individual"
                                    ? "bg-white shadow"
                                    : "text-gray-600"
                                }`}
                        >
                            Individual
                        </button>

                        <button
                            onClick={() => setActiveTab("team")}
                            className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${activeTab === "team"
                                    ? "bg-white shadow"
                                    : "text-gray-600"
                                }`}
                        >
                            Team
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filteredPlans.length === 0 ? (
                        <p>No {activeTab} plans available</p>
                    ) : (
                        filteredPlans.map((plan) => (
                            <Card key={plan._id}>
                                <CardHeader>
                                    <CardTitle className="text-2xl capitalize">
                                        {plan.name}
                                    </CardTitle>
                                    <p className="text-xl font-medium">
                                        ${plan.price} / month
                                    </p>
                                </CardHeader>

                                <CardContent>
                                    <ul className="flex flex-col gap-2">
                                        {plan.features?.map((f, i) => (
                                            <li key={i}>● {f}</li>
                                        ))}
                                        <li>● {plan.max_usage_limit} requests/month</li>
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        className="w-full cursor-pointer"
                                        disabled={currentPlan === plan.name || pendingPlanId === plan._id}
                                        onClick={() => onClickPlan(plan)}
                                    >
                                        {selectedPlan === plan._id ? (
                                            <Loader2 className="animate-spin w-4 h-4" />
                                        ) : pendingPlanId === plan._id ? (
                                            "Downgrade Scheduled"
                                        ) : currentPlan === plan.name ? (
                                            "Subscribed"
                                        ) : (
                                            "Choose Plan"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pricing;