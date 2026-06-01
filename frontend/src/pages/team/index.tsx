import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const AdminTeamDashboard = () => {
    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [loading, setLoading] = useState(false);

    const token = Cookies.get("token");

    const fetchTeam = async () => {
        setLoading(true);

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/team/admin`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (res.ok) {
            setTeam(data.team);
            setMembers(data.members);
            setSubscription(data.subscription);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const inviteMember = async () => {
        if (!email) return;

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/team/invite/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            }
        );

        const data = await res.json();

        if (res.ok) {
            setInviteLink(data.invite_url);
            setEmail("");
            fetchTeam();
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Team Dashboard</h1>
                    <p className="text-gray-500">
                        Manage your team and subscription
                    </p>
                </div>

                <div className="text-sm px-4 py-2 bg-gray-100 rounded">
                    Team: {team?.name || "N/A"}
                </div>
            </div>

            {/* Subscription Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                <div className="border rounded-xl p-4">
                    <p className="text-gray-500 text-sm">Plan</p>
                    <p className="text-xl font-semibold capitalize">
                        {subscription?.plan_id?.name || "N/A"}
                    </p>
                </div>

                <div className="border rounded-xl p-4">
                    <p className="text-gray-500 text-sm">Status</p>
                    <p className="text-xl font-semibold">
                        {subscription?.status || "inactive"}
                    </p>
                </div>

                <div className="border rounded-xl p-4">
                    <p className="text-gray-500 text-sm">Members</p>
                    <p className="text-xl font-semibold">
                        {members.length}
                    </p>
                </div>
            </div>

            {/* Invite Section */}
            <div className="border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">
                    Invite Team Member
                </h2>

                <div className="flex gap-2">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter user email"
                        className="border p-3 rounded w-full"
                    />

                    <button
                        onClick={inviteMember}
                        className="bg-black text-white px-5 rounded"
                    >
                        Send Invite
                    </button>
                </div>

                {inviteLink && (
                    <div className="mt-4 p-4 bg-gray-50 border rounded">
                        <p className="text-sm font-medium mb-2">
                            Invite Link
                        </p>

                        <div className="flex gap-2">
                            <input
                                value={inviteLink}
                                readOnly
                                className="border p-2 flex-1 rounded"
                            />

                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(inviteLink)
                                }
                                className="bg-black text-white px-4 rounded"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Members Section */}
            <div className="border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Team Members
                </h2>

                {loading ? (
                    <p>Loading...</p>
                ) : members.length === 0 ? (
                    <p className="text-gray-500">No members found</p>
                ) : (
                    <div className="space-y-2">
                        {members.map((m) => (
                            <div
                                key={m._id}
                                className="flex justify-between items-center border p-3 rounded"
                            >
                                <div>
                                    <p className="font-medium">
                                        {m.email}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {m.role}
                                    </p>
                                </div>

                                <button className="text-red-500 text-sm">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTeamDashboard;