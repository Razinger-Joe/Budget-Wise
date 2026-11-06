"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, Plus, Calendar, DollarSign, ArrowUpRight,
  FileText, ChevronDown, ChevronUp, Info, Search, Printer,
  Download, Building2, ShieldCheck,
} from "lucide-react";
import { incomeAPI } from "@/lib/api";

type IncomeEntry = {
  id: string;
  source: string;
  amount: number;
  date_received: string;
  split_basic: number;
  split_emergency: number;
  split_personal: number;
  split_invest: number;
  notes: string;
};

const fmt = (n: number) => `KSH ${Number(n).toLocaleString()}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

const SPLITS = [
  { key: "split_basic",     label: "Basic Needs",    pct: "50%", color: "#0043ce", bg: "#edf5ff" },
  { key: "split_emergency", label: "Emergency",      pct: "15%", color: "#6929c4", bg: "#f6f2ff" },
  { key: "split_personal",  label: "Personal",       pct: "15%", color: "#8c6400", bg: "#fcf4d6" },
  { key: "split_invest",    label: "Investment",     pct: "20%", color: "#006A4E", bg: "#defbe6" },
];

export default function IncomePage() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const [source, setSource]           = useState("");
  const [amount, setAmount]           = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [notes, setNotes]             = useState("");
  const [channel, setChannel]         = useState("M-PESA Paybill");
  const [refCode, setRefCode]         = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await incomeAPI.list();
      setEntries(res.data);
    } catch {
      setError("Failed to load income entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncome(); }, []);

  const handleSave = async () => {
    if (!source || !amount || !dateReceived) {
      setError("Please fill in Source, Amount, and Date.");
      return;
    }
    setSaving(true);
    setError("");
    const combinedNotes = [notes, channel ? `Channel: ${channel}` : "", refCode ? `Ref: ${refCode}` : ""].filter(Boolean).join(" · ");
    try {
      await incomeAPI.create({ source, amount: Number(amount), date_received: dateReceived, notes: combinedNotes });
      setShowForm(false);
      setSource(""); setAmount(""); setDateReceived(""); setNotes(""); setRefCode("");
      await fetchIncome();
    } catch {
      setError("Failed to save income. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalIncome = entries.reduce((s, e) => s + Number(e.amount), 0);
  const thisMonth = entries.filter((e) => {
    const d = new Date(e.date_received);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const avgEntry = entries.length > 0 ? Math.round(totalIncome / entries.length) : 0;
  const previewAmt = Number(amount) || 0;

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

      {/* ── Error banner ──────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3 border border-red-300 bg-red-50 text-sm text-[#da1e28]">
          <Info className="h-4 w-4 shrink-0" />
          {error}
          <button className="ml-auto text-xs underline" onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      {/* ── KPI Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        {[
          { label: "Total Income",   value: fmt(totalIncome), icon: TrendingUp,   color: "#006A4E", bg: "#defbe6", change: `${entries.length} entries` },
          { label: "This Month",     value: `${thisMonth.length} entries`, icon: Calendar,     color: "#0043ce", bg: "#edf5ff", change: fmt(thisMonth.reduce((s, e) => s + Number(e.amount), 0)) },
          { label: "Average Entry",  value: fmt(avgEntry),   icon: DollarSign,   color: "#6929c4", bg: "#f6f2ff", change: "per transaction" },
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
              <p className="text-xs text-muted-foreground mt-1">{c.change}</p>
            </div>
          );
        })}
      </div>

      {/* ── Add Income Toggle ─────────────────────────── */}
      <div className="flex items-center justify-between animate-fade-up-delay-1">
        <h3 className="text-sm font-semibold text-foreground">Income Log</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--primary)" }}
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close Form" : "Add Income"}
        </button>
      </div>

      {/* ── Add Income Form ───────────────────────────── */}
      {showForm && (
        <div
          className="bg-white border border-[var(--border)] animate-scale-in"
          style={{ borderTop: `3px solid var(--primary)` }}
        >
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
            <p className="text-sm font-semibold text-foreground">New Income Entry</p>
            <p className="text-xs text-muted-foreground">Income will auto-split using 50/15/15/20</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Source <span className="text-[#da1e28]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly Salary, Freelance Job"
                className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Amount (KSH) <span className="text-[#da1e28]">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Date Received <span className="text-[#da1e28]">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Notes (optional)
              </label>
              <input
                type="text"
                placeholder="Add any notes..."
                className="w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] transition-colors"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Auto-split preview */}
          {previewAmt > 0 && (
            <div className="px-6 pb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Auto-Split Preview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SPLITS.map((s) => (
                  <div
                    key={s.key}
                    className="p-3 border border-[var(--border)]"
                    style={{ borderTop: `2px solid ${s.color}` }}
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-1">{s.label}</p>
                    <p className="font-mono text-sm font-bold" style={{ color: s.color }}>
                      {fmt(previewAmt * parseInt(s.pct) / 100)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.pct}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
              style={{ background: "var(--primary)" }}
            >
              {saving ? "Saving…" : "Save Income"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-5 py-2.5 text-sm font-semibold border border-[var(--border)] bg-white text-foreground hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Income Table ──────────────────────────────── */}
      <div className="bg-white border border-[var(--border)] animate-fade-up-delay-2 overflow-x-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[#f4f4f4] flex items-center justify-between">
          <p className="section-label">All Entries</p>
          <span className="text-xs text-muted-foreground">{entries.length} records</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#f4f4f4", borderBottom: "1px solid var(--border)" }}>
              {["Source", "Amount", "Date", "Basic (50%)", "Emergency (15%)", "Personal (15%)", "Invest (20%)"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  No income entries yet. Use the button above to add your first entry.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-[#f9f9f9] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{e.source}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--primary)" }}>
                    {fmt(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(e.date_received)}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#0043ce" }}>
                    {fmt(e.split_basic)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#6929c4" }}>
                    {fmt(e.split_emergency)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#8c6400" }}>
                    {fmt(e.split_personal)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--primary)" }}>
                    {fmt(e.split_invest)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
