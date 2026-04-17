import type { IUser } from "@/types";
import { createContext, useState, type PropsWithChildren } from "react";
import Cookies from 'js-cookie';
import {jwtDecode} from "jwt-decode";


interface IAuthContext {
    getUser: () => IUser;
    setUser: React.Dispatch<any>
}

export const AuthContext = createContext<IAuthContext>(null);

const AuthProvider = ({children}: PropsWithChildren) => {
    const [user, setUser] = useState(null);

    const getUser = () => {
        if(user){
            return user;
        }

        const token = Cookies.get("token");
        if(!token){
            return;
        }
        const decoded: any = jwtDecode(token);

        if(decoded){
            const user = decoded?.user;
            setUser(user);

            return user;
        }

        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                getUser,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;