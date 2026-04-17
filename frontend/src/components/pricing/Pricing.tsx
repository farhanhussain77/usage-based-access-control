import { use, useState } from "react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AuthContext } from "@/contexts/Auth";
import { Plan } from "@/types";
import Cookies from 'js-cookie';
import { Loader2 } from "lucide-react";

const planMapper = {
    "plus": "prod_UKlobiqhF1mZOM",
    "pro": "prod_UKln64o3kc978R"

}

const Pricing = () => {
    const {getUser} = use(AuthContext);

    const [selectedPlan, setSelectedPlan] = useState(null);

    const user = getUser();

    const onClickPlan = async (plan: string) => {
        console.log("plan", plan);
        const priceId = planMapper[plan as keyof typeof planMapper];

        const token = Cookies.get("token");

        try{
            setSelectedPlan(plan);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/stripe/create-checkout`, {
                method: "POST",
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: priceId,
                    success_url: "http://localhost:5174"
                })
            });
    
            if(!response.ok){
                const error = await response.json();
                console.log("Error while creating checkout session: ", error);
            }
    
            const res = await response.json();
            console.log("res", res);
            const url = res?.session?.url;
            window.location.href = url;
        }catch(err){
            console.log("Error: ", err);
        }finally {
            setSelectedPlan(null);
        }
    }

    // const downgrade = async () => {
    //     const token = Cookies.get("token");

    //     const response = await fetch(`${import.meta.env.VITE_API_URL}/feature/downgrade`, {
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

    const isBasic = user?.subscription?.plan === Plan.Basic
    const isPro = user?.subscription?.plan === Plan.Pro
    const isPlus = user?.subscription?.plan === Plan.Plus
    return (
        <div className="flex items-center justify-center h-screen">
            <div>
                <p className="text-center text-5xl font-medium">Choose the plan that scales with your usage</p>
                <div className="mt-20 flex items-center justify-center gap-10">
                    <Card className="w-full max-w-[350px]">
                        <CardHeader>
                            <CardTitle className="text-3xl font-semibold">Basic</CardTitle>
                            <p className="mt-1 text-xl font-medium">
                                $0 / month
                            </p>
                        </CardHeader>
                        <CardContent className="mt-4">
                            <ul className="flex flex-col gap-4">
                                <li className="font-medium">● 10 API requests / month</li>
                                <li className="font-medium">● Access to core features</li>
                                <li className="font-medium">● Standard rate limiting</li>
                                <li className="font-medium">● Community support</li>
                                <li className="font-medium">● No overage allowed (hard limit)</li>
                            </ul>
                            
                        </CardContent>
                        <CardFooter className="items-start! mt-4 !flex-col">
                            <p className="text-xs italic">Best for individuals & testing use cases</p>
                            <Button onClick={() => onClickPlan(Plan.Basic)} disabled={isBasic} className="mt-4 w-full">
                                {selectedPlan === isBasic ? <Loader2 /> : isBasic ? "Subscribed" : "Downgrade"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="w-full max-w-[350px]">
                        <CardHeader>
                            <CardTitle className="text-3xl font-semibold">Pro</CardTitle>
                            <p className="mt-1 text-xl font-medium">
                                $12 / month
                            </p>
                        </CardHeader>
                        <CardContent className="mt-4">
                            <ul className="flex flex-col gap-4">
                                <li className="font-medium">● 100 API requests / month</li>
                                <li className="font-medium">● Access to core features</li>
                                <li className="font-medium">● Standard rate limiting</li>
                                <li className="font-medium">● Community support</li>
                                <li className="font-medium">● Overage allowed (soft limit with warnings)</li>
                            </ul>
                            
                        </CardContent>
                        <CardFooter className="items-start! mt-4 !flex-col">
                            <p className="text-xs italic">Best for startups & active projects</p>
                            <Button onClick={() => onClickPlan(Plan.Pro)} disabled={isPro} className="mt-4 w-full">
                                {selectedPlan === isPro ? <Loader2 /> : isPro ? "Subscribed" : isBasic ? "Upgrade" : "Downgrade"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="w-full max-w-[350px]">
                        <CardHeader>
                            <CardTitle className="text-3xl font-semibold">Plus</CardTitle>
                            <p className="mt-1 text-xl font-medium">
                                $20 / month
                            </p>
                        </CardHeader>
                        <CardContent className="mt-4">
                            <ul className="flex flex-col gap-4">
                                <li className="font-medium">● 200 API requests / month</li>
                                <li className="font-medium">● Access to core features</li>
                                <li className="font-medium">● Advanced rate limiting</li>
                                <li className="font-medium">● Community support</li>
                                <li className="font-medium">● Overage protection + upgrade prompts</li>
                            </ul>
                            
                        </CardContent>
                        <CardFooter className="items-start! mt-4 !flex-col">
                            <p className="text-left text-xs italic">Best for scaling apps & production workloads</p>
                            <Button onClick={() => onClickPlan(Plan.Plus)} disabled={isPlus} className="mt-4 w-full">
                                {selectedPlan === isPlus ? <Loader2 /> : isPlus ? "Subscribed" : "Upgrade"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Pricing;