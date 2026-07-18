import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import OrderForm from './pages/OrderForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

/**
 * Main App Container managing screen routing using React Router.
 * Customer-facing pages are wrapped with LanguageProvider for bilingual support.
 * Admin pages intentionally remain in English only.
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen bg-background animate-in fade-in duration-300">
        <Routes>
          {/* Customer-facing routes — wrapped with language support */}
          <Route path="/" element={<LanguageProvider><LandingPage /></LanguageProvider>} />
          <Route path="/dashboard" element={<LanguageProvider><Dashboard /></LanguageProvider>} />
          <Route path="/login" element={<LanguageProvider><Login /></LanguageProvider>} />
          <Route path="/signup" element={<LanguageProvider><Signup /></LanguageProvider>} />
          <Route path="/place-order" element={<LanguageProvider><OrderForm /></LanguageProvider>} />
          <Route path="/order" element={<Navigate to="/place-order" replace />} />

          {/* Admin routes — English only, no LanguageProvider */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
