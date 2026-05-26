import './App.css';
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from './pages/auth';
import Dashboard from './pages/dashboard';
import Pricing from './components/pricing/Pricing';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import AuthProvider from './contexts/Auth';
import AdminPlans from "./pages/admin/Plans";
import AdminTeamDashboard from './pages/team';
import Users from "./pages/admin/Users";
import TeamInvitePage from './pages/teamInvite';

//  const Teams = () => <div>Teams Page</div>;


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="users" element={<Users />} />
            <Route path="plans" element={<AdminPlans />} />
          </Route>
          <Route path="/adminteam" element={<AdminTeamDashboard />} />
          <Route path="/team-invite/:token" element={<TeamInvitePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
