import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { use, useState } from "react";
import Cookies from 'js-cookie';
import { AuthContext } from "@/contexts/Auth";
import { Link } from "react-router";

const Dashboard = () => {
    const [loading, setLoaidng] = useState(false);
    const { getUser } = use(AuthContext);

    const callApi = async () => {
        setLoaidng(true);

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/feature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });

            if(!response.ok){
                const error = await response.text();
                console.error("Error calling API:", error);
            }

            const result = await response.json();
            console.log("result", result);
        }catch(error){
            console.error("Error calling API:", error);

        }finally{
            setLoaidng(false);
        }
    }

    const user = getUser();

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Usage-Based Access Control</h1>
            <p className="text-center mt-10">
                Manage user access through subscription plans with defined usage limits.<br /> 
                Track API consumption in real time and ensure users stay within their allocated quotas
            </p>

            <Button className="mt-6 w-1/6" onClick={callApi}>
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ):(
                    <span>Call API</span>
                )}
            </Button>
            {user?.subscription?.limit_exceeded && (
                <div className="mt-5">
                    <span className="text-xs text-red-600">Your API usage limit exceeded. Please consider to </span>
                    <Link className="text-xs underline font-semibold" to="/pricing">Upgrade</Link>
                </div>
            )}
        </div>
    )
}

export default Dashboard;