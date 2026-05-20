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
    const {getUser} = use(AuthContext);

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const user = getUser();

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
                        success_url: "http://localhost:5173"
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
            }else {
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

    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.length === 0 ? (
                        <p>No plans available</p>
                    ) : (
                        sortedPlans.map((plan) => (
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
                                        className="w-full"
                                        disabled={currentPlan === plan.name}
                                        onClick={() => onClickPlan(plan)}
                                    >
                                        {selectedPlan === plan._id ? (
                                            <Loader2 className="animate-spin w-4 h-4" />
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