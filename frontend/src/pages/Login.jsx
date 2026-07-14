import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Login Component for Jal Seva
 */
function Login() {
  const [mode, setMode] = useState('customer'); // 'customer' or 'supplier'
  const [customerStep, setCustomerStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canvasRef = useRef(null);
  const otpRefs = useRef([]);

  // WebGL shader wave background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(syncSize);
      observer.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    float wave1 = sin(uv.x * 3.0 + u_time * 0.5) * 0.05;
    float wave2 = sin(uv.x * 5.0 - u_time * 0.8) * 0.02;
    vec3 color1 = vec3(1.0, 1.0, 1.0);
    vec3 color2 = vec3(0.92, 0.98, 1.0);
    float y_threshold = 0.2 + wave1 + wave2;
    float dist = smoothstep(y_threshold - 0.05, y_threshold + 0.05, uv.y);
    vec3 finalColor = mix(color2, color1, dist);
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    let animationId;
    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      cancelAnimationFrame(animationId);
      if (observer) observer.disconnect();
    };
  }, []);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleCustomerAction = async () => {
    setError('');
    setSuccess('');

    if (customerStep === 'phone') {
      if (phone.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }

      setLoading(true);
      try {
        const fullPhone = `+91${phone}`;
        const response = await fetch(`${API_URL}/auth/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: fullPhone }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send OTP. Please try again.');
        }

        setCustomerStep('otp');
        setSuccess('OTP sent successfully!');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      const otpCode = otp.join('');
      if (otpCode.length < 4) {
        setError('Please enter the 4-digit verification code.');
        return;
      }

      setLoading(true);
      try {
        const fullPhone = `+91${phone}`;
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: fullPhone, token: otpCode }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Verification failed. Please check the OTP.');
        }

        // Store tokens
        if (data.data?.session?.access_token) {
          localStorage.setItem('accessToken', data.data.session.access_token);
        }
        setSuccess('Logged in successfully!');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSupplierLogin = async () => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/supplier-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Store tokens
      if (data.data?.session?.access_token) {
        localStorage.setItem('accessToken', data.data.session.access_token);
      }
      setSuccess('Supplier logged in successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-container-margin-mobile md:p-container-margin-desktop overflow-hidden relative">
      {/* Background Shader Wave Effect */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-40">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="login-card rounded-xl p-stack-lg soft-shadow flex flex-col items-center">
          
          {/* Logo Section */}
          <div className="mb-stack-lg text-center">
            <img
              alt="Jal Seva Logo"
              className="w-16 h-16 object-contain mb-stack-sm mx-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOfW5NtncZ1w3PwW7WzQnH8BjGIOijsjQGZSVQwlDacSAtw78Os5hB69EhNLRXrSekrVa_tbltAT3v3mt3dI7P912PJ2lxI7YNj5lGD_dl0GU2OI3oThmsaKAmlWY5thUz_fwmvTMFlLGDpi-gntFr5FJlr3CPpBIWKsD34XTFhhuouFZMBVERa-jw6EVJKApqCmnDrown9LwPTPz2CduiCugMXwOT64y7i9Bd2K20XQ_1JQp2FlzFYyahNWcqysJ_U8fz8RSXqFA"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Jal Seva</h1>
            <p className="text-sm text-on-surface-variant">Fresh water, delivered to your door</p>
          </div>

          {/* Segmented Control Switch */}
          <div className="w-full bg-surface-container rounded-full p-1 flex mb-stack-lg relative overflow-hidden">
            <div
              className="absolute h-[calc(100%-8px)] top-1 bg-white rounded-full transition-all duration-300 ease-in-out shadow-sm w-[calc(50%-4px)]"
              style={{ left: mode === 'customer' ? '4px' : 'calc(50% - 0px)' }}
            />
            <button
              className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === 'customer' ? 'text-primary' : 'text-outline'
              }`}
              onClick={() => switchMode('customer')}
            >
              Customer
            </button>
            <button
              className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === 'supplier' ? 'text-primary' : 'text-outline'
              }`}
              onClick={() => switchMode('supplier')}
            >
              Supplier
            </button>
          </div>

          {/* Forms Switch Container */}
          <div className="w-full relative min-h-[280px]">
            {mode === 'customer' ? (
              <div className="space-y-4 transition-all duration-300">
                {customerStep === 'phone' ? (
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant border-r border-outline-variant pr-2">
                        +91
                      </span>
                      <input
                        className="w-full pl-14 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base outline-none"
                        maxLength="10"
                        placeholder="9876543210"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant mb-1">Verification Code</label>
                    <div className="flex justify-between gap-2">
                      {otp.map((char, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          className="w-full h-14 text-center text-xl bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          maxLength="1"
                          type="text"
                          value={char}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        />
                      ))}
                    </div>
                    <p className="text-right mt-2 text-xs font-semibold uppercase tracking-wider text-primary cursor-pointer hover:underline">
                      Resend OTP
                    </p>
                  </div>
                )}

                <button
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
                  onClick={handleCustomerAction}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loader" />
                  ) : (
                    <span>{customerStep === 'phone' ? 'Send OTP' : 'Verify OTP'}</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 transition-all duration-300">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1">Business Email</label>
                  <input
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base"
                    placeholder="name@business.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1">Password</label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base pr-10"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-on-surface-variant">Remember me</span>
                  </label>
                  <a className="text-sm font-semibold text-secondary hover:underline" href="#">
                    Forgot?
                  </a>
                </div>

                <button
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
                  onClick={handleSupplierLogin}
                  disabled={loading}
                >
                  {loading ? <div className="loader" /> : <span>Login as Supplier</span>}
                </button>
              </div>
            )}
          </div>

          {/* Alert messages */}
          {error && (
            <div className="w-full mt-4 bg-error-container text-on-error-container p-3 rounded-lg flex items-center gap-2 animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="w-full mt-4 bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2 animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <a className="text-primary font-bold hover:underline" href="#">
                Sign Up
              </a>
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs uppercase tracking-wider text-on-surface-variant opacity-60">
          © 2024 Jal Seva Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
