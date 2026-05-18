import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/Button";
import { Loader2, X } from "lucide-react";


type Plan = {
    _id: string;
    name: string;
    price: number;
    stripe_product_id: string;
    stripe_price_id: string;
    max_usage_limit: number;
};

const AdminPlans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    const [form, setForm] = useState({
        name: "",
        price: "",
        stripe_product_id: "",
        stripe_price_id: "",
        max_usage_limit: "",
        features: ""
    });

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

            if (!res.ok) {
                console.error("Failed to fetch plans:", data);
                return;
            }

            setPlans(data?.plans || []);
        } catch (err) {
            console.error("Error fetching plans:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const resetForm = () => {
        setForm({
            name: "",
            price: "",
            stripe_product_id: "",
            stripe_price_id: "",
            max_usage_limit: "",
            features: "",
        });
    };

    const createPlan = async () => {
        setCreating(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/plans/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...form,
                        price: Number(form.price),
                        max_usage_limit: Number(form.max_usage_limit),
                        features: form.features
                            .split("\n")
                            .map((item) => item.trim())
                            .filter(Boolean)
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("Error creating plan:", data);
                return;
            }

            await fetchPlans();

            resetForm();
            setShowPanel(false);

        } catch (err) {
            console.error("Create plan error:", err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="relative p-10 overflow-hidden">

            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Plans</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage subscription plans
                    </p>
                </div>

                <Button onClick={() => setShowPanel(true)}>
                    Create New Plan
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center mt-20">
                    <Loader2 className="animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="border rounded-lg p-10 text-center">
                    <p className="text-gray-500">No plans exist</p>
                </div>
            ) : (
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-4">Name</th>
                                <th className="text-left p-4">Price</th>
                                <th className="text-left p-4">Usage Limit</th>
                                <th className="text-left p-4">Stripe Product ID</th>
                                <th className="text-left p-4">Stripe Price ID</th>
                            </tr>
                        </thead>

                        <tbody>
                            {plans.map((plan) => (
                                <tr
                                    key={plan._id}
                                    className="border-t"
                                >
                                    <td className="p-4 capitalize font-medium">
                                        {plan.name}
                                    </td>

                                    <td className="p-4">
                                        ${plan.price}/month
                                    </td>

                                    <td className="p-4">
                                        {plan.max_usage_limit}
                                    </td>

                                    <td className="p-4 text-sm text-gray-600">
                                        {plan.stripe_product_id}
                                    </td>

                                    <td className="p-4 text-sm text-gray-600">
                                        {plan.stripe_price_id}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showPanel && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={() => setShowPanel(false)}
                />
            )}

            <div
                className={`
                    fixed top-0 right-0 h-screen w-[450px] bg-white z-50
                    shadow-2xl transition-transform duration-300
                    ${showPanel ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Create New Plan
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Add a new subscription plan
                        </p>
                    </div>

                    <button
                        onClick={() => setShowPanel(false)}
                        className="cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <input
                        placeholder="Plan Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        className="border w-full p-3 rounded-md"
                    />

                    <input
                        placeholder="Price"
                        value={form.price}
                        onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                        }
                        className="border w-full p-3 rounded-md"
                    />

                    <input
                        placeholder="Stripe Product ID"
                        value={form.stripe_product_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                stripe_product_id: e.target.value
                            })
                        }
                        className="border w-full p-3 rounded-md"
                    />

                    <input
                        placeholder="Stripe Price ID"
                        value={form.stripe_price_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                stripe_price_id: e.target.value
                            })
                        }
                        className="border w-full p-3 rounded-md"
                    />

                    <input
                        placeholder="Max Usage Limit"
                        value={form.max_usage_limit}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                max_usage_limit: e.target.value
                            })
                        }
                        className="border w-full p-3 rounded-md"
                    />

                    <textarea
                        placeholder={`Features (one per line)
                        Example:
                        10 API Requests
                        Priority Support
                        Analytics Dashboard`}
                        value={form.features}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                features: e.target.value
                            })
                        }
                        className="border w-full p-3 rounded-md min-h-[120px]"
                    />

                    <Button
                        className="w-full mt-4"
                        onClick={createPlan}
                    >
                        {creating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Create Plan"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminPlans;