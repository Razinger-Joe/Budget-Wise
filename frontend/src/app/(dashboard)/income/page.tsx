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

      {/* ── Add Income Form (KenyaEMR Encounter Format) ── */}
      {showForm && (
        <div
          className="bg-white border border-[var(--border)] animate-scale-in"
          style={{ borderTop: `3px solid var(--primary)` }}
        >
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="emr-indicator-code">FORM MOH-711</span>
                <p className="text-sm font-bold text-foreground">Treasury Inflow Encounter</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Automated triage allocation: 50% Basic, 15% Emergency, 15% Personal, 20% Investment</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 px-2 py-1">
              REVENUE INGESTION
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Inflow Source <span className="text-[#da1e28]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Salary, Consultancy, Dividend"
                className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] rounded-none"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Gross Amount (KSH) <span className="text-[#da1e28]">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] rounded-none font-bold"
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
                className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] rounded-none"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Payment Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--primary)] rounded-none"
              >
                <option value="M-PESA Paybill">M-PESA (Paybill / Till)</option>
                <option value="Bank EFT">Bank EFT / RTGS (Equity / NCBA)</option>
                <option value="Cash Voucher">Cash Voucher / Treasury Direct</option>
                <option value="Payroll">Employer Payroll / Standing Order</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                M-Pesa / Reference Code
              </label>
              <input
                type="text"
                placeholder="e.g. TK78QW194J"
                className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] rounded-none uppercase"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Clinical Notes / Remarks
              </label>
              <input
                type="text"
                placeholder="Add audit reference or details..."
                className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] rounded-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Auto-split preview */}
          {previewAmt > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="emr-indicator-code">TRIAGE ALLOCATION</span>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Automated 50/15/15/20 Split Breakdown
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SPLITS.map((s) => (
                  <div
                    key={s.key}
                    className="p-3 border border-[var(--border)] bg-[#fafafa]"
                    style={{ borderTop: `3px solid ${s.color}` }}
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1">{s.label}</p>
                    <p className="font-mono text-base font-bold" style={{ color: s.color }}>
                      {fmt(previewAmt * parseInt(s.pct) / 100)}
                    </p>
                    <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                      <span>Formula:</span>
                      <span className="font-bold font-mono">{s.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60 transition-colors rounded-none"
              style={{ background: "var(--primary)" }}
            >
              {saving ? "Transacting…" : "Commit Inflow Encounter"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2 text-xs font-semibold border border-[var(--border)] bg-white text-foreground hover:bg-[var(--muted)] transition-colors rounded-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Income Table (TaifaCare Clinical Registry) ── */}
      <div className="bg-white border border-[var(--border)] animate-fade-up-delay-2 overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="emr-indicator-code">REGISTRY</span>
            <p className="section-label">Master Inflow Ledger · MOH-711</p>
            <span className="text-xs text-muted-foreground">({entries.length} records)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search source or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-[var(--border)] bg-white rounded-none focus:outline-none focus:border-[var(--primary)] w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="emr-table">
            <thead>
              <tr>
                <th>REF / VOUCHER</th>
                <th>DEPOSIT DATE</th>
                <th>INFLOW SOURCE</th>
                <th className="text-right">TOTAL INFLOW</th>
                <th>BASIC (50%)</th>
                <th>EMERGENCY (15%)</th>
                <th>PERSONAL (15%)</th>
                <th>INVEST (20%)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    No inflow encounters recorded yet. Use the button above to register new income.
                  </td>
                </tr>
              ) : (
                entries
                  .filter((e) =>
                    !searchQuery ||
                    e.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.notes?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((e, idx) => (
                    <tr key={e.id}>
                      <td className="font-mono text-xs font-bold text-[#004F3A]">
                        {`REC-${String(idx + 1).padStart(4, "0")}`}
                      </td>
                      <td className="font-mono text-[11px] text-muted-foreground">
                        {fmtDate(e.date_received)}
                      </td>
                      <td className="font-medium text-foreground">
                        <div>{e.source}</div>
                        {e.notes && <div className="text-[10px] text-muted-foreground font-mono">{e.notes}</div>}
                      </td>
                      <td className="text-right font-mono font-bold text-[#006A4E]">
                        {fmt(e.amount)}
                      </td>
                      <td className="font-mono text-xs text-[#0043ce]">
                        {fmt(e.split_basic)}
                      </td>
                      <td className="font-mono text-xs text-[#6929c4]">
                        {fmt(e.split_emergency)}
                      </td>
                      <td className="font-mono text-xs text-[#8c6400]">
                        {fmt(e.split_personal)}
                      </td>
                      <td className="font-mono text-xs text-[#006A4E]">
                        {fmt(e.split_invest)}
                      </td>
                      <td>
                        <span className="tag-green text-[9px] font-mono font-bold px-1 py-0.5">
                          ALLOCATED
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
