import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── SVG droplet logo ── */
const DropletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L6 10C4 13 4 18 8 20.5C10 21.7 14 21.7 16 20.5C20 18 20 13 18 10L12 2Z"
      fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
  </svg>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/supplier-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (res.status === 401 || !res.ok) {
        throw new Error(
          res.status === 401
            ? 'Invalid email or password.'
            : data.message || 'Login failed. Please try again.'
        );
      }

      // Persist auth
      if (data.data?.session?.access_token) {
        localStorage.setItem('accessToken', data.data.session.access_token);
      }
      localStorage.setItem('userRole', 'supplier');
      sessionStorage.setItem('jalSeva_adminAuth', 'true');

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Background decorations */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: '#4FC3F7' }} />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-8" style={{ background: '#4FC3F7' }} />
      <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,60 Q360,120 720,60 Q1080,0 1440,60 L1440,120 L0,120 Z" fill="#4FC3F7" />
      </svg>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 25px 60px rgba(79,195,247,0.15), 0 8px 24px rgba(141,110,99,0.08)' }}
        >
          {/* Card header */}
          <div className="px-8 py-8 text-center" style={{ background: '#8D6E63' }}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: '#4FC3F7' }}
              >
                <DropletIcon />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Jal <span style={{ color: '#B3E5FC' }}>Seva</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Sign in to manage orders &amp; deliveries
            </p>
          </div>

          {/* Form body */}
          <div className="px-8 py-8 space-y-5">
            {error && (
              <div
                className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: '#FFF3F3', border: '1px solid #FFCDD2', color: '#C62828' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: '#8D6E63' }}>
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jalseva.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      border: '2px solid #E0E0E0',
                      background: '#FAFAFA',
                      color: '#8D6E63',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#4FC3F7'; e.target.style.background = '#fff'; }}
                    onBlur={(e)  => { e.target.style.borderColor = '#E0E0E0'; e.target.style.background = '#FAFAFA'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: '#8D6E63' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="admin-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      border: '2px solid #E0E0E0',
                      background: '#FAFAFA',
                      color: '#8D6E63',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#4FC3F7'; e.target.style.background = '#fff'; }}
                    onBlur={(e)  => { e.target.style.borderColor = '#E0E0E0'; e.target.style.background = '#FAFAFA'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#BCAAA4' }}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

{/* Submit */}
              <button
                id="admin-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: loading ? '#90CAF9' : '#4FC3F7',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(79,195,247,0.4)',
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.background = '#0288D1'; }}
                onMouseLeave={(e) => { if (!loading) e.target.style.background = '#4FC3F7'; }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign In to Admin Panel
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Back to site link */}
        <p className="text-center mt-6 text-sm" style={{ color: '#BCAAA4' }}>
          Not an admin?{' '}
          <a href="/" className="font-semibold transition-colors" style={{ color: '#4FC3F7' }}
            onMouseEnter={(e) => e.target.style.color = '#0288D1'}
            onMouseLeave={(e) => e.target.style.color = '#4FC3F7'}
          >
            Go to Jal Seva Home
          </a>
        </p>
      </div>
    </div>
  );
}
