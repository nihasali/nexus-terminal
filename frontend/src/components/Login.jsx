import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginThunk } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [data, setData]           = useState({ email: "", password: "" });
  const [showPassword, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const resultAction = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(resultAction)) {
      const user = resultAction.payload.user;
      if (user.user_type === "school")        navigate("/Schooldashboard");
      else if (user.user_type === "teacher")  navigate("/teacher/dashboard");
      else if (user.user_type === "student")  navigate("/student/dashboard");
      else if (user.user_type === "parent")   navigate("/parent/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/5" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-white/[0.02]" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/30 to-transparent" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
              <span className="text-gray-900 font-black text-lg">N</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">NEXUS</p>
              <p className="text-gray-500 text-xs">Terminal</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Welcome back to<br />
            <span className="text-amber-400">NEXUS Terminal</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            Your all-in-one school management platform. Sign in to access your dashboard.
          </p>

          {/* Role indicators */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { icon: "🏫", label: "School Admin" },
              { icon: "👨‍🏫", label: "Teachers" },
              { icon: "🎓", label: "Students" },
              { icon: "👨‍👩‍👧", label: "Parents" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-gray-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© 2026 Nexus Terminal. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-sm">N</span>
            </div>
            <span className="text-white font-bold">NEXUS Terminal</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Sign in</h1>
            <p className="text-gray-500 text-sm">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={data.email}
                  onChange={handleChange}
                  placeholder="you@school.com"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-amber-400 focus:ring-amber-400/30 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium">NEW HERE?</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <Link
            to="/signup"
            className="block w-full py-3.5 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-semibold rounded-xl transition-all text-center"
          >
            Create a school account
          </Link>

          <p className="text-center text-xs text-gray-700 mt-8">
            © 2026 Nexus Terminal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}