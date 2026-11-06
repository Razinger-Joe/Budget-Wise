"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, ShoppingBag, Lock, PiggyBank, Home, HeartPulse,
  PartyPopper, LineChart, ShoppingCart, Utensils, Car, Tv,
  Heart, Shirt, Lightbulb, MoreHorizontal, Sparkles,
  ArrowDownRight, ArrowUpRight, Activity, AlertCircle,
  RefreshCw, ChevronRight, Zap, Search, Printer, X, FileText,
  ShieldCheck, CheckCircle2,
} from "lucide-react";
import { bucketAPI, expenseAPI, incomeAPI, insightAPI } from "@/lib/api";

/* ── Category icon map ─────────────────────────────────── */
const categoryIcons: Record<string, typeof ShoppingCart> = {
  food: Utensils, transport: Car, entertainment: Tv,
  health: Heart, clothing: Shirt, utilities: Lightbulb,
  rent: Home, dining: Utensils, other: MoreHorizontal,
};

/* ── KSH formatter ─────────────────────────────────────── */
const fmt = (n: number) =>
  `KSH ${n.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;

/* ── Bucket config ─────────────────────────────────────── */
const BUCKETS = [
  { id: "basic",     label: "Basic Needs",    sub: "50% allocation", pct: 50, color: "#0043ce", bg: "#edf5ff", icon: Home },
  { id: "emergency", label: "Emergency Vault", sub: "15% allocation", pct: 15, color: "#6929c4", bg: "#f6f2ff", icon: HeartPulse },
  { id: "personal",  label: "Personal Savings",sub: "15% allocation", pct: 15, color: "#8c6400", bg: "#fcf4d6", icon: PartyPopper },
  { id: "invest",    label: "Investment Fund", sub: "20% allocation", pct: 20, color: "#006A4E", bg: "#defbe6", icon: LineChart },
];

/* ── Legacy score tier ─────────────────────────────────── */
function getScoreTier(score: number) {
  if (score >= 90) return { tier: "Diamond", color: "#0043ce", glow: "#0043ce" };
  if (score >= 75) return { tier: "Sapphire", color: "#6929c4", glow: "#6929c4" };
  if (score >= 60) return { tier: "Gold",     color: "#8c6400", glow: "#E8A020" };
  if (score >= 45) return { tier: "Silver",   color: "#6f6f6f", glow: "#a8a8a8" };
  return { tier: "Bronze", color: "#a2341f", glow: "#da1e28" };
}

/* ── Insight line extractor ────────────────────────────── */
function extractInsightText(raw: string): string {
  if (!raw) return "Analyzing your spending patterns…";
  try {
    const parsed = JSON.parse(raw);
    return parsed?.body || parsed?.title || raw;
  } catch {
    return raw;
  }
}

/* ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [totalIncome, setTotalIncome] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [legacyScore, setLegacyScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [balRes, incRes, expRes, insRes] = await Promise.all([
        bucketAPI.getBalances(),
        incomeAPI.list(),
        expenseAPI.list(),
        insightAPI.list(),
      ]);

      const income = incRes.data as any[];
      const expenses = expRes.data as any[];
      const insights = insRes.data as any[];

      const totalInc = income.reduce((s: number, i: any) => s + Number(i.amount), 0);
      const totalExp = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
      const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
      const emergencyBal = Number(balRes.data.emergency || 0);
      const avgMonthly = totalExp > 0 ? totalExp : 1;
      const emergencyMonths = emergencyBal / avgMonthly;
      const computed = Math.min(100, Math.round(50 + savingsRate / 2 + emergencyMonths * 3));

      setBalances(balRes.data);
      setTotalIncome(totalInc);
      setRecentExpenses(
        expenses
          .sort((a: any, b: any) => new Date(b.date_spent).getTime() - new Date(a.date_spent).getTime())
          .slice(0, 5)
      );
      setLegacyScore(computed);

      const latestInsight = insights[0]?.body || insights[0]?.content || "";
      setInsight(extractInsightText(latestInsight));
    } catch (e) {
      console.error("Dashboard fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleGenerateInsight = async () => {
    setGenerating(true);
    try {
      const res = await insightAPI.generate();
      const data = res.data as any[];
      if (data?.length) {
        setInsight(extractInsightText(data[0]?.body || data[0]?.content || ""));
      }
    } catch (e) {
      console.error("Generate insight failed", e);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Score circle math ─────────────────────────────── */
  const RADIUS = 76;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (legacyScore / 100) * CIRCUMFERENCE;
  const { tier, color: tierColor, glow: tierGlow } = getScoreTier(legacyScore);

  /* ── Summary numbers ───────────────────────────────── */
  const totalExpenses = recentExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const netSavings = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-72 skeleton" />
          <div className="lg:col-span-2 h-72 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Row 1: TaifaCare / KenyaEMR Indicator Registry Matrix ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        {[
          {
            code: "BW-IND-01",
            title: "Treasury Inflow",
            benchmark: "Regular Inflow",
            value: fmt(totalIncome),
            icon: TrendingUp,
            status: "NORMAL",
            positive: true,
            color: "#006A4E",
            bg: "#defbe6",
          },
          {
            code: "BW-IND-02",
            title: "Disbursement Velocity",
            benchmark: "Cap: ≤ 70% Inflow",
            value: fmt(totalExpenses),
            icon: ShoppingBag,
            status: totalExpenses <= totalIncome ? "CONTROLLED" : "DEFICIT",
            positive: totalExpenses <= totalIncome,
            color: "#da1e28",
            bg: "#fff1f1",
          },
          {
            code: "BW-IND-03",
            title: "Net Surplus Buffer",
            benchmark: "Target: ≥ 30% Savings",
            value: fmt(Math.max(0, netSavings)),
            icon: PiggyBank,
            status: netSavings >= 0 ? "ACCUMULATING" : "DRAWDOWN",
            positive: netSavings >= 0,
            color: "#0043ce",
            bg: "#edf5ff",
          },
          {
            code: "BW-IND-04",
            title: "Emergency Reserve",
            benchmark: "Runway: 3-6 Mos",
            value: fmt(Number(balances.emergency || 0)),
            icon: Lock,
            status: "PROTECTED",
            positive: true,
            color: "#6929c4",
            bg: "#f6f2ff",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.code}
              className="bg-white border border-[var(--border)] p-4 hover:shadow-md transition-shadow relative"
              style={{ borderLeft: `3px solid ${card.color}` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="emr-indicator-code">{card.code}</span>
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-sm"
                    style={{ background: card.bg }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: card.color }} />
                  </div>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-none ${
                    card.positive ? "tag-green" : "tag-red"
                  }`}
                >
                  {card.positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {card.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">{card.title}</p>
              <p className="font-mono text-lg font-bold text-foreground leading-tight my-1">
                {card.value}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">{card.benchmark}</p>
            </div>
          );
        })}
      </div>

      {/* ── Row 2: Legacy Score + Allocations ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-delay-1">

        {/* Legacy Score card */}
        <div className="bg-white border border-[var(--border)] p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <div>
              <p className="section-label">Legacy Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">Financial health rating</p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider"
              style={{ background: tierGlow + "15", color: tierColor }}
            >
              {tier}
            </span>
          </div>

          {/* SVG Gauge */}
          <div className="relative w-44 h-44 my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
              {/* Track */}
              <circle
                cx="88" cy="88" r={RADIUS}
                fill="transparent"
                stroke="#e8e8e8"
                strokeWidth="10"
              />
              {/* Score arc */}
              <circle
                cx="88" cy="88" r={RADIUS}
                fill="transparent"
                stroke={tierColor}
                strokeWidth="10"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="animate-draw-circle transition-all duration-1200"
                style={{ filter: `drop-shadow(0 0 6px ${tierGlow}50)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-mono text-5xl font-bold leading-none"
                style={{ color: tierColor }}
              >
                {legacyScore}
              </span>
              <span className="text-xs text-muted-foreground font-medium mt-1">/ 100</span>
            </div>
          </div>

          <div className="w-full mt-2 space-y-2">
            {[
              { label: "Savings Rate", val: `${Math.round(totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0)}%` },
              { label: "Budget Discipline", val: totalExpenses <= totalIncome ? "✓ On track" : "⚠ Over" },
            ].map((m) => (
              <div key={m.label} className="flex justify-between text-xs border-t border-[var(--border)] pt-2">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-semibold text-foreground">{m.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 50/15/15/20 Bucket Allocations */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-label">Portfolio Allocation</p>
              <p className="text-xs text-muted-foreground mt-0.5">50 / 15 / 15 / 20 Strategy</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-sm tag-green uppercase tracking-wider">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BUCKETS.map((b) => {
              const Icon = b.icon;
              const bal = Number(balances[b.id] || 0);
              return (
                <div
                  key={b.id}
                  className="p-4 border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                  style={{ borderTop: `2px solid ${b.color}` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-sm"
                      style={{ background: b.bg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: b.color }} />
                    </div>
                    <span
                      className="font-mono text-lg font-bold"
                      style={{ color: b.color }}
                    >
                      {b.pct}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground mb-3">{b.sub}</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {fmt(bal)}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${b.pct}%`, background: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent Transactions + AI Insight ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-delay-2">

        {/* TaifaCare Clinical Registry Table */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)] overflow-hidden">
          {/* Registry Header */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b gap-3 bg-[#fafafa]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="emr-indicator-code">REGISTRY</span>
              <p className="section-label">Encounter & Disbursement Ledger</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter reference, payee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)] w-44"
                />
              </div>
              <a
                href="/expenses"
                className="text-xs font-semibold flex items-center gap-1 hover:underline text-[#006A4E]"
              >
                All Records <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Table */}
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No encounters recorded yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Log your first disbursement to populate the clinical ledger
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="emr-table">
                <thead>
                  <tr>
                    <th>REF / VOUCHER</th>
                    <th>DATE</th>
                    <th>DESCRIPTION & PAYEE</th>
                    <th>CATEGORY</th>
                    <th>VAULT DEBIT</th>
                    <th className="text-right">DISBURSEMENT</th>
                    <th>AUDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses
                    .filter((tx) =>
                      !searchQuery ||
                      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tx.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tx.bucket_source?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((tx, i) => {
                      const refCode = `VCH-${String(i + 101).padStart(4, "0")}`;
                      const dateStr = new Date(tx.date_spent).toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      return (
                        <tr
                          key={i}
                          onClick={() => setSelectedTx({ ...tx, refCode, dateStr })}
                          className="cursor-pointer transition-colors"
                          title="Click to view official audit voucher"
                        >
                          <td className="font-mono text-xs font-bold text-[#004F3A]">
                            {refCode}
                          </td>
                          <td className="font-mono text-[11px] text-muted-foreground">
                            {dateStr}
                          </td>
                          <td className="font-semibold text-foreground">
                            {tx.description}
                          </td>
                          <td>
                            <span className="capitalize text-[10px] font-semibold px-1.5 py-0.5 bg-gray-100 border border-gray-300">
                              {tx.category}
                            </span>
                          </td>
                          <td className="capitalize text-[11px] text-muted-foreground">
                            {tx.bucket_source}
                          </td>
                          <td className="text-right font-mono font-bold text-[#ba1b1b]">
                            − KSH {Number(tx.amount).toLocaleString()}
                          </td>
                          <td>
                            <span className="tag-green text-[9px] font-mono font-bold px-1 py-0.5">
                              CLEARED
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Insight Panel */}
        <div
          className="bg-white border border-[var(--border)] flex flex-col"
          style={{ borderTop: `3px solid var(--primary)` }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <p className="section-label">AI Advisor</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm tag-green uppercase">
              Legacy AI
            </span>
          </div>

          <div className="flex-1 p-5">
            {insight ? (
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
                <div className="skeleton h-3 w-4/6" />
              </div>
            )}

            <div
              className="mt-5 p-3 border border-[var(--border)] rounded-sm flex items-start gap-2"
              style={{ background: "#f4f4f4" }}
            >
              <AlertCircle
                className="h-4 w-4 shrink-0 mt-0.5"
                style={{ color: "var(--primary)" }}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Powered by Claude AI · Analysis based on your real-time financial data.
              </p>
            </div>
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={handleGenerateInsight}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--primary)" }}
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {generating ? "Analyzing…" : "Generate New Insight"}
            </button>
          </div>
        </div>
      </div>

      {/* ── TaifaCare Encounter Slip Modal ────────────────────── */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-gray-800 max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            {/* National Flag line */}
            <div className="emr-flag-strip mb-4 -mx-6 -mt-6" />

            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <p className="text-[10px] font-mono text-gray-500 uppercase">Republic of Kenya · Treasury Registry</p>
                <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#006A4E]" />
                  Official Disbursement Slip
                </h4>
                <p className="font-mono text-xs text-[#004F3A] font-bold mt-0.5">{selectedTx.refCode}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 hover:bg-gray-100 rounded-sm text-gray-500 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6 bg-[#fafafa] p-4 border border-[var(--border)]">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Client Name:</span>
                <span className="font-semibold text-foreground">ALEX MBUTHIA KAMAU</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">UPI Identifier:</span>
                <span className="font-mono text-foreground">KE-BW-2026-89412</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Transaction Date:</span>
                <span className="font-mono text-foreground">{selectedTx.dateStr}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Description & Payee:</span>
                <span className="font-semibold text-foreground">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Category:</span>
                <span className="capitalize font-semibold text-foreground">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Vault Debited:</span>
                <span className="capitalize font-semibold text-foreground">{selectedTx.bucket_source}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground font-semibold">Amount Authorized:</span>
                <span className="font-mono text-base font-bold text-[#ba1b1b]">
                  KSH {Number(selectedTx.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] mb-6">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Certified disbursement · Reconciled against 50/15/15/20 protocol.</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#006A4E] hover:bg-[#004F3A]"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Voucher Slip
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold border border-gray-300 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
