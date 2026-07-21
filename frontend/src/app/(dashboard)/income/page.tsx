"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";
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

export default function IncomePage() {
  const [showForm, setShowForm] = useState(false);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await incomeAPI.list();
      setIncomeEntries(res.data);
    } catch (err: any) {
      setError("Failed to load income entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await incomeAPI.create({
        source,
        amount: Number(amount),
        date_received: dateReceived,
        notes,
      });
      setShowForm(false);
      setSource("");
      setAmount("");
      setDateReceived("");
      setNotes("");
      await fetchIncome();
    } catch (err: any) {
      setError("Failed to save income.");
    } finally {
      setSaving(false);
    }
  };

  const totalIncome = incomeEntries.reduce((sum, i) => sum + i.amount, 0);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl"></div>
        <div className="h-64 bg-muted rounded-2xl"></div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="p-4 mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Income</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            KSH {totalIncome.toLocaleString()}
          </p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">This Month</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {incomeEntries.length} entries
          </p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <DollarSign className="h-4 w-4 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Avg Per Entry</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            KSH {incomeEntries.length > 0 ? Math.round(totalIncome / incomeEntries.length).toLocaleString() : 0}
          </p>
        </Card>
      </div>

      {/* Add Income */}
      <div className="flex justify-between items-center animate-fade-up-delay-1 mt-6">
        <h3 className="font-display text-lg font-bold text-foreground">Income Log</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.02] animate-fade-up mt-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-display text-lg">New Income Entry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium">Source</Label>
                <Input id="source" placeholder="e.g. Monthly Salary" className="rounded-xl" value={source} onChange={e => setSource(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (KSH)</Label>
                <Input id="amount" type="number" placeholder="0.00" className="rounded-xl font-mono" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Date Received</Label>
                <Input id="date" type="date" className="rounded-xl" value={dateReceived} onChange={e => setDateReceived(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
                <Input id="notes" placeholder="Add a note..." className="rounded-xl" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl">
                {saving ? "Saving..." : "Save Income"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">
                Cancel
              </Button>
            </div>

            {/* Split preview */}
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">
              Auto-Split Preview (50/15/15/20)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Basic", pct: "50%", color: "#0ea5e9" },
                { label: "Emergency", pct: "15%", color: "#8b5cf6" },
                { label: "Personal", pct: "15%", color: "#f59e0b" },
                { label: "Invest", pct: "20%", color: "#2563eb" },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-xl" style={{ backgroundColor: `${s.color}10` }}>
                  <p className="text-xs font-bold" style={{ color: s.color }}>{s.pct}</p>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Table */}
      <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden animate-fade-up-delay-2 mt-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Source</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Basic (50%)</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Emergency (15%)</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Personal (15%)</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Invest (20%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No income entries yet. Add one above!
                </TableCell>
              </TableRow>
            ) : (
              incomeEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-semibold text-foreground">{entry.source}</TableCell>
                  <TableCell className="font-mono font-bold text-[var(--primary)]">
                    KSH {entry.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{entry.date_received}</TableCell>
                  <TableCell className="text-center font-mono text-sm text-sky-600">
                    {entry.split_basic.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-violet-600">
                    {entry.split_emergency.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-amber-600">
                    {entry.split_personal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-[var(--primary)]">
                    {entry.split_invest.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
