import './App.css';
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from './pages/auth';
import Dashboard from './pages/dashboard';
import Pricing from './components/pricing/Pricing';
import MainLayout from './components/layouts/MainLayout';
import AuthProvider from './contexts/Auth';

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
