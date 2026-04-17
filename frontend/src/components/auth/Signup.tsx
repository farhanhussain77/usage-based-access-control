import { Button } from "@/components/ui/Button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, type ChangeEvent, type SubmitEvent } from "react"

interface IProps {
    onChangeMode: () => void
}

const Signup = ({onChangeMode}: IProps) => {
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirm_password: ''
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

        // password and confirm should match
        if(form.password !== form.confirm_password) return;

        //todo: call API for creating user.
        console.log("form data", form);
        const response = await fetch(import.meta.env.VITE_API_URL + '/auth/create', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: form.email,
                password: form.password
            })
        });

        if(!response.ok){
            const error = await response.json();
            console.log("error", error.message);
        }

        const result = await response.json();
        console.log("user created:", result);
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardAction>
                    <Button onClick={onChangeMode} variant="link">Login</Button>
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

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                            </div>
                            <Input 
                                name="confirm_password" 
                                id="confirm_password" 
                                type="password" 
                                required 
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="mt-4 w-full">
                        Signup
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Signup;

