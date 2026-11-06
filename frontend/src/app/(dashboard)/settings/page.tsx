"use client";

import { useState, useEffect } from "react";
import {
  Settings, User, Shield, Bell, Database,
  CheckCircle2, AlertCircle, Save, RefreshCw, KeyRound,
  Sliders, Globe, Server
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "allocations" | "security" | "system">("profile");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState("Alex Mbuthia");
  const [email, setEmail] = useState("alex.mbuthia@example.ke");
  const [currency, setCurrency] = useState("KES");
  const [location, setLocation] = useState("Nairobi, Kenya");

  // Allocation state (50/15/15/20)
  const [basicPct, setBasicPct] = useState(50);
  const [emergencyPct, setEmergencyPct] = useState(15);
  const [personalPct, setPersonalPct] = useState(15);
  const [investPct, setInvestPct] = useState(20);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifVaultLock, setNotifVaultLock] = useState(true);
  const [notifMonthlyReport, setNotifMonthlyReport] = useState(true);

  const totalPct = basicPct + emergencyPct + personalPct + investPct;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetAllocations = () => {
    setBasicPct(50);
    setEmergencyPct(15);
    setPersonalPct(15);
    setInvestPct(20);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    setSavedSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="flex items-center gap-3 p-4 bg-[var(--success-light)] border border-[var(--success)] text-[var(--success)] text-sm animate-fade-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">Settings saved successfully.</span>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex border border-[var(--border)] bg-white w-fit">
        {[
          { id: "profile", label: "User Profile", icon: User },
          { id: "allocations", label: "Allocation Engine", icon: Sliders },
          { id: "security", label: "Security & Passwords", icon: KeyRound },
          { id: "system", label: "System & API", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={
                isActive
                  ? { background: "var(--primary)", color: "white" }
                  : { background: "white", color: "var(--muted-foreground)" }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white border border-[var(--border)] animate-fade-up" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <p className="section-label">User Information</p>
            <p className="text-xs text-muted-foreground">Manage your identity and regional preferences</p>
          </div>
          <form onSubmit={handleSaveProfile} className="p-6 space-y-5 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                  Currency Format
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="KES">KSH (Kenyan Shilling)</option>
                  <option value="USD">USD ($ United States)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)" }}
              >
                <Save className="h-3.5 w-3.5" />
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allocations Tab */}
      {activeTab === "allocations" && (
        <div className="bg-white border border-[var(--border)] animate-fade-up" style={{ borderTop: "3px solid #6929c4" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <div>
              <p className="section-label">50 / 15 / 15 / 20 Engine</p>
              <p className="text-xs text-muted-foreground">Automated percentage split for incoming revenue</p>
            </div>
            <button
              onClick={handleResetAllocations}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              <RefreshCw className="h-3 w-3" /> Reset Defaults
            </button>
          </div>
          <div className="p-6 space-y-6 max-w-2xl">
            <div className="space-y-4">
              {/* Basic */}
              <div className="p-4 border border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-foreground">Basic Needs Vault</span>
                  <span className="font-mono text-sm font-bold" style={{ color: "#0043ce" }}>{basicPct}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={basicPct}
                  onChange={(e) => setBasicPct(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#0043ce]"
                />
                <p className="text-xs text-muted-foreground mt-1">Covers rent, groceries, transport, utilities and daily sustenance.</p>
              </div>

              {/* Emergency */}
              <div className="p-4 border border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-foreground">Emergency Vault (Protected)</span>
                  <span className="font-mono text-sm font-bold" style={{ color: "#6929c4" }}>{emergencyPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={emergencyPct}
                  onChange={(e) => setEmergencyPct(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#6929c4]"
                />
                <p className="text-xs text-muted-foreground mt-1">Locked reserves ensuring 3-6 months resilience during crises.</p>
              </div>

              {/* Personal */}
              <div className="p-4 border border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-foreground">Personal Savings Vault</span>
                  <span className="font-mono text-sm font-bold" style={{ color: "#8c6400" }}>{personalPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={personalPct}
                  onChange={(e) => setPersonalPct(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#8c6400]"
                />
                <p className="text-xs text-muted-foreground mt-1">Flexible discretionary allocation for dining, lifestyle, and hobbies.</p>
              </div>

              {/* Investment */}
              <div className="p-4 border border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-foreground">Investment Fund</span>
                  <span className="font-mono text-sm font-bold" style={{ color: "#006A4E" }}>{investPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={investPct}
                  onChange={(e) => setInvestPct(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#006A4E]"
                />
                <p className="text-xs text-muted-foreground mt-1">Wealth generator for index funds, treasury bonds, stocks and equity.</p>
              </div>
            </div>

            {/* Total check */}
            <div className={`p-3 border flex items-center justify-between text-xs font-semibold ${
              totalPct === 100
                ? "bg-[var(--success-light)] border-[var(--success)] text-[var(--success)]"
                : "bg-[var(--warning-light)] border-[var(--warning)] text-[#8c6400]"
            }`}>
              <span>Total Allocation Split:</span>
              <span className="font-mono text-sm font-bold">{totalPct}% / 100%</span>
            </div>

            <button
              onClick={() => {
                if (totalPct === 100) {
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 3000);
                }
              }}
              disabled={totalPct !== 100}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40"
              style={{ background: "var(--primary)" }}
            >
              Update Allocation Matrix
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white border border-[var(--border)] animate-fade-up" style={{ borderTop: "3px solid #da1e28" }}>
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <p className="section-label">Account Security</p>
            <p className="text-xs text-muted-foreground">Update credentials and access authorizations</p>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-6 space-y-5 max-w-xl">
            {pwdError && (
              <div className="p-3 bg-[var(--destructive-light)] border border-[var(--destructive)] text-[var(--destructive)] text-xs font-medium">
                {pwdError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                New Password (minimum 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)]"
                required
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: "var(--primary)" }}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System & API Tab */}
      {activeTab === "system" && (
        <div className="bg-white border border-[var(--border)] animate-fade-up" style={{ borderTop: "3px solid #0f62fe" }}>
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <p className="section-label">System & Integrations</p>
            <p className="text-xs text-muted-foreground">Technical environment status and configurations</p>
          </div>
          <div className="p-6 space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[var(--border)] bg-[#fafafa]">
                <p className="text-xs font-semibold text-muted-foreground uppercase">API Base URL</p>
                <p className="font-mono text-xs font-bold text-foreground mt-1 break-all">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}
                </p>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[#fafafa]">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Frontend Framework</p>
                <p className="font-mono text-xs font-bold text-foreground mt-1">
                  Next.js 16.2 · React 19
                </p>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[#fafafa]">
                <p className="text-xs font-semibold text-muted-foreground uppercase">AI Engine</p>
                <p className="font-mono text-xs font-bold text-foreground mt-1">
                  Anthropic Claude 3.5 Sonnet
                </p>
              </div>
              <div className="p-4 border border-[var(--border)] bg-[#fafafa]">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Storage & Auth</p>
                <p className="font-mono text-xs font-bold text-foreground mt-1">
                  JWT Cookie & LocalStorage
                </p>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <p className="section-label mb-3">Notification Preferences</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.checked)}
                    className="accent-[var(--primary)] h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Email alerts when income is received</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifVaultLock}
                    onChange={(e) => setNotifVaultLock(e.target.checked)}
                    className="accent-[var(--primary)] h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Emergency vault withdrawal warning notices</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifMonthlyReport}
                    onChange={(e) => setNotifMonthlyReport(e.target.checked)}
                    className="accent-[var(--primary)] h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Monthly 50/15/15/20 financial audit report</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
