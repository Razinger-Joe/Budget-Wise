"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, ShoppingBag, Lock, PiggyBank, Home, HeartPulse,
  PartyPopper, LineChart, ShoppingCart, Utensils, Car, Tv,
  Heart, Shirt, Lightbulb, MoreHorizontal, Sparkles,
  ArrowDownRight, ArrowUpRight, Activity, AlertCircle,
  RefreshCw, ChevronRight, Zap,
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

      {/* ── Row 1: KPI Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        {[
          {
            label: "Total Income",
            value: fmt(totalIncome),
            icon: TrendingUp,
            change: "+8.2%",
            positive: true,
            color: "#006A4E",
            bg: "#defbe6",
          },
          {
            label: "Total Expenses",
            value: fmt(totalExpenses),
            icon: ShoppingBag,
            change: "+3.1%",
            positive: false,
            color: "#da1e28",
            bg: "#fff1f1",
          },
          {
            label: "Net Savings",
            value: fmt(Math.max(0, netSavings)),
            icon: PiggyBank,
            change: netSavings >= 0 ? "On track" : "Over budget",
            positive: netSavings >= 0,
            color: "#0043ce",
            bg: "#edf5ff",
          },
          {
            label: "Emergency Vault",
            value: fmt(Number(balances.emergency || 0)),
            icon: Lock,
            change: "Locked",
            positive: true,
            color: "#6929c4",
            bg: "#f6f2ff",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-[var(--border)] p-4 hover:shadow-md transition-shadow"
              style={{ borderLeft: `3px solid ${card.color}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-sm"
                  style={{ background: card.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
                <span
                  className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded-sm ${
                    card.positive ? "tag-green" : "tag-red"
                  }`}
                >
                  {card.positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {card.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{card.label}</p>
              <p className="font-mono text-lg font-bold text-foreground leading-tight">
                {card.value}
              </p>
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

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)]">
          {/* Table header */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p className="section-label">Recent Movements</p>
            </div>
            <a
              href="/expenses"
              className="text-xs font-semibold flex items-center gap-1 hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View all <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {/* Table */}
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Add your first expense to see movements here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentExpenses.map((tx, i) => {
                const Icon = categoryIcons[tx.category] || MoreHorizontal;
                const dateStr = new Date(tx.date_spent).toLocaleDateString("en-KE", {
                  day: "numeric", month: "short", year: "numeric",
                });
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f4f4f4] transition-colors cursor-default"
                  >
                    <div className="w-8 h-8 rounded-sm bg-red-50 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#da1e28]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {tx.category} · {tx.bucket_source} · {dateStr}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-bold text-[#da1e28]">
                        − KSH {Number(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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

    </div>
  );
}
