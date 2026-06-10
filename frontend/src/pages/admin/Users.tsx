import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type User = {
    _id: string;
    name: string;
    email: string;
    role: "customer" | "admin" | "superadmin";
    status: "active" | "inactive";
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
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [search, setSearch] = useState("");

    const [adminForm, setAdminForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

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

    const deleteUser = async (userId: string) => {
        const confirmed = window.confirm(
            "Delete this user permanently?"
        );

        if (!confirmed) return;

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/${userId}/delete`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.ok) {
            fetchUsers();
        }
    };


    const disableUser = async (userId: string) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/${userId}/disable`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.ok) {
            fetchUsers();
        }
    };

    const createAdmin = async () => {
        if (
            adminForm.password !==
            adminForm.confirmPassword
        ) {
            alert("Passwords do not match");
            return;
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/create-admin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: adminForm.name,
                    email: adminForm.email,
                    password: adminForm.password
                })
            }
        );

        if (res.ok) {
            setShowCreateAdmin(false);

            setAdminForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            fetchUsers();
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowCreateAdmin(false);
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);


    const resetAdminForm = () => {
        setAdminForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        });
    };


    const closeCreateAdmin = () => {
        setShowCreateAdmin(false);
        resetAdminForm();
    };

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Users Management
                </h1>

                <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="bg-black text-white px-4 py-2 rounded cursor-pointer"
                >
                    Create Admin
                </button>
            </div>

            <div className="mb-4">
    <input
        type="text"
        placeholder="Filter By Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-64"
    />
</div>

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
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user) => {
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
                                        {user.role}
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

                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => disableUser(user._id)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded text-xs cursor-pointer"
                                        >
                                            Disable
                                        </button>

                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-xs cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showCreateAdmin && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center"
                    onClick={() => setShowCreateAdmin(false)}
                >
                    <div
                        className="bg-white p-6 rounded-lg w-[400px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">
                            Create Admin
                        </h2>

                        <div className="space-y-3">
                            <input
                                placeholder="Full Name"
                                value={adminForm.name}
                                onChange={(e) =>
                                    setAdminForm({
                                        ...adminForm,
                                        name: e.target.value
                                    })
                                }
                                className="border w-full p-2 rounded"
                            />
                            <input
                                placeholder="Email"
                                value={adminForm.email}
                                onChange={(e) =>
                                    setAdminForm({
                                        ...adminForm,
                                        email: e.target.value
                                    })
                                }
                                className="border w-full p-2 rounded"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={adminForm.password}
                                onChange={(e) =>
                                    setAdminForm({
                                        ...adminForm,
                                        password: e.target.value
                                    })
                                }
                                className="border w-full p-2 rounded"
                            />

                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={adminForm.confirmPassword}
                                onChange={(e) =>
                                    setAdminForm({
                                        ...adminForm,
                                        confirmPassword: e.target.value
                                    })
                                }
                                className="border w-full p-2 rounded"
                            />

                            <button
                                onClick={createAdmin}
                                className="bg-black text-white w-full py-2 rounded cursor-pointer"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;