"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { analyticsAPI } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const categoryColors: Record<string, string> = {
  food: "#f59e0b",
  transport: "#0ea5e9",
  entertainment: "#8b5cf6",
  health: "#ef4444",
  clothing: "#ec4899",
  utilities: "#10b981",
  rent: "#6366f1",
  dining: "#f97316",
  other: "#64748b",
};

export default function AnalyticsPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [monthlyRes, categoriesRes] = await Promise.all([
          analyticsAPI.monthlySummary(),
          analyticsAPI.categoryBreakdown(),
        ]);
        setMonthlyData(monthlyRes.data);
        
        // Ensure categories have a mapped color
        const catsWithColor = categoriesRes.data.map((c: any) => ({
          ...c,
          color: categoryColors[c.name.toLowerCase()] || categoryColors.other || "#64748b"
        }));
        setCategories(catsWithColor);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl"></div>
        <div className="h-96 bg-muted rounded-2xl"></div>
      </div>
    );
  }

  const currentMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : { month: "N/A", income: 0, expenses: 0 };
  const prevMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : { month: "N/A", income: 0, expenses: 0 };
  
  const incomeChange = prevMonth.income ? ((currentMonth.income - prevMonth.income) / prevMonth.income * 100).toFixed(1) : "0.0";
  const expenseChange = prevMonth.expenses ? ((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses * 100).toFixed(1) : "0.0";

  return (
    <>
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Income Trend</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {Number(incomeChange) >= 0 ? "+" : ""}{incomeChange}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">vs last month</p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Expense Trend</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {Number(expenseChange) >= 0 ? "+" : ""}{expenseChange}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">vs last month</p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Net Savings</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            KSH {(currentMonth.income - currentMonth.expenses).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">this month</p>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="animate-fade-up-delay-1 mt-6">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg text-sm font-semibold">
            <BarChart3 className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg text-sm font-semibold">
            <PieChartIcon className="h-4 w-4 mr-2" /> Categories
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab — Bar chart */}
        <TabsContent value="overview" className="mt-6">
          <Card className="p-6 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-foreground">Income vs Expenses</h3>
              <Badge variant="secondary" className="text-xs gap-1.5">
                <Calendar className="h-3 w-3" /> Last 6 Months
              </Badge>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `KSH ${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: number) => [`KSH ${val.toLocaleString()}`]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="income" name="Income" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-6">
          <Card className="p-6 rounded-2xl border border-border/60 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-6">Spending by Category</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => `KSH ${val.toLocaleString()}`}
                      contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-foreground capitalize">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">
                          KSH {cat.amount.toLocaleString()}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-bold" style={{ backgroundColor: `${cat.color}12`, color: cat.color }}>
                          {cat.pct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
