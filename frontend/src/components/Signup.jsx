import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupRequest } from "../api/authService";

export default function Signup() {
  const [form, setForm]           = useState({ fullname: "", email: "", password: "" });
  const [showPassword, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState(null);

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signupRequest(form);
      showToast("OTP sent! Check your email.");
      setTimeout(() => navigate("/verify-otp", { state: { email: form.email } }), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Signup failed";
      setError(msg);
      showToast(msg, "error");
      setIsLoading(false);
    }
  };

  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8)             s++;
    if (/[A-Z]/.test(pw))          s++;
    if (/[0-9]/.test(pw))          s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    return s;
  };

  const strength      = getStrength(form.password);
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["bg-red-500", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const strengthText  = ["text-red-400", "text-red-400", "text-amber-400", "text-blue-400", "text-emerald-400"];

  const checks = [
    { label: "At least 8 characters",           pass: form.password.length >= 8 },
    { label: "Uppercase & lowercase letters",    pass: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) },
    { label: "Contains a number",               pass: /[0-9]/.test(form.password) },
    { label: "Contains a special character",    pass: /[^A-Za-z0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${
          toast.type === "success" ? "bg-gray-900 border border-gray-700" : "bg-red-500"
        }`}>
          {toast.type === "success"
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          }
          {toast.message}
        </div>
      )}

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
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Register your<br />
            <span className="text-amber-400">school today</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            Create your school admin account to get started with NEXUS Terminal's complete management suite.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {[
              "Manage students, teachers & parents",
              "Track attendance and exam results",
              "Handle fees and finance",
              "Built-in messaging system",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-400/10 border border-amber-400/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-400">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© 2026 Nexus Terminal. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-sm py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-sm">N</span>
            </div>
            <span className="text-white font-bold">NEXUS Terminal</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create account</h1>
            <p className="text-gray-500 text-sm">Register your school to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  name="fullname"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.fullname}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@school.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength >= i ? strengthColor[strength] : "bg-gray-800"
                      }`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strengthText[strength]}`}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}

              {/* Checks */}
              {form.password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {checks.map(({ label, pass }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        pass ? "bg-emerald-400/20 border border-emerald-400/40" : "bg-gray-800 border border-gray-700"
                      }`}>
                        {pass && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs transition-colors ${pass ? "text-emerald-400" : "text-gray-600"}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-gray-700 bg-gray-900 text-amber-400 focus:ring-amber-400/30 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-amber-400 hover:text-amber-300 font-semibold">Terms and Conditions</a>
                {" "}and{" "}
                <a href="#" className="text-amber-400 hover:text-amber-300 font-semibold">Privacy Policy</a>
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider + sign in */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium">HAVE AN ACCOUNT?</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <Link
            to="/login"
            className="block w-full py-3.5 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-semibold rounded-xl transition-all text-center"
          >
            Sign in instead
          </Link>

          <p className="text-center text-xs text-gray-700 mt-8">
            © 2026 Nexus Terminal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}