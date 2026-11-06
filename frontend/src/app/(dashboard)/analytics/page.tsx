"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  Calendar, AlertCircle,
} from "lucide-react";
import { analyticsAPI } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const CATEGORY_META: Record<string, { color: string; bg: string }> = {
  food:          { color: "#8c6400", bg: "#fcf4d6" },
  transport:     { color: "#0043ce", bg: "#edf5ff" },
  entertainment: { color: "#6929c4", bg: "#f6f2ff" },
  health:        { color: "#da1e28", bg: "#fff1f1" },
  clothing:      { color: "#9f1853", bg: "#fff0f7" },
  utilities:     { color: "#006A4E", bg: "#defbe6" },
  rent:          { color: "#1192e8", bg: "#e8f4fd" },
  dining:        { color: "#ff832b", bg: "#fff2e8" },
  other:         { color: "#6f6f6f", bg: "#e8e8e8" },
};

const fmt = (n: number) => `KSH ${Number(n).toLocaleString()}`;

type MonthData = { month: string; income: number; expenses: number };
type CatData   = { name: string; amount: number; pct: number; color: string };

/* Custom tooltip for BarChart */
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[var(--border)] p-3 text-xs shadow-md min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-mono font-bold" style={{ color: p.fill }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* Custom tooltip for PieChart */
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-[var(--border)] p-3 text-xs shadow-md">
      <p className="font-semibold capitalize mb-1">{d.name}</p>
      <p className="font-mono font-bold" style={{ color: d.payload.color }}>{fmt(d.value)}</p>
      <p className="text-muted-foreground">{d.payload.pct}% of spending</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [categories,  setCategories]  = useState<CatData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState<"overview" | "categories">("overview");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          analyticsAPI.monthlySummary(),
          analyticsAPI.categoryBreakdown(),
        ]);
        setMonthlyData(mRes.data);
        setCategories(
          (cRes.data as any[]).map((c: any) => ({
            ...c,
            color: CATEGORY_META[c.name?.toLowerCase()]?.color || "#6f6f6f",
          }))
        );
      } catch (e) {
        console.error("Analytics fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const current  = monthlyData.at(-1) ?? { month: "—", income: 0, expenses: 0 };
  const previous = monthlyData.at(-2) ?? { month: "—", income: 0, expenses: 0 };

  const incomeChg  = previous.income  ? ((current.income  - previous.income)  / previous.income  * 100).toFixed(1) : "0.0";
  const expenseChg = previous.expenses ? ((current.expenses - previous.expenses) / previous.expenses * 100).toFixed(1) : "0.0";
  const netSavings = current.income - current.expenses;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>
        <div className="h-80 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── TaifaCare Surveillance Header ────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="emr-indicator-code">SURVEILLANCE MOH-711</span>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Treasury Epidemiology & Monthly Surveillance
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
          REPORTING INTERVAL: MONTHLY COHORT AUDIT
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        {[
          {
            label: "Income Trend",
            value: `${Number(incomeChg) >= 0 ? "+" : ""}${incomeChg}%`,
            icon: TrendingUp,
            positive: Number(incomeChg) >= 0,
            sub: `vs ${previous.month || "last month"}`,
          },
          {
            label: "Expense Trend",
            value: `${Number(expenseChg) >= 0 ? "+" : ""}${expenseChg}%`,
            icon: TrendingDown,
            positive: Number(expenseChg) <= 0,
            sub: `vs ${previous.month || "last month"}`,
          },
          {
            label: "Net Savings",
            value: fmt(Math.abs(netSavings)),
            icon: BarChart3,
            positive: netSavings >= 0,
            sub: netSavings >= 0 ? "Surplus this month" : "Deficit this month",
          },
        ].map((c) => {
          const Icon = c.icon;
          const color  = c.positive ? "#006A4E" : "#da1e28";
          const bg     = c.positive ? "#defbe6"  : "#fff1f1";
          return (
            <div
              key={c.label}
              className="bg-white border border-[var(--border)] p-4"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
              </div>
              <p className="font-mono text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-0 border border-[var(--border)] animate-fade-up-delay-1 w-fit">
        {(["overview", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors capitalize"
            style={
              activeTab === tab
                ? { background: "var(--primary)", color: "white" }
                : { background: "white", color: "var(--muted-foreground)" }
            }
          >
            {tab === "overview" ? <BarChart3 className="h-4 w-4" /> : <PieChartIcon className="h-4 w-4" />}
            {tab === "overview" ? "Overview" : "Categories"}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="bg-white border border-[var(--border)] animate-fade-up" style={{ borderTop: `3px solid var(--primary)` }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <div>
              <p className="section-label">Income vs Expenses</p>
              <p className="text-xs text-muted-foreground">Monthly comparison trend</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold tag-blue px-2 py-1">
              <Calendar className="h-3 w-3" /> Last 6 Months
            </span>
          </div>

          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No data available yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add income and expense entries to see analytics</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e8e8" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#6f6f6f", fontFamily: "IBM Plex Sans" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#6f6f6f", fontFamily: "IBM Plex Mono" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      width={48}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "#f4f4f4" }} />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px", fontSize: "12px", fontFamily: "IBM Plex Sans" }}
                    />
                    <Bar dataKey="income"   name="Income"   fill="#006A4E" radius={[2, 2, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expenses" name="Expenses" fill="#da1e28" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories tab */}
      {activeTab === "categories" && (
        <div className="bg-white border border-[var(--border)] animate-fade-up" style={{ borderTop: `3px solid #6929c4` }}>
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <p className="section-label">Spending by Category</p>
            <p className="text-xs text-muted-foreground">Breakdown of all expenses</p>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No category data yet</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Donut chart */}
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {categories.map((cat, i) => (
                        <Cell key={i} fill={cat.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend + bars */}
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: cat.color }} />
                        <span className="text-sm font-medium text-foreground capitalize">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">{fmt(cat.amount)}</span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5"
                          style={{ background: CATEGORY_META[cat.name]?.bg || "#e8e8e8", color: cat.color }}
                        >
                          {cat.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${cat.pct}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
