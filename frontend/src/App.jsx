import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import OrderForm from './pages/OrderForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

/**
 * Main App Container managing screen routing using React Router
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen bg-background animate-in fade-in duration-300">
        <Routes>
          {/* Landing / Home page */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Auth screens */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Order placement screens */}
          <Route path="/place-order" element={<OrderForm />} />
          <Route path="/order" element={<Navigate to="/place-order" replace />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* Fallback redirection for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

