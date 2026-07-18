import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Login Component for Jal Seva — Customer only (phone + OTP).
 *
 * Post-OTP verification flow:
 *  1. Call POST /api/auth/verify-otp
 *  2. If signupName/signupArea exist in localStorage → user is new
 *     → call POST /api/users to create profile, then clear localStorage signup data
 *  3. Store accessToken + userRole=customer in localStorage
 *  4. Redirect to /dashboard
 */
function Login() {
  const navigate = useNavigate();

  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const canvasRef = useRef(null);

  // Pre-fill phone from signup flow if stored
  useEffect(() => {
    const savedPhone = localStorage.getItem('signupPhone');
    if (savedPhone) setPhone(savedPhone);
  }, []);

  /* ── WebGL shader wave background ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
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
    const uRes  = gl.getUniformLocation(prog, 'u_resolution');

    let animationId;
    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes)  gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      cancelAnimationFrame(animationId);
      if (observer) observer.disconnect();
    };
  }, []);

  /* ── Handle Submit ── */
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to login. Please check credentials.');

      // Store token
      const token = data.data?.session?.access_token;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      localStorage.setItem('userRole', 'customer');

      setSuccess('Logged in successfully!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-container-margin-mobile md:p-container-margin-desktop overflow-hidden relative">
      {/* Background Shader Wave */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-40">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="login-card rounded-xl p-stack-lg soft-shadow flex flex-col items-center">

          {/* Logo */}
          <div className="mb-stack-lg text-center">
            <img
              alt="Jal Seva Logo"
              className="w-16 h-16 object-contain mb-stack-sm mx-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOfW5NtncZ1w3PwW7WzQnH8BjGIOijsjQGZSVQwlDacSAtw78Os5hB69EhNLRXrSekrVa_tbltAT3v3mt3dI7P912PJ2lxI7YNj5lGD_dl0GU2OI3oThmsaKAmlWY5thUz_fwmvTMFlLGDpi-gntFr5FJlr3CPpBIWKsD34XTFhhuouFZMBVERa-jw6EVJKApqCmnDrown9LwPTPz2CduiCugMXwOT64y7i9Bd2K20XQ_1JQp2FlzFYyahNWcqysJ_U8fz8RSXqFA"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Jal Seva</h1>
            <p className="text-sm text-on-surface-variant">Fresh water, delivered to your door</p>
          </div>

          {/* Heading */}
          <div className="w-full mb-4 text-center">
            <p className="text-sm font-semibold text-on-surface-variant">
              Sign in to your customer account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant border-r border-outline-variant pr-2">
                  +91
                </span>
                <input
                  className="w-full pl-14 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base outline-none text-on-surface"
                  maxLength="10"
                  placeholder="9876543210"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                Password
              </label>
              <input
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base outline-none text-on-surface"
                placeholder="••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="loader" />
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Alerts */}
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

          {/* Footer links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-primary font-bold hover:underline outline-none"
              >
                Sign Up
              </button>
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
