import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Cookies from "js-cookie";

const TeamInvitePage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [error, setError] = useState("");

    // 1. Validate invite on page load
    useEffect(() => {
        const validate = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/team/invite/${token}`
                );

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Invalid invite");
                    return;
                }

                setEmail(data.email);
            } catch (err) {
                setError("Something went wrong");
            } finally {
                setValidating(false);
            }
        };

        if (token) validate();
    }, [token]);

    // 2. Accept invite
    const handleAccept = async () => {
        if (!password) return;

        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/team/invite/accept`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token,
                        password
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
                return;
            }

            // optional: auto login or redirect
            // Cookies.remove("token");

            navigate("/");
        } catch (err) {
            setError("Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading invite...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-[400px] border p-6 rounded">
                <h1 className="text-xl font-bold mb-4">
                    Join Team
                </h1>

                <p className="text-sm mb-3 text-gray-600">
                    Email: <b>{email}</b>
                </p>

                <input
                    type="password"
                    placeholder="Set Password"
                    className="border p-2 w-full mb-3"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="bg-black text-white w-full p-2"
                >
                    {loading ? "Creating..." : "Accept Invite"}
                </button>
            </div>
        </div>
    );
};

export default TeamInvitePage;