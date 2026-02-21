import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("Users/forgot-password/", { email });
      setSent(true);
    } catch (err) {
      // Always show success even if email not found — security best practice
      // so attackers can't enumerate registered emails
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/5" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-white/[0.02]" />
        {/* Gold vertical accent */}
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
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Reset your<br />
            <span className="text-amber-400">password</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            Enter your registered email and we'll send you a secure link to reset your password.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-4">
            {[
              { step: "01", label: "Enter your email address" },
              { step: "02", label: "Check your inbox for the link" },
              { step: "03", label: "Click the link to set a new password" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-4">
                <span className="text-xs font-black text-amber-400/60 w-6 flex-shrink-0">{step}</span>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-sm text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© 2026 Nexus Terminal. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-sm">

          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-10">
                {/* Mobile logo */}
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                  <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                    <span className="text-gray-900 font-black text-sm">N</span>
                  </div>
                  <span className="text-white font-bold">NEXUS Terminal</span>
                </div>

                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Forgot password?</h1>
                <p className="text-gray-500 text-sm">No worries. We'll send a reset link to your email.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field */}
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
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      autoFocus
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-900 border ${
                        error ? "border-red-500" : "border-gray-800"
                      } rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all`}
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>

                {/* Back to login */}
                <div className="text-center pt-2">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.22 2.18 2 2 0 012.22 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </div>

              <h2 className="text-2xl font-black text-white mb-3">Check your inbox</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                If an account exists for <span className="text-white font-semibold">{email}</span>, a password reset link has been sent.
              </p>
              <p className="text-gray-600 text-xs mb-8">
                Didn't receive it? Check your spam folder or try again.
              </p>

              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full py-3 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium rounded-xl transition-all mb-3"
              >
                Try a different email
              </button>

              <Link
                to="/login"
                className="block w-full py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm rounded-xl transition-all text-center"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}