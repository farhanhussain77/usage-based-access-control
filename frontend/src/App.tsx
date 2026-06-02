import './App.css';
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from './pages/auth';
import Dashboard from './pages/dashboard';
import Pricing from './components/pricing/Pricing';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import AdminTeamLayout from './components/admin/AdminTeamLayout';
import AuthProvider from './contexts/Auth';
import AdminPlans from "./pages/admin/Plans";
import TeamDashboard from './pages/team';
import Users from "./pages/admin/Users";
import TeamInvitePage from './pages/teamInvite';
import TeamSubscriptionPage from './pages/team/subscription';
import SubscriptionPage from './pages/dashboard/subscription';
import AdminStats from "./pages/admin/Stats";

//  const Teams = () => <div>Teams Page</div>;


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="users" element={<Users />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="plans" element={<AdminPlans />} />
          </Route>
          <Route path="/team" element={<AdminTeamLayout />}>
            <Route path="dashboard" element={<TeamDashboard />} />
            <Route path="subscription" element={<TeamSubscriptionPage />} />
          </Route>
          <Route path="/team-invite/:token" element={<TeamInvitePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
