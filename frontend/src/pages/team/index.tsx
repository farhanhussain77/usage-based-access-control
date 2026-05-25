import { useEffect, useState } from "react";
import Cookies from "js-cookie";


const AdminTeamDashboard = () => {

const [team, setTeam] = useState<any>(null);
const [members, setMembers] = useState<any[]>([]);
const [subscription, setSubscription] = useState<any>(null);
const [email, setEmail] = useState("");
const token = Cookies.get("token");



const fetchTeam = async () => {
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
};

useEffect(() => {
    fetchTeam();
}, []);


return (
    <div className="p-10">

        <h1 className="text-2xl font-bold">Team Dashboard</h1>

        {/* Subscription */}
        <div className="mt-4 p-4 border rounded">
            <p>Plan: {subscription?.plan_id?.name}</p>
            <p>Status: {subscription?.status}</p>
        </div>

        {/* Add Member */}
        <div className="mt-6 flex gap-2">
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email"
                className="border p-2"
            />
            <button  className="bg-black text-white px-4">
                Add
            </button>
        </div>

        {/* Members */}
        <div className="mt-6">
            <h2 className="font-semibold">Team Members</h2>

            {members.map((m) => (
                <div key={m._id} className="flex justify-between border p-2 mt-2">
                    <span>{m.email}</span>
                    <button >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    </div>
);

};

export default AdminTeamDashboard;