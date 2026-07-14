import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import OrderForm from './pages/OrderForm.jsx';

/**
 * Main App Container managing screen routing using React Router
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen bg-background animate-in fade-in duration-300">
        <Routes>
          {/* Default landing page routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth screens */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Order placement screens */}
          <Route path="/place-order" element={<OrderForm />} />
          <Route path="/order" element={<Navigate to="/place-order" replace />} />
          
          {/* Fallback redirection for undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
