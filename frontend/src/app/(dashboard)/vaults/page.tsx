"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Shield,
  PartyPopper,
  LineChart,
  ArrowRightLeft,
  Lock,
  Unlock,
  TrendingUp,
  Target,
} from "lucide-react";
import { useState, useEffect } from "react";
import { bucketAPI, rulesAPI } from "@/lib/api";

type VaultConfig = {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  target: number;
  color: string;
  locked: boolean;
};

const VAULT_CONFIGS: VaultConfig[] = [
  { id: "basic", label: "Basic Needs", subtitle: "Rent, Food, Utilities", icon: Home, target: 250000, color: "#0ea5e9", locked: false },
  { id: "emergency", label: "Emergency Vault", subtitle: "Safety Net Funds", icon: Shield, target: 1500000, color: "#8b5cf6", locked: true },
  { id: "personal", label: "Personal Savings", subtitle: "Leisure & Lifestyle", icon: PartyPopper, target: 500000, color: "#f59e0b", locked: false },
  { id: "invest", label: "Investment Fund", subtitle: "Assets & Growth", icon: LineChart, target: 1000000, color: "#2563eb", locked: false },
];

type Rule = {
  id: string;
  label: string;
  rule_type: string;
  target_bucket: string;
  is_active: boolean;
};

export default function VaultsPage() {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showTransfer, setShowTransfer] = useState(false);
  const [fromBucket, setFromBucket] = useState("");
  const [toBucket, setToBucket] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, rulesRes] = await Promise.all([
        bucketAPI.getBalances(),
        rulesAPI.list()
      ]);
      setBalances(balRes.data);
      setRules(rulesRes.data);
    } catch (err: any) {
      setError("Failed to load vaults data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async () => {
    if (!fromBucket || !toBucket || !transferAmount) return;
    setTransferring(true);
    setError("");
    try {
      await bucketAPI.transfer({
        from_bucket: fromBucket,
        to_bucket: toBucket,
        amount: Number(transferAmount)
      });
      setShowTransfer(false);
      setFromBucket("");
      setToBucket("");
      setTransferAmount("");
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Transfer failed.");
    } finally {
      setTransferring(false);
    }
  };

  const toggleRule = async (ruleId: string, currentActive: boolean) => {
    try {
      await rulesAPI.toggle(ruleId, !currentActive);
      await fetchData();
    } catch (err) {
      setError("Failed to toggle rule.");
    }
  };

  const totalBalance = VAULT_CONFIGS.reduce((sum, v) => sum + (balances[v.id] || 0), 0);
  const totalTarget = VAULT_CONFIGS.reduce((sum, v) => sum + v.target, 0);

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

      {/* Total overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Saved</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            KSH {totalBalance.toLocaleString()}
          </p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Target className="h-4 w-4 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Target</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            KSH {totalTarget.toLocaleString()}
          </p>
        </Card>
        <Card className="p-5 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalTarget > 0 ? Math.round((totalBalance / totalTarget) * 100) : 0}%
          </p>
        </Card>
      </div>

      {/* Vaults grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-foreground">Your Vaults</h3>
          <Button onClick={() => setShowTransfer(!showTransfer)} variant="outline" className="rounded-xl text-sm gap-2 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] hover:border-[var(--primary)]/30">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </Button>
        </div>

        {showTransfer && (
          <Card className="p-6 mb-6 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.02] animate-fade-up">
            <h4 className="font-bold mb-4">Transfer Funds</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={fromBucket} onValueChange={(val) => setFromBucket(val || "")}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Source Vault" /></SelectTrigger>
                  <SelectContent>
                    {VAULT_CONFIGS.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toBucket} onValueChange={(val) => setToBucket(val || "")}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Destination Vault" /></SelectTrigger>
                  <SelectContent>
                    {VAULT_CONFIGS.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (KSH)</Label>
                <Input type="number" placeholder="0.00" className="rounded-xl" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTransfer} disabled={transferring} className="bg-[var(--primary)] text-white rounded-xl">
                {transferring ? "Transferring..." : "Transfer"}
              </Button>
              <Button variant="ghost" onClick={() => setShowTransfer(false)} className="rounded-xl">Cancel</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-delay-1">
          {VAULT_CONFIGS.map((vault) => {
            const Icon = vault.icon;
            const balance = balances[vault.id] || 0;
            const progress = Math.round((balance / vault.target) * 100);
            return (
              <Card
                key={vault.id}
                className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                style={{ borderColor: `${vault.color}25` }}
              >
                <div
                  className="absolute -right-10 -top-10 w-28 h-28 rounded-full blur-xl transition-all duration-500 group-hover:scale-150"
                  style={{ backgroundColor: `${vault.color}08` }}
                />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl" style={{ backgroundColor: `${vault.color}12` }}>
                      <Icon className="h-5 w-5" style={{ color: vault.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{vault.label}</h4>
                      <p className="text-xs text-muted-foreground">{vault.subtitle}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold uppercase tracking-wider gap-1"
                    style={{ backgroundColor: `${vault.color}12`, color: vault.color }}
                  >
                    {vault.locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                    {vault.locked ? "Locked" : "Flexible"}
                  </Badge>
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Balance</p>
                      <p className="font-mono text-xl font-bold text-foreground">
                        KSH {balance.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      of KSH {vault.target.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: vault.color,
                          boxShadow: `0 0 8px ${vault.color}40`,
                        }}
                      />
                    </div>
                    <p className="text-xs font-mono font-bold text-right" style={{ color: vault.color }}>
                      {progress}%
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Savings Rules */}
      <div className="animate-fade-up-delay-2 mt-8">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Savings Automation Rules</h3>
        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="text-muted-foreground text-sm">No rules configured yet.</p>
          )}
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${rule.is_active ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-muted-foreground/30"}`} />
                <div>
                  <p className="font-semibold text-foreground text-sm">{rule.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {rule.rule_type} → {rule.target_bucket}
                  </p>
                </div>
              </div>
              <Button 
                variant={rule.is_active ? "default" : "secondary"} 
                size="sm"
                onClick={() => toggleRule(rule.id, rule.is_active)}
                className={`text-xs rounded-lg h-7 px-3 ${rule.is_active ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0" : ""}`}
              >
                {rule.is_active ? "Active" : "Paused"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
