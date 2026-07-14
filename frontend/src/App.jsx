import React, { useState } from 'react';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

/**
 * Main App Container managing screen routing
 */
function App() {
  const [view, setView] = useState('login'); // 'login' or 'signup'

  return (
    <div className="min-h-screen w-screen bg-background">
      {view === 'login' ? (
        <Login onNavigate={setView} />
      ) : (
        <Signup onNavigate={setView} />
      )}
    </div>
  );
}

export default App;
