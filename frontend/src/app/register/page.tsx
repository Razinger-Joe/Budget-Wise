"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Wallet, CheckCircle } from "lucide-react";
import { authAPI } from "@/lib/api";

const STEPS = [
  "Automated 50/15/15/20 wealth splitting on every income",
  "AI-powered financial advisor built on Claude",
  "Emergency vault with locking protection",
  "Legacy Score — gamified financial health rating",
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authAPI.register(email, password, fullName);
      const res = await authAPI.login(email, password);
      localStorage.setItem("access_token", res.data.access_token);
      if (res.data.refresh_token) localStorage.setItem("refresh_token", res.data.refresh_token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f4f4" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: "var(--sidebar)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Budget-Wise</h1>
              <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Smart Finance Platform</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Start your<br />wealth journey today.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              Create a free account and get instant access to Kenya's most intelligent personal finance platform.
            </p>
          </div>

          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-white/70 shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="border-t mb-6" style={{ borderColor: "rgba(255,255,255,0.12)" }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 Budget-Wise · Nairobi, Kenya · All rights reserved
          </p>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Budget-Wise</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create account</h2>
            <p className="text-sm text-muted-foreground mt-1">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="mb-5 p-3 border border-red-300 bg-red-50 text-sm text-[#da1e28]">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="e.g. Jane Wanjiku"
                required
                className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full border border-[var(--border)] bg-white px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = Math.min(4, Math.floor(password.length / 3));
                    return (
                      <div
                        key={i}
                        className="h-1 flex-1 transition-colors"
                        style={{
                          background: i < strength
                            ? strength <= 1 ? "#da1e28" : strength <= 2 ? "#f1c21b" : "#006A4E"
                            : "#e8e8e8"
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className="p-3 border text-xs text-muted-foreground leading-relaxed"
              style={{ background: "#f4f4f4", borderColor: "var(--border)" }}
            >
              By creating an account, you agree to Budget-Wise&apos;s{" "}
              <a href="#" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>Privacy Policy</a>.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
              style={{ background: "var(--primary)" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
