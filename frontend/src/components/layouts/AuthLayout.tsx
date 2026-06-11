import { AuthContext } from "@/contexts/Auth";
import { use } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

const AuthLayout = () => {
    const { user } = use(AuthContext);
    const location = useLocation();
    if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
    return <Outlet />;
};

export default AuthLayout;
