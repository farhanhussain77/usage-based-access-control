import { useState } from "react";
import { Login, Signup } from "@/components/auth";


const Auth = () => {
    const [mode, setMode] = useState("sign_in");


    return (
        <section className="flex items-center justify-center h-screen">
            {mode === "sign_in" ? (
                <Login onChangeMode={() => setMode("sign_up")} />
            ):(
                <Signup onChangeMode={() => setMode("sign_in")} />
            )}
        </section>
    )
}

export default Auth;