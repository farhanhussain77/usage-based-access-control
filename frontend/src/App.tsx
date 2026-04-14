import './App.css';
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from './pages/auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
