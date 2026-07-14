import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Signup Component for Jal Seva
 * Adheres strictly to the 3-color scheme:
 * 1. Light water blue (#4FC3F7) - accents, buttons, logo
 * 2. White (#FFFFFF) - background, card
 * 3. Warm brown (#3E2723) - headings, labels, secondary text
 */
function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Field validation checks
  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    if (!phone) {
      tempErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      tempErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!area.trim()) {
      tempErrors.area = 'Area/Locality is required';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate UI action delay (no backend API request yet)
    setTimeout(() => {
      setLoading(false);
      setSignupSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFFFF]">
      <div className="w-full max-w-md p-6 bg-[#FFFFFF] border border-[#3E2723]/30 rounded-xl shadow-md flex flex-col items-center">
        
        {/* Logo & Branding Section */}
        <div className="mb-6 text-center">
          <img
            alt="Jal Seva Logo"
            className="w-16 h-16 object-contain mb-2 mx-auto filter hue-rotate-[190deg]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOfW5NtncZ1w3PwW7WzQnH8BjGIOijsjQGZSVQwlDacSAtw78Os5hB69EhNLRXrSekrVa_tbltAT3v3mt3dI7P912PJ2lxI7YNj5lGD_dl0GU2OI3oThmsaKAmlWY5thUz_fwmvTMFlLGDpi-gntFr5FJlr3CPpBIWKsD34XTFhhuouFZMBVERa-jw6EVJKApqCmnDrown9LwPTPz2CduiCugMXwOT64y7i9Bd2K20XQ_1JQp2FlzFYyahNWcqysJ_U8fz8RSXqFA"
          />
          <h1 className="text-2xl font-bold text-[#3E2723] mb-1">Jal Seva</h1>
          <p className="text-sm text-[#3E2723]/80">Fresh water, delivered to your door</p>
        </div>

        {signupSuccess ? (
          <div className="w-full text-center space-y-4">
            <p className="text-base font-semibold text-[#3E2723]">
              Account created successfully! An OTP will be sent to verify your phone number (+91 {phone}).
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-opacity-90 active:scale-95 transition-all text-center outline-none focus:ring-2 focus:ring-[#4FC3F7]"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignupSubmit} className="w-full space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
                placeholder="John Doe"
              />
              {errors.name && (
                <span className="text-xs text-[#3E2723] mt-1 block font-semibold">
                  * {errors.name}
                </span>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Phone Number</label>
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
                <span className="text-xs text-[#3E2723] mt-1 block font-semibold">
                  * {errors.phone}
                </span>
              )}
            </div>

            {/* Area/Locality Field */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Area/Locality</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
                placeholder="Indiranagar"
              />
              {errors.area && (
                <span className="text-xs text-[#3E2723] mt-1 block font-semibold">
                  * {errors.area}
                </span>
              )}
            </div>

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center outline-none focus:ring-2 focus:ring-[#4FC3F7]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Login Link Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#3E2723]">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold hover:underline text-[#4FC3F7] outline-none"
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;
