import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [done, setDone]             = useState(false);
  const [errors, setErrors]         = useState({});

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      await api.get(`Users/reset-password/validate/${token}/`);
      setTokenValid(true);
    } catch {
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8)              score++;
    if (/[A-Z]/.test(pw))           score++;
    if (/[0-9]/.test(pw))           score++;
    if (/[^A-Za-z0-9]/.test(pw))   score++;
    return score; // 0-4
  };

  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["bg-red-500", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const strength      = getStrength(password);

  const validate = () => {
    const e = {};
    if (password.length < 8)      e.password = "Password must be at least 8 characters";
    if (password !== confirm)     e.confirm  = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("Users/reset-password/", { token, password });
      setDone(true);
    } catch (err) {
      setErrors({ general: err.response?.data?.error || "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Loading token validation ──
  if (validating) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-amber-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-gray-500 text-sm">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ──
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Link expired</h2>
          <p className="text-gray-400 text-sm mb-8">
            This password reset link is invalid or has expired. Reset links are valid for 24 hours.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm rounded-xl transition-all text-center"
          >
            Request a new link
          </Link>
          <Link to="/login" className="block mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ──
  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Password updated!</h2>
          <p className="text-gray-400 text-sm mb-8">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm rounded-xl transition-all text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Main reset form ──
  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/5" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-white/[0.02]" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/30 to-transparent" />

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

        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Create a new<br />
            <span className="text-amber-400">secure password</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            Choose a strong password with a mix of letters, numbers, and symbols to keep your account safe.
          </p>

          {/* Tips */}
          <div className="mt-10 space-y-3">
            {[
              "At least 8 characters long",
              "At least one uppercase letter",
              "At least one number",
              "At least one special character",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-400/10 border border-amber-400/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-400">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© 2026 Nexus Terminal. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-black text-sm">N</span>
              </div>
              <span className="text-white font-bold">NEXUS Terminal</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Set new password</h1>
            <p className="text-gray-500 text-sm">Make sure it's something you'll remember.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* General error */}
            {errors.general && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* New password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="Enter new password"
                  autoFocus
                  className={`w-full pl-11 pr-12 py-3.5 bg-gray-900 border ${
                    errors.password ? "border-red-500" : "border-gray-800"
                  } rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all`}
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength >= i ? strengthColor[strength] : "bg-gray-800"
                      }`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${
                    strength <= 1 ? "text-red-400" : strength === 2 ? "text-amber-400" : strength === 3 ? "text-blue-400" : "text-emerald-400"
                  }`}>{strengthLabel[strength]}</p>
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <input
                  type={showCf ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
                  placeholder="Repeat your password"
                  className={`w-full pl-11 pr-12 py-3.5 bg-gray-900 border ${
                    errors.confirm ? "border-red-500"
                    : confirm && confirm === password ? "border-emerald-500"
                    : "border-gray-800"
                  } rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all`}
                />
                <button type="button" onClick={() => setShowCf((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300">
                  {showCf
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>

              {/* Match indicator */}
              {confirm.length > 0 && (
                <p className={`text-xs mt-1.5 font-medium ${confirm === password ? "text-emerald-400" : "text-red-400"}`}>
                  {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
              {errors.confirm && !confirm.length && (
                <p className="text-red-400 text-xs mt-1.5">{errors.confirm}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Updating...
                </>
              ) : "Reset Password"}
            </button>

            <div className="text-center pt-1">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}