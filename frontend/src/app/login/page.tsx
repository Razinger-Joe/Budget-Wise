"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Wallet, Shield, TrendingUp, PiggyBank } from "lucide-react";
import { authAPI } from "@/lib/api";

const FEATURES = [
  { icon: TrendingUp, text: "50/15/15/20 auto-split strategy" },
  { icon: Shield,     text: "Emergency vault protection" },
  { icon: PiggyBank,  text: "AI-powered financial insights" },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem("access_token", res.data.access_token);
      if (res.data.refresh_token) localStorage.setItem("refresh_token", res.data.refresh_token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f4f4" }}>
      {/* Left panel — Kenya Green brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: "var(--sidebar)" }}
      >
        {/* Logo */}
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
              Your wealth,<br />intelligently managed.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              Join thousands of Kenyans building lasting wealth with the proven 50/15/15/20 allocation strategy.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium text-white/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div>
          <div className="border-t mb-6" style={{ borderColor: "rgba(255,255,255,0.12)" }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 Budget-Wise · Nairobi, Kenya · All rights reserved
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
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
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 border border-red-300 bg-red-50 text-sm text-[#da1e28]">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-medium hover:underline" style={{ color: "var(--primary)" }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
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
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
                Create one for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
