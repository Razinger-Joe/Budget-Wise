"use client";

import { useState, useEffect } from "react";
import {
  Receipt, Plus, ShoppingCart, Utensils, Car, Tv,
  Heart, Shirt, Lightbulb, Home, MoreHorizontal,
  ArrowDownRight, FileText, Info, ChevronUp,
} from "lucide-react";
import { expenseAPI } from "@/lib/api";

const categoryIcons: Record<string, typeof ShoppingCart> = {
  food: Utensils, transport: Car, entertainment: Tv, health: Heart,
  clothing: Shirt, utilities: Lightbulb, rent: Home, dining: Utensils, other: MoreHorizontal,
};

const CATEGORIES = [
  { id: "food",          label: "Food",          color: "#8c6400", bg: "#fcf4d6" },
  { id: "transport",     label: "Transport",     color: "#0043ce", bg: "#edf5ff" },
  { id: "entertainment", label: "Entertainment", color: "#6929c4", bg: "#f6f2ff" },
  { id: "health",        label: "Health",        color: "#da1e28", bg: "#fff1f1" },
  { id: "clothing",      label: "Clothing",      color: "#9f1853", bg: "#fff0f7" },
  { id: "utilities",     label: "Utilities",     color: "#006A4E", bg: "#defbe6" },
  { id: "rent",          label: "Rent",          color: "#1192e8", bg: "#e8f4fd" },
  { id: "dining",        label: "Dining",        color: "#ff832b", bg: "#fff2e8" },
  { id: "other",         label: "Other",         color: "#6f6f6f", bg: "#e8e8e8" },
];

const BUCKETS = [
  { id: "basic",     label: "Basic Needs" },
  { id: "personal",  label: "Personal" },
  { id: "emergency", label: "Emergency" },
  { id: "invest",    label: "Investment" },
];

type ExpenseEntry = {
  id: string;
  description: string;
  amount: number;
  category: string;
  bucket_source: string;
  date_spent: string;
  notes: string;
};

const fmt = (n: number) => `KSH ${Number(n).toLocaleString()}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

export default function ExpensesPage() {
  const [expenses, setExpenses]   = useState<ExpenseEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [description, setDescription] = useState("");
  const [amount, setAmount]           = useState("");
  const [category, setCategory]       = useState("");
  const [bucketSource, setBucketSource] = useState("");
  const [dateSpent, setDateSpent]     = useState("");
  const [notes, setNotes]             = useState("");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseAPI.list();
      setExpenses(res.data);
    } catch {
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSave = async () => {
    if (!description || !amount || !category || !bucketSource || !dateSpent) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await expenseAPI.create({ description, amount: Number(amount), category, bucket_source: bucketSource, date_spent: dateSpent, notes });
      setShowForm(false);
      setDescription(""); setAmount(""); setCategory(""); setBucketSource(""); setDateSpent(""); setNotes("");
      await fetchExpenses();
    } catch {
      setError("Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date_spent);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const catTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const filteredExpenses = filterCat === "all"
    ? expenses
    : expenses.filter((e) => e.category === filterCat);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}
        </div>
        <div className="h-80 skeleton" />
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
          { label: "Total Expenses",    value: fmt(totalExpenses), icon: Receipt,         color: "#da1e28", bg: "#fff1f1", sub: `${expenses.length} transactions` },
          { label: "This Month",        value: `${thisMonth.length} items`, icon: ArrowDownRight, color: "#8c6400", bg: "#fcf4d6", sub: fmt(thisMonth.reduce((s, e) => s + Number(e.amount), 0)) },
          { label: "Top Category",      value: topCat.charAt(0).toUpperCase() + topCat.slice(1), icon: ShoppingCart, color: "#0043ce", bg: "#edf5ff", sub: catTotals[topCat] ? fmt(catTotals[topCat]) : "No data" },
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
              <p className="font-mono text-xl font-bold text-foreground capitalize">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Category breakdown pills */}
      <div className="flex flex-wrap gap-2 animate-fade-up-delay-1">
        <button
          onClick={() => setFilterCat("all")}
          className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${filterCat === "all" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white border-[var(--border)] text-foreground hover:bg-muted"}`}
        >
          All
        </button>
        {CATEGORIES.filter((c) => catTotals[c.id]).map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCat(filterCat === c.id ? "all" : c.id)}
            className="px-3 py-1.5 text-xs font-semibold border transition-all"
            style={
              filterCat === c.id
                ? { background: c.color, color: "white", borderColor: c.color }
                : { background: c.bg, color: c.color, borderColor: `${c.color}30` }
            }
          >
            {c.label}: {fmt(catTotals[c.id])}
          </button>
        ))}
      </div>

      {/* Add Expense Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Expense Log</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--primary)" }}
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close Form" : "Add Expense"}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-white border border-[var(--border)] animate-scale-in" style={{ borderTop: `3px solid #da1e28` }}>
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <p className="text-sm font-semibold text-foreground">New Expense</p>
            <p className="text-xs text-muted-foreground">Record a spending transaction</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Description <span className="text-[#da1e28]">*</span></label>
              <input type="text" placeholder="e.g. Grocery shopping" className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Amount (KSH) <span className="text-[#da1e28]">*</span></label>
              <input type="number" placeholder="0" className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Category <span className="text-[#da1e28]">*</span></label>
              <select className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Source Bucket <span className="text-[#da1e28]">*</span></label>
              <select className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={bucketSource} onChange={(e) => setBucketSource(e.target.value)}>
                <option value="">Select bucket…</option>
                {BUCKETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Date <span className="text-[#da1e28]">*</span></label>
              <input type="date" className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={dateSpent} onChange={(e) => setDateSpent(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Notes</label>
              <input type="text" placeholder="Optional note…" className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--primary)" }}>
              {saving ? "Saving…" : "Save Expense"}
            </button>
            <button onClick={() => { setShowForm(false); setError(""); }} className="px-5 py-2.5 text-sm font-semibold border border-[var(--border)] bg-white text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expense Table */}
      <div className="bg-white border border-[var(--border)] animate-fade-up-delay-2 overflow-x-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[#f4f4f4] flex items-center justify-between">
          <p className="section-label">Transactions</p>
          <span className="text-xs text-muted-foreground">{filteredExpenses.length} records</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f4f4f4", borderBottom: "1px solid var(--border)" }}>
              {["Description", "Amount", "Category", "Bucket", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  No expenses recorded.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => {
                const Icon = categoryIcons[exp.category] || MoreHorizontal;
                const cat = CATEGORIES.find((c) => c.id === exp.category);
                return (
                  <tr key={exp.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{exp.description}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#da1e28]">
                      − {fmt(exp.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold capitalize"
                        style={{ background: cat?.bg || "#e8e8e8", color: cat?.color || "#6f6f6f" }}
                      >
                        <Icon className="h-3 w-3" />
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize text-xs">{exp.bucket_source}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(exp.date_spent)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
