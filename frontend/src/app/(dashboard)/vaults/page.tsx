"use client";

import { useState, useEffect } from "react";
import {
  Home, Shield, PartyPopper, LineChart,
  ArrowRightLeft, Lock, Unlock, TrendingUp,
  Target, Info, Plus, ChevronUp, AlertTriangle,
  CheckCircle2, Zap,
} from "lucide-react";
import { bucketAPI, rulesAPI } from "@/lib/api";

const VAULT_CONFIGS = [
  {
    id: "basic",
    label: "Basic Needs",
    subtitle: "Rent, Food, Utilities & Transport",
    icon: Home,
    target: 250000,
    color: "#0043ce",
    bg: "#edf5ff",
    locked: false,
    pct: 50,
  },
  {
    id: "emergency",
    label: "Emergency Vault",
    subtitle: "Safety net · Protected funds",
    icon: Shield,
    target: 1500000,
    color: "#6929c4",
    bg: "#f6f2ff",
    locked: true,
    pct: 15,
  },
  {
    id: "personal",
    label: "Personal Savings",
    subtitle: "Leisure, dining & lifestyle",
    icon: PartyPopper,
    target: 500000,
    color: "#8c6400",
    bg: "#fcf4d6",
    locked: false,
    pct: 15,
  },
  {
    id: "invest",
    label: "Investment Fund",
    subtitle: "Assets, stocks & wealth growth",
    icon: LineChart,
    target: 1000000,
    color: "#006A4E",
    bg: "#defbe6",
    locked: false,
    pct: 20,
  },
];

type Rule = {
  id: string;
  label: string;
  rule_type: string;
  target_bucket: string;
  is_active: boolean;
  value?: number;
};

const fmt = (n: number) => `KSH ${Number(n).toLocaleString()}`;

export default function VaultsPage() {
  const [balances, setBalances]     = useState<Record<string, number>>({});
  const [rules, setRules]           = useState<Rule[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  // Transfer state
  const [showTransfer, setShowTransfer] = useState(false);
  const [fromBucket, setFromBucket]     = useState("");
  const [toBucket, setToBucket]         = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Add rule state
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleLabel, setRuleLabel]       = useState("");
  const [ruleType, setRuleType]         = useState("percentage_income");
  const [ruleBucket, setRuleBucket]     = useState("invest");
  const [ruleValue, setRuleValue]       = useState("");
  const [savingRule, setSavingRule]     = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, rulesRes] = await Promise.all([
        bucketAPI.getBalances(),
        rulesAPI.list(),
      ]);
      setBalances(balRes.data);
      setRules(rulesRes.data);
    } catch {
      setError("Failed to load vaults data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTransfer = async () => {
    if (!fromBucket || !toBucket || !transferAmount) return;
    if (fromBucket === toBucket) { setError("Source and destination cannot be the same."); return; }
    setTransferring(true);
    setError("");
    try {
      await bucketAPI.transfer({ from_bucket: fromBucket, to_bucket: toBucket, amount: Number(transferAmount) });
      setShowTransfer(false);
      setFromBucket(""); setToBucket(""); setTransferAmount("");
      await fetchData();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Transfer failed.");
    } finally {
      setTransferring(false);
    }
  };

  const handleAddRule = async () => {
    if (!ruleLabel) { setError("Rule label is required."); return; }
    setSavingRule(true);
    setError("");
    try {
      await rulesAPI.create({
        label: ruleLabel,
        rule_type: ruleType,
        target_bucket: ruleBucket,
        value: ruleValue ? Number(ruleValue) : undefined,
      });
      setShowRuleForm(false);
      setRuleLabel(""); setRuleValue("");
      await fetchData();
    } catch {
      setError("Failed to create rule.");
    } finally {
      setSavingRule(false);
    }
  };

  const toggleRule = async (ruleId: string, current: boolean) => {
    try {
      await rulesAPI.toggle(ruleId, !current);
      await fetchData();
    } catch {
      setError("Failed to toggle rule.");
    }
  };

  const totalBalance = VAULT_CONFIGS.reduce((s, v) => s + (balances[v.id] || 0), 0);
  const totalTarget  = VAULT_CONFIGS.reduce((s, v) => s + v.target, 0);
  const overallPct   = totalTarget > 0 ? Math.round((totalBalance / totalTarget) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>
        <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 skeleton" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-3 border border-red-300 bg-red-50 text-sm text-[#da1e28]">
          <Info className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-auto text-xs underline" onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        {[
          { label: "Total Saved",   value: fmt(totalBalance), icon: TrendingUp, color: "#006A4E", bg: "#defbe6", sub: "across all vaults" },
          { label: "Total Target",  value: fmt(totalTarget),  icon: Target,     color: "#0043ce", bg: "#edf5ff", sub: "savings goal" },
          { label: "Overall Progress", value: `${overallPct}%`, icon: CheckCircle2, color: overallPct >= 50 ? "#006A4E" : "#8c6400", bg: overallPct >= 50 ? "#defbe6" : "#fcf4d6", sub: `${fmt(totalTarget - totalBalance)} remaining` },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white border border-[var(--border)] p-4"
              style={{ borderLeft: `3px solid ${c.color}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: c.bg }}>
                  <Icon className="h-4 w-4" style={{ color: c.color }} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
              </div>
              <p className="font-mono text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Vaults Section */}
      <div className="space-y-4 animate-fade-up-delay-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="emr-indicator-code">PROTOCOL MOH-720</span>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Custody Compartments & Reserve Allocations
            </h3>
          </div>
          <button
            onClick={() => setShowTransfer(!showTransfer)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-[var(--border)] bg-white text-foreground hover:bg-muted transition-colors rounded-none"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Inter-Vault Voucher
          </button>
        </div>

        {/* Transfer form (KenyaEMR Inter-Vault Protocol) */}
        {showTransfer && (
          <div className="bg-white border border-[var(--border)] animate-scale-in" style={{ borderTop: `3px solid #0043ce` }}>
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="emr-indicator-code">FORM MOH-720</span>
                  <p className="text-sm font-bold text-foreground">Inter-Vault Custody Transfer Voucher</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Reallocate capital reserves between designated asset compartments</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0043ce] bg-blue-50 border border-blue-200 px-2 py-1">
                INTERNAL TRANSFER
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">From</label>
                <select
                  className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                  value={fromBucket}
                  onChange={(e) => setFromBucket(e.target.value)}
                >
                  <option value="">Select source…</option>
                  {VAULT_CONFIGS.map((v) => (
                    <option key={v.id} value={v.id}>{v.label} ({fmt(balances[v.id] || 0)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">To</label>
                <select
                  className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                  value={toBucket}
                  onChange={(e) => setToBucket(e.target.value)}
                >
                  <option value="">Select destination…</option>
                  {VAULT_CONFIGS.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">Amount (KSH)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>
            </div>
            {fromBucket === "emergency" && (
              <div className="mx-6 mb-4 flex items-center gap-2 p-3 border border-[#f1c21b] bg-[#fcf4d6] text-sm text-[#8c6400]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Warning: Transferring from Emergency Vault reduces your financial safety net.
              </div>
            )}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleTransfer} disabled={transferring} className="px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-colors" style={{ background: "var(--primary)" }}>
                {transferring ? "Transferring…" : "Confirm Transfer"}
              </button>
              <button onClick={() => setShowTransfer(false)} className="px-5 py-2.5 text-sm font-semibold border border-[var(--border)] bg-white text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Vault cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VAULT_CONFIGS.map((vault, idx) => {
            const Icon = vault.icon;
            const balance = balances[vault.id] || 0;
            const progress = Math.min(100, Math.round((balance / vault.target) * 100));
            const vaultCode = `VAULT-0${idx + 1}`;
            return (
              <div
                key={vault.id}
                className="bg-white border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderTop: `3px solid ${vault.color}` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ background: vault.bg }}>
                        <Icon className="h-5 w-5" style={{ color: vault.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="emr-indicator-code">{vaultCode}</span>
                          <p className="text-sm font-bold text-foreground">{vault.label}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{vault.subtitle}</p>
                      </div>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 uppercase tracking-wider"
                      style={
                        vault.locked
                          ? { background: "#f6f2ff", color: "#6929c4" }
                          : { background: "#defbe6", color: "#006A4E" }
                      }
                    >
                      {vault.locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                      {vault.locked ? "Locked" : "Flexible"}
                    </span>
                  </div>

                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Balance</p>
                      <p className="font-mono text-2xl font-bold text-foreground">{fmt(balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-mono font-semibold text-muted-foreground">{fmt(vault.target)}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono font-semibold" style={{ color: vault.color }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%`, background: vault.color }}
                      />
                    </div>
                  </div>

                  {/* Allocation badge */}
                  <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Allocation</span>
                    <span className="font-mono text-xs font-bold" style={{ color: vault.color }}>{vault.pct}% of income</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Rules */}
      <div className="animate-fade-up-delay-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Automation Rules</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Configure savings automation triggers</p>
          </div>
          <button
            onClick={() => setShowRuleForm(!showRuleForm)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--primary)" }}
          >
            {showRuleForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showRuleForm ? "Close" : "Add Rule"}
          </button>
        </div>

        {/* Add rule form */}
        {showRuleForm && (
          <div className="bg-white border border-[var(--border)] animate-scale-in" style={{ borderTop: `3px solid var(--primary)` }}>
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
              <p className="text-sm font-semibold text-foreground">New Automation Rule</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">Rule Label <span className="text-[#da1e28]">*</span></label>
                <input type="text" placeholder="e.g. Round-up to Emergency" className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={ruleLabel} onChange={(e) => setRuleLabel(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">Rule Type</label>
                <select className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={ruleType} onChange={(e) => setRuleType(e.target.value)}>
                  <option value="percentage_income">Percentage of Income</option>
                  <option value="fixed_monthly">Fixed Monthly Top-up</option>
                  <option value="round_up">Round-up Transactions</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">Target Bucket</label>
                <select className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={ruleBucket} onChange={(e) => setRuleBucket(e.target.value)}>
                  {VAULT_CONFIGS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-foreground">Value (optional)</label>
                <input type="number" placeholder="e.g. 5 for 5%" className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleAddRule} disabled={savingRule} className="px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--primary)" }}>
                {savingRule ? "Saving…" : "Create Rule"}
              </button>
              <button onClick={() => setShowRuleForm(false)} className="px-5 py-2.5 text-sm font-semibold border border-[var(--border)] bg-white text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Rules list */}
        <div className="bg-white border border-[var(--border)]">
          <div className="px-5 py-3 border-b border-[var(--border)] bg-[#f4f4f4] flex justify-between items-center">
            <p className="section-label">Active Rules</p>
            <span className="text-xs text-muted-foreground">{rules.length} rules</span>
          </div>
          {rules.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <Zap className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No automation rules yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Use "Add Rule" to configure savings automation</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#f9f9f9] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`status-dot ${rule.is_active ? "active" : "paused"}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rule.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {rule.rule_type.replace(/_/g, " ")} → {rule.target_bucket}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id, rule.is_active)}
                    className="px-3 py-1.5 text-xs font-semibold border transition-colors"
                    style={
                      rule.is_active
                        ? { background: "#defbe6", color: "#006A4E", borderColor: "#a7f3d0" }
                        : { background: "#e8e8e8", color: "#6f6f6f", borderColor: "#c6c6c6" }
                    }
                  >
                    {rule.is_active ? "Active" : "Paused"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
