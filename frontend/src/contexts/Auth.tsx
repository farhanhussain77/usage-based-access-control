import { createContext, useEffect, useState, type PropsWithChildren } from "react";
import { readTokenFromCookie } from "@/lib/utils";
import { getCurrentUser } from "@/services/auth";


interface IAuthContext {
    user: any
    setUser: React.Dispatch<any>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export const AuthContext = createContext<IAuthContext>(null);

const AuthProvider = ({children}: PropsWithChildren) => {
    const [user, setUser] = useState(() => {
        const user = readTokenFromCookie();
        return user;
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!user) return;
        getCurrentUser()
        .then((user: any) => setUser(user))
        .catch(err => console.log("error while fetching user", err))
        .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                setLoading,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;