import { Button } from "@/components/ui/Button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";

interface IProps {
    onChangeMode: () => void
}

const Login = ({onChangeMode}: IProps) => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: form.email,
                password: form.password
            })
        });

        const result = await response.json();

    if (!response.ok) {
        console.log("error", result.message);
        return;
    }

        Cookies.set('token', result.token);

        const role = result.user.role;
        const subscription = result.user.subscription;
        console.log("subscription =", subscription);

        if ( role === "superadmin") {
            navigate("/admin/users");
        } else if(role === "admin"){
            navigate("/pricing");
        }else {
            navigate("/");
        }

    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
                <CardAction>
                    <Button onClick={onChangeMode} variant="link">Sign Up</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                onChange={onChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <Input 
                                name="password"
                                id="password" 
                                type="password" 
                                required 
                                onChange={onChange}
                            />
                        </div>
                        <Button type="submit" className="MT-4 w-full">
                            Login   
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default Login;

