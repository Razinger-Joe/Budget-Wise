"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ShoppingBag,
  Lock,
  PiggyBank,
  Home,
  HeartPulse,
  PartyPopper,
  LineChart,
  ShoppingCart,
  Zap,
  Sparkles,
  ArrowDownRight,
  Edit,
  MoreHorizontal,
  Utensils,
  Car,
  Tv,
  Heart,
  Shirt,
  Lightbulb,
} from "lucide-react";
import { useState, useEffect } from "react";
import { bucketAPI, expenseAPI, incomeAPI, insightAPI } from "@/lib/api";

const categoryIcons: Record<string, typeof ShoppingCart> = {
  food: Utensils,
  transport: Car,
  entertainment: Tv,
  health: Heart,
  clothing: Shirt,
  utilities: Lightbulb,
  rent: Home,
  dining: Utensils,
  other: MoreHorizontal,
};

type DashboardData = {
  balances: Record<string, number>;
  totalIncome: number;
  recentExpenses: any[];
  insight: string;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [balancesRes, incomeRes, expensesRes, insightsRes] = await Promise.all([
          bucketAPI.getBalances(),
          incomeAPI.list(),
          expenseAPI.list(),
          insightAPI.list(),
        ]);

        const totalIncome = incomeRes.data.reduce((sum: number, item: any) => sum + item.amount, 0);
        
        // Sort expenses by date desc, get latest 3
        const recentExpenses = expensesRes.data
          .sort((a: any, b: any) => new Date(b.date_spent).getTime() - new Date(a.date_spent).getTime())
          .slice(0, 3);

        const latestInsight = insightsRes.data.length > 0 
          ? insightsRes.data[0].content 
          : "Analyzing your spending patterns to find new savings opportunities...";

        setData({
          balances: balancesRes.data,
          totalIncome,
          recentExpenses,
          insight: latestInsight,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-muted rounded-2xl"></div>
        <div className="h-64 bg-muted rounded-2xl"></div>
      </div>
    );
  }

  const buckets = [
    { label: "Basic Needs", pct: 50, amount: `KSH ${(data.balances.basic || 0).toLocaleString()}`, icon: Home, color: "#0ea5e9" },
    { label: "Emergency", pct: 15, amount: `KSH ${(data.balances.emergency || 0).toLocaleString()}`, icon: HeartPulse, color: "#8b5cf6" },
    { label: "Personal", pct: 15, amount: `KSH ${(data.balances.personal || 0).toLocaleString()}`, icon: PartyPopper, color: "#f59e0b" },
    { label: "Invest", pct: 20, amount: `KSH ${(data.balances.invest || 0).toLocaleString()}`, icon: LineChart, color: "#2563eb" },
  ];

  return (
    <>
      {/* ===== Hero section: Legacy Score + Summary Cards ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
        {/* Score card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow group">
          <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">
            Legacy Score
          </h3>
          <div className="relative w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <svg className="w-full h-full -rotate-90">
              <circle cx="88" cy="88" r="78" fill="transparent" stroke="var(--border)" strokeWidth="10" />
              <circle
                cx="88" cy="88" r="78" fill="transparent"
                stroke="var(--primary)" strokeWidth="10"
                strokeDasharray="490" strokeDashoffset="73.5"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,0.35))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl font-bold tracking-tighter text-foreground">85</span>
              <span className="text-[var(--primary)] text-xs font-bold uppercase">Sapphire Tier</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground text-center px-4">
            You are in the <span className="text-foreground font-bold">top 5%</span> of savers this month.
          </p>
        </Card>

        {/* Summary cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: "Total Income", value: `KSH ${data.totalIncome.toLocaleString()}`, icon: TrendingUp, badge: "ESTIMATED", color: "var(--primary)", borderColor: "border-l-[var(--primary)]" },
            { label: "Available to Spend", value: `KSH ${((data.balances.basic || 0) + (data.balances.personal || 0)).toLocaleString()}`, icon: ShoppingBag, badge: "UNSPENT", color: "#0ea5e9", borderColor: "border-l-sky-500" },
            { label: "Emergency Vault", value: `KSH ${(data.balances.emergency || 0).toLocaleString()}`, icon: Lock, badge: "LOCKED", color: "#8b5cf6", borderColor: "border-l-violet-500" },
            { label: "Personal Savings", value: `KSH ${(data.balances.personal || 0).toLocaleString()}`, icon: PiggyBank, badge: "FLEXIBLE", color: "#f59e0b", borderColor: "border-l-amber-500" },
          ].map((card, i) => (
            <Card
              key={card.label}
              className={`p-5 rounded-2xl border border-border/60 ${card.borderColor} border-l-4 shadow-sm hover:shadow-md transition-all animate-fade-up-delay-${i + 1}`}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon className="h-[18px] w-[18px]" style={{ color: card.color }} />
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold" style={{ color: card.color, backgroundColor: `${card.color}12` }}>
                  {card.badge}
                </Badge>
              </div>
              <div className="mt-5">
                <p className="text-muted-foreground text-sm font-medium mb-1">{card.label}</p>
                <h4 className="font-mono text-xl font-bold tracking-tight text-foreground">{card.value}</h4>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== Portfolio Allocation ===== */}
      <section className="animate-fade-up-delay-2 mt-6">
        <div className="flex items-end justify-between mb-6 px-1">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground">Portfolio Allocation</h3>
            <p className="text-muted-foreground text-sm">Active 50/15/15/20 Strategy for Wealth Building</p>
          </div>
          <Button variant="ghost" className="text-[var(--primary)] font-bold text-sm gap-1 hover:bg-[var(--primary)]/5">
            Edit Plan <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {buckets.map((b) => (
            <Card key={b.label} className="p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group" style={{ borderColor: `${b.color}30` }}>
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full transition-all blur-xl duration-500 group-hover:scale-150" style={{ backgroundColor: `${b.color}10` }} />
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${b.color}15` }}>
                  <b.icon className="h-5 w-5" style={{ color: b.color }} />
                </div>
                <span className="font-mono font-bold text-xl" style={{ color: b.color }}>{b.pct}%</span>
              </div>
              <h4 className="text-base font-bold mb-0.5 relative z-10 text-foreground">{b.label}</h4>
              <div className="mt-4 space-y-1 relative z-10">
                <p className="text-xs font-bold text-muted-foreground uppercase">Allocated</p>
                <p className="font-mono text-lg font-bold text-foreground">{b.amount}</p>
              </div>
              <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden relative z-10">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${b.pct}%`, backgroundColor: b.color, boxShadow: `0 0 8px ${b.color}50` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== Recent Transactions ===== */}
      <section className="animate-fade-up-delay-3 mt-6">
        <Card className="p-6 lg:p-8 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Recent Movements</h3>
            <Button variant="outline" className="text-xs font-bold uppercase tracking-wider rounded-xl h-9 px-4 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] hover:border-[var(--primary)]/30">
              View History
            </Button>
          </div>
          <div className="space-y-2">
            {data.recentExpenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent transactions found.</p>
            ) : (
              data.recentExpenses.map((tx, i) => {
                const Icon = categoryIcons[tx.category] || MoreHorizontal;
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors bg-red-500/8 group-hover:bg-red-500/15">
                        <Icon className="h-[18px] w-[18px] text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase">{tx.category} • {tx.date_spent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-mono font-bold text-sm text-red-500">
                        - KSH {tx.amount.toLocaleString()}
                      </p>
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </section>

      {/* ===== AI Insight Card ===== */}
      <section className="animate-fade-up-delay-4 mt-6">
        <Card className="p-6 rounded-2xl border border-[var(--primary)]/15 bg-gradient-to-br from-[var(--primary)]/[0.03] to-transparent shadow-sm relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[var(--primary)]/10 rounded-full blur-xl group-hover:bg-[var(--primary)]/20 transition-all duration-500 group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="h-6 w-6 text-[var(--primary)] drop-shadow-[0_0_6px_rgba(37,99,235,0.3)]" />
              <Badge className="text-[9px] uppercase tracking-widest font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/15 border-0">
                AI Insight
              </Badge>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {data.insight}
            </p>
          </div>
        </Card>
      </section>
    </>
  );
}
