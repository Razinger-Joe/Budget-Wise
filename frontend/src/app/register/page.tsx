"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Wallet, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.register(email, password, fullName);
      const res = await authAPI.login(email, password);
      localStorage.setItem("access_token", res.data.access_token);
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/5 blur-[100px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-violet-400/5 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md rounded-2xl border border-border/60 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="font-display text-2xl font-extrabold text-foreground">
              Create your account
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Start your financial journey with Budget-Wise
            </p>
          </div>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 px-8 pb-8">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input id="name" placeholder="Alex Mbuthia" className="rounded-xl h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="rounded-xl h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="rounded-xl h-11 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all">
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>

            <Separator />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--primary)] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
