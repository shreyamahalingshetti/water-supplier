import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translations } from '../utils/translations.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Signup Component for Jal Seva — Customer registration.
 */
function Signup() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const tr = translations[language];

  // Signup states
  const [name, setName]                       = useState('');
  const [phone, setPhone]                     = useState('');
  const [area, setArea]                       = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI / Status states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  /* ── Validation ── */
  const validateForm = () => {
    const e = {};
    if (!name.trim())          e.name  = tr.signup_err_name;
    if (!phone)                e.phone = tr.signup_err_phone_req;
    else if (phone.length < 10) e.phone = tr.signup_err_phone_len;
    if (!area.trim())          e.area  = tr.signup_err_area;
    if (!password)             e.password = tr.signup_err_password_req;
    else if (password.length < 6) e.password = tr.signup_err_password_len;
    if (password !== confirmPassword) e.confirmPassword = tr.signup_err_confirm;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Handle Submit ── */
  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setApiError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${phone}`,
          password,
          name: name.trim(),
          area: area.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up. Please try again.');
      }

      // Store token and profile if returned
      const token = data.data?.session?.access_token;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      // Store the created profile for instant dashboard display
      const profile = data.data?.profile;
      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      } else {
        // Fallback: store what we know from the form
        localStorage.setItem('userProfile', JSON.stringify({
          name: name.trim(),
          area: area.trim(),
          phone: `+91${phone}`,
          role: 'customer'
        }));
      }
      localStorage.setItem('userRole', 'customer');

      setSuccess(tr.signup_success);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFFFF] relative">
      {/* Language Toggle floating top-right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-water-blue text-water-blue text-xs font-bold hover:bg-water-blue hover:text-white transition-all duration-200"
          style={{ borderColor: '#4FC3F7', color: '#4FC3F7' }}
        >
          🌐 <span>{tr.lang_current}</span>
          <span className="opacity-60">|</span>
          <span className="opacity-80">{tr.lang_toggle}</span>
        </button>
      </div>

      <div className="w-full max-w-md p-6 bg-[#FFFFFF] border border-[#3E2723]/30 rounded-xl shadow-md flex flex-col items-center animate-in fade-in duration-300">

        {/* Logo & Branding */}
        <div className="mb-6 text-center">
          <img
            alt={tr.brand_name}
            className="w-16 h-16 object-contain mb-2 mx-auto filter hue-rotate-[190deg]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOfW5NtncZ1w3PwW7WzQnH8BjGIOijsjQGZSVQwlDacSAtw78Os5hB69EhNLRXrSekrVa_tbltAT3v3mt3dI7P912PJ2lxI7YNj5lGD_dl0GU2OI3oThmsaKAmlWY5thUz_fwmvTMFlLGDpi-gntFr5FJlr3CPpBIWKsD34XTFhhuouFZMBVERa-jw6EVJKApqCmnDrown9LwPTPz2CduiCugMXwOT64y7i9Bd2K20XQ_1JQp2FlzFYyahNWcqysJ_U8fz8RSXqFA"
          />
          <h1 className="text-2xl font-bold text-[#3E2723] mb-1">{tr.brand_name}</h1>
          <p className="text-sm text-[#3E2723]/80">{tr.brand_tagline}</p>
        </div>

        <form onSubmit={handleSignup} className="w-full space-y-4">
          <h2 className="text-lg font-bold text-[#3E2723] text-center border-b border-[#3E2723]/20 pb-2">
            {tr.signup_title}
          </h2>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.signup_full_name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
              placeholder={tr.signup_full_name_placeholder}
            />
            {errors.name && (
              <span className="text-xs text-red-600 mt-1 block font-semibold">* {errors.name}</span>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.signup_phone}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#3E2723] border-r border-[#3E2723]/30 pr-2">
                +91
              </span>
              <input
                type="tel"
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-14 pr-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && (
              <span className="text-xs text-red-600 mt-1 block font-semibold">* {errors.phone}</span>
            )}
          </div>

          {/* Area / Locality */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.signup_area}</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
              placeholder={tr.signup_area_placeholder}
            />
            {errors.area && (
              <span className="text-xs text-red-600 mt-1 block font-semibold">* {errors.area}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.signup_password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
              placeholder="••••••"
            />
            {errors.password && (
              <span className="text-xs text-red-600 mt-1 block font-semibold">* {errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.signup_confirm_password}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
              placeholder="••••••"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-600 mt-1 block font-semibold">* {errors.confirmPassword}</span>
            )}
          </div>

          {/* Success and API error banners */}
          {success && (
            <div className="w-full bg-green-50 text-green-800 border border-green-200 p-3 rounded-lg flex items-center gap-2 animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {apiError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700 animate-in fade-in duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-[#0288D1] active:scale-95 transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-[#4FC3F7] shadow-md"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
            ) : (
              tr.signup_btn
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#3E2723]">
            {tr.signup_have_account}{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold hover:underline text-[#4FC3F7] outline-none"
            >
              {tr.signup_login}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;
