import { Link, Outlet } from "react-router";
import { ProfilePopover } from "./ProfilePopover";
import { AuthContext } from "@/contexts/Auth";
import { use, useEffect } from "react";
import { getCurrentUser } from "@/services/auth";

const MainLayout = () => {
    const { getUser, setUser } = use(AuthContext);
    const user = getUser();
    const plan = user?.subscription?.plan;

    const fetchUser = async () => {
        const user = await getCurrentUser();
        setUser(user);
    }

    useEffect(() => {
        fetchUser();
    },[]);
    return (
        <div>
            <header className="px-10 py-4 border border-b shadow-xs flex items-center justify-between">
                <p className="text-2xl">MeterStack</p>
                <div className="flex items-center justify-center gap-4">
                    <Link className="hover:bg-gray-100 p-2" to="/">Dashboard</Link>
                    <Link className="hover:bg-gray-100 p-2" to="/pricing">Pricing</Link>
                </div>
                <div className="flex items-center">
                    <p className="mr-6">{`Plan: ${plan === "basic" ? "Basic" : plan === "pro" ? "Pro" : "Plus"}`}</p>
                    <ProfilePopover />
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;