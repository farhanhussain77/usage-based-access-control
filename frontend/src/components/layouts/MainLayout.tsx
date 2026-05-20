import { Outlet, NavLink } from "react-router";
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
    }, []);
    return (
        <div>
            <header className="px-10 py-4 border border-b shadow-xs flex items-center justify-between">
                <p className="text-2xl">MeterStack</p>
                <div className="flex items-center justify-center gap-4">
                    <NavLink to="/"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md ${isActive
                                ? "bg-black text-white font-semibold"
                                : "text-gray-600 hover:bg-gray-100"
                            }`
                        }>Dashboard</NavLink>
                    <NavLink to="/pricing"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md ${isActive
                                ? "bg-black text-white font-semibold"
                                : "text-gray-600 hover:bg-gray-100"
                            }`
                        }>Pricing</NavLink>
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