import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const TeamDashboard = () => {
    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [showInviteDrawer, setShowInviteDrawer] = useState(false);

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

    const removeMember = async (
        memberId: string
    ) => {
    
        const confirmed = window.confirm(
            "Remove this member?"
        );
    
        if (!confirmed) return;
    
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/team/admin/member/${memberId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    
        if (res.ok) {
            fetchTeam();
        }
    };

    return (
        <div className="p-8">
    
            {/* Top Header */}
            <div className="flex justify-between items-center mb-8">
    
                <div>
                    <h1 className="text-3xl font-bold">
                        Team Members
                    </h1>
    
                    <p className="text-gray-500 mt-1">
                        Manage members of your team
                    </p>
                </div>
    
                <button
                    onClick={() =>
                        setShowInviteDrawer(true)
                    }
                    className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
                >
                    Add Member
                </button>
    
            </div>
    
            <div className="grid grid-cols-2 gap-4 mb-8">

    <div className="border rounded-xl p-4">
        <p className="text-gray-500 text-sm">
            Team Name
        </p>

        <p className="font-semibold text-lg">
            {team?.name}
        </p>
    </div>

    <div className="border rounded-xl p-4">
        <p className="text-gray-500 text-sm">
            Members
        </p>

        <p className="font-semibold text-lg">
            {members.length} / 50
        </p>
    </div>

</div>
    
            {/* Members Table */}
    
            <div className="bg-white border rounded-xl overflow-hidden">
    
                <table className="w-full">
    
                    <thead className="bg-gray-50">
    
                        <tr>
                            <th className="text-left p-4">
                                Email
                            </th>
    
                            <th className="text-left p-4">
                                Role
                            </th>
    
                            <th className="text-left p-4">
                                Actions
                            </th>
                        </tr>
    
                    </thead>
    
                    <tbody>
    
                        {members.map((member) => (
                            <tr
                                key={member._id}
                                className="border-t"
                            >
                                <td className="p-4">
                                    {member.email}
                                </td>
    
                                <td className="p-4">
                                    {member.role}
                                </td>
    
                                <td className="p-4">
                                    <div className="flex gap-2">
                                    <button
                                        className="text-red-500 hover:bg-red-500 hover:text-white rounded-md p-2 cursor-pointer"
                                        onClick={() => removeMember(member._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
    
                    </tbody>
    
                </table>
    
            </div>
    
            {/* Drawer Backdrop */}
    
            {showInviteDrawer && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() =>
                        setShowInviteDrawer(false)
                    }
                />
            )}
    
            {/* Right Drawer */}
    
            <div
                className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-xl z-50 transition-transform duration-300 ${
                    showInviteDrawer
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
            >
    
                <div className="p-6">
    
                    <div className="flex justify-between items-center mb-6">
    
                        <h2 className="text-xl font-semibold">
                            Add Member
                        </h2>
    
                        <button
                            onClick={() =>
                                setShowInviteDrawer(false)
                            }
                        >
                            ✕
                        </button>
    
                    </div>
    
                    <div>
    
                        <label className="block text-sm mb-2">
                            Email
                        </label>
    
                        <input
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter email"
                            className="w-full border rounded-lg p-3"
                        />
    
                        <button
                            onClick={inviteMember}
                            className="w-full mt-4 bg-black text-white py-3 rounded-lg cursor-pointer"
                        >
                            Create Invite
                        </button>
    
                    </div>
    
                    {inviteLink && (
                        <div className="mt-8">
    
                            <h3 className="font-medium mb-2">
                                Invite URL
                            </h3>
    
                            <textarea
                                readOnly
                                value={inviteLink}
                                className="w-full border rounded-lg p-3 h-32"
                            />
    
                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        inviteLink
                                    )
                                }
                                className="mt-3 w-full border py-3 rounded-lg cursor-pointer"
                            >
                                Copy Link
                            </button>
    
                        </div>
                    )}
    
                </div>
    
            </div>
    
        </div>
    );
};

export default TeamDashboard;