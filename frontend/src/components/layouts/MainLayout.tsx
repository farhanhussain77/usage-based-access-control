import { Outlet, NavLink } from "react-router";
import { ProfilePopover } from "./ProfilePopover";
import { AuthContext } from "@/contexts/Auth";
import { use } from "react";

const MainLayout = () => {
    const { user, loading } = use(AuthContext);
    const plan = user?.subscription?.plan;

    if(loading){
        return <p>Loading...</p>
    }

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
                    {!(user?.role === "customer" && user?.team_id) && (
                        <NavLink to="/pricing"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md ${isActive
                                    ? "bg-black text-white font-semibold"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`
                            }>Pricing</NavLink>
                    )}
                </div>
                <div className="flex items-center">
                    <p className="mr-6">{`Plan: ${plan === "basic" ? "Basic" : plan === "pro" ? "Pro" : "Plus"}`}</p>
                    <ProfilePopover />
                </div>
            </header>
            <div className="flex h-screen">
                <aside className="w-64 border-r bg-gray-50 p-4 gap-2 flex flex-col">
                    <NavLink to="/" className={({ isActive }) =>
                        `px-4 py-2 rounded-md ${isActive
                            ? "bg-black text-white font-semibold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                    }>Dashboard</NavLink>
                    <NavLink to="/subscription" className={({ isActive }) =>
                        `px-4 py-2 rounded-md ${isActive
                            ? "bg-black text-white font-semibold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}>Subscription</NavLink>
                </aside>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout;