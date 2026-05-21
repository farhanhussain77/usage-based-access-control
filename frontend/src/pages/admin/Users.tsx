import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type User = {
    _id: string;
    name: string;
    email: string;
    role: "customer" | "admin" | "superadmin";
    subscription: {
        plan: string;
        status: string;
        current_usage: number;
        max_usage_limit: number;
    };
};

const getUsagePercent = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
};

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");

    const fetchUsers = async () => {
        setLoading(true);

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (res.ok) {
            setUsers(data.users);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateRole = async (userId: string, role: string) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/${userId}/role`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            }
        );

        if (res.ok) {
            fetchUsers(); // refresh list
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Users Management</h1>

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Usage</th>
                            <th className="p-3">Limit</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => {
                            const percent = getUsagePercent(
                                user.subscription.current_usage,
                                user.subscription.max_usage_limit
                            );

                            return (
                                <tr key={user._id} className="border-t">
                                    <td className="p-3">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </td>

                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            disabled={user.role === "superadmin"}
                                            onChange={(e) =>
                                                updateRole(user._id, e.target.value)
                                            }
                                            className="border p-1 rounded"
                                        >
                                            <option value="customer">customer</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>

                                    <td className="p-3 capitalize">
                                        {user.subscription.plan}
                                    </td>

                                    <td className="p-3">
                                        {user.subscription.status}
                                    </td>

                                    <td className="p-3 w-48">
                                        <div className="w-full bg-gray-200 h-2 rounded">
                                            <div
                                                className="h-2 bg-blue-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs">
                                            {user.subscription.current_usage}/
                                            {user.subscription.max_usage_limit}
                                        </p>
                                    </td>

                                    <td className="p-3">
                                        {user.subscription.max_usage_limit}
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;