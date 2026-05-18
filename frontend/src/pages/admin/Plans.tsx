import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

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

    const [form, setForm] = useState({
        name: "",
        price: "",
        stripe_product_id: "",
        stripe_price_id: "",
        max_usage_limit: ""
    });

    const token = Cookies.get("token");

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/plans`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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

    const createPlan = async () => {
        setCreating(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/plans`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    max_usage_limit: Number(form.max_usage_limit)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Error creating plan:", data);
                return;
            }

            setPlans((prev) => [...prev, data.plan]);

            setForm({
                name: "",
                price: "",
                stripe_product_id: "",
                stripe_price_id: "",
                max_usage_limit: ""
            });

        } catch (err) {
            console.error("Create plan error:", err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">Admin Plans</h1>

            <div className="border p-4 rounded mb-10">
                <h2 className="font-semibold mb-4">Create New Plan</h2>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        placeholder="Plan name (pro/plus)"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border p-2"
                    />
                    <input
                        placeholder="Price"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="border p-2"
                    />
                    <input
                        placeholder="Stripe Product ID"
                        value={form.stripe_product_id}
                        onChange={(e) => setForm({ ...form, stripe_product_id: e.target.value })}
                        className="border p-2"
                    />
                    <input
                        placeholder="Stripe Price ID"
                        value={form.stripe_price_id}
                        onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })}
                        className="border p-2"
                    />
                    <input
                        placeholder="Max usage limit"
                        value={form.max_usage_limit}
                        onChange={(e) => setForm({ ...form, max_usage_limit: e.target.value })}
                        className="border p-2"
                    />
                </div>
                <Button className="mt-4" onClick={createPlan}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Plan"}
                </Button>
            </div>

            {loading ? (
                <Loader2 className="animate-spin" />
            ) : plans.length === 0 ? (
                <p className="text-gray-500">No plans exist</p>
            ) : (
                <div className="grid gap-4">
                    {plans.map((plan) => (
                        <div key={plan._id} className="border p-4 rounded">
                            <p className="font-bold">{plan.name}</p>
                            <p>Price: ${plan.price}</p>
                            <p>Limit: {plan.max_usage_limit}</p>
                            <p className="text-xs text-gray-500">
                                Product: {plan.stripe_product_id}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPlans;