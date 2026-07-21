"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  Plus,
  ShoppingCart,
  Utensils,
  Car,
  Tv,
  Heart,
  Shirt,
  Lightbulb,
  Home,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { expenseAPI } from "@/lib/api";

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

type ExpenseEntry = {
  id: string;
  description: string;
  amount: number;
  category: string;
  bucket_source: string;
  date_spent: string;
  notes: string;
};

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [bucketSource, setBucketSource] = useState("");
  const [dateSpent, setDateSpent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseAPI.list();
      setExpenses(res.data);
    } catch (err: any) {
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = async () => {
    if (!description || !amount || !category || !bucketSource || !dateSpent) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await expenseAPI.create({
        description,
        amount: Number(amount),
        category,
        bucket_source: bucketSource,
        date_spent: dateSpent,
        notes,
      });
      setShowForm(false);
      setDescription("");
      setAmount("");
      setCategory("");
      setBucketSource("");
      setDateSpent("");
      setNotes("");
      await fetchExpenses();
    } catch (err: any) {
      setError("Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

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

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Receipt className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            KSH {totalExpenses.toLocaleString()}
          </p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <ArrowDownRight className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">This Month</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {expenses.length} transactions
          </p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Top Category</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground capitalize">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}
          </p>
        </Card>
      </div>

      {/* Category breakdown chips */}
      <div className="flex flex-wrap gap-2 animate-fade-up-delay-1 mt-4">
        {Object.entries(categoryTotals).map(([cat, total]) => (
          <Badge
            key={cat}
            variant="secondary"
            className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize"
            style={{ backgroundColor: `${categoryColors[cat] || categoryColors.other}12`, color: categoryColors[cat] || categoryColors.other }}
          >
            {cat}: KSH {total.toLocaleString()}
          </Badge>
        ))}
      </div>

      {/* Add Expense */}
      <div className="flex justify-between items-center mt-6">
        <h3 className="font-display text-lg font-bold text-foreground">Expense Log</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.02] animate-fade-up mt-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-display text-lg">New Expense</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Input placeholder="e.g. Grocery shopping" className="rounded-xl" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Amount (KSH)</Label>
                <Input type="number" placeholder="0.00" className="rounded-xl font-mono" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(categoryColors).map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bucket Source</Label>
                <Select value={bucketSource} onValueChange={setBucketSource}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select bucket" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Needs</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="invest">Investments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <Input type="date" className="rounded-xl" value={dateSpent} onChange={e => setDateSpent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes (optional)</Label>
                <Input placeholder="Add a note..." className="rounded-xl" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl">
                {saving ? "Saving..." : "Save Expense"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Table */}
      <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden animate-fade-up-delay-2 mt-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Description</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Bucket</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No expenses recorded. Add one above!
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((exp) => {
                const Icon = categoryIcons[exp.category] || MoreHorizontal;
                const color = categoryColors[exp.category] || "#64748b";
                return (
                  <TableRow key={exp.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-semibold text-foreground">{exp.description}</TableCell>
                    <TableCell className="font-mono font-bold text-red-500">
                      - KSH {exp.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs rounded-lg" style={{ backgroundColor: `${color}12`, color }}>
                        <Icon className="h-3 w-3 mr-1" />
                        {exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground text-sm">{exp.bucket_source}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{exp.date_spent}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
