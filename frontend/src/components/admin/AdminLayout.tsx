import { Outlet, useNavigate, NavLink } from "react-router";
import Cookies from "js-cookie";
import { use } from "react";
import { AuthContext } from "@/contexts/Auth";

const AdminLayout = () => {
    const { getUser } = use(AuthContext);
    const user = getUser();
    const navigate = useNavigate();

    const onLogout = () => {
        Cookies.remove("token");
        navigate("/auth");
    };

    // const isAdmin = user?.role === "admin" || user?.role === "superadmin";

    // if (!isAdmin) {
    //     return (
    //         <div className="h-screen flex items-center justify-center">
    //             <p className="text-red-600 font-semibold">
    //                 Access Denied
    //             </p>
    //         </div>
    //     );
    // }

    return (
        <div className="flex h-screen">
            <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col justify-between">
                <div>
                <p className="text-2xl">MeterStack</p>
                    <h1 className="text-xl font-bold mb-6 mt-3">Admin Panel</h1>
                    <nav className="flex flex-col gap-2">
                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) =>
                              `px-4 py-2 rounded-md ${
                                isActive
                                  ? "bg-black text-white font-semibold"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`
                            }
                        >
                            Users
                        </NavLink>
                        <NavLink
                            to="/admin/plans"
                            className={({ isActive }) =>
                              `px-4 py-2 rounded-md ${
                                isActive
                                  ? "bg-black text-white font-semibold"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`
                            }
                        >
                            Plans
                        </NavLink>
                    </nav>
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 text-sm bg-red-500 text-white rounded"
                >
                    Logout
                </button>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;