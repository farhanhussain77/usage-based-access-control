import { NavLink, useNavigate } from "react-router";
import { Outlet } from "react-router";
import Cookies from "js-cookie";

const AdminTeamLayout = () => {
    const navigate = useNavigate();

    const onLogout = () => {
        Cookies.remove("token");
        navigate("/auth");
    };

    return (
        <div className="flex h-screen">

            <aside className="w-64 border-r bg-gray-50 p-4 gap-2 flex flex-col justify-between">

                <div>

                    <p className="text-2xl">
                        MeterStack
                    </p>

                    <h1 className="text-xl font-bold mt-3 mb-6">
                        Team Dashboard
                    </h1>

                    <nav className="flex flex-col gap-2">

                        <NavLink to="/team/dashboard" className={({ isActive }) =>
                              `px-4 py-2 rounded-md ${
                                isActive
                                  ? "bg-black text-white font-semibold"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`
                            }>
                            Members
                        </NavLink>

                        <NavLink to="/team/subscription" className={({ isActive }) =>
                              `px-4 py-2 rounded-md ${
                                isActive
                                  ? "bg-black text-white font-semibold"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`
                            }>
                            Subscription
                        </NavLink>

                    </nav>

                </div>

                <button onClick={onLogout} className="p-2 text-sm bg-red-500 text-white rounded cursor-pointer">
                    Logout
                </button>

            </aside>

            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>

        </div>
    );
};

export default AdminTeamLayout;