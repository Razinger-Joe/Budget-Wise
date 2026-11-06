import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/* ── 1. Allocation Engine Test ───────────────────────────── */
describe("50/15/15/20 Allocation Engine", () => {
  function calculateSplits(amount: number) {
    const basic = Math.round(amount * 0.50);
    const emergency = Math.round(amount * 0.15);
    const personal = Math.round(amount * 0.15);
    const invest = Math.round(amount * 0.20);
    return { basic, emergency, personal, invest, total: basic + emergency + personal + invest };
  }

  it("should accurately divide 100,000 KSH into four wealth buckets", () => {
    const splits = calculateSplits(100000);
    assert.equal(splits.basic, 50000);
    assert.equal(splits.emergency, 15000);
    assert.equal(splits.personal, 15000);
    assert.equal(splits.invest, 20000);
    assert.equal(splits.total, 100000);
  });

  it("should accurately divide uneven amounts like 75,500 KSH", () => {
    const splits = calculateSplits(75500);
    assert.equal(splits.basic, 37750);
    assert.equal(splits.emergency, 11325);
    assert.equal(splits.personal, 11325);
    assert.equal(splits.invest, 15100);
    assert.equal(splits.total, 75500);
  });
});

/* ── 2. Legacy Score Algorithm Test ──────────────────────── */
describe("Legacy Score Computation", () => {
  function computeScore(totalInc: number, totalExp: number, emergencyBal: number): number {
    const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;
    const avgMonthly = totalExp > 0 ? totalExp : 1;
    const emergencyMonths = emergencyBal / avgMonthly;
    return Math.min(100, Math.round(50 + savingsRate / 2 + emergencyMonths * 3));
  }

  function getScoreTier(score: number): string {
    if (score >= 90) return "Diamond";
    if (score >= 75) return "Sapphire";
    if (score >= 60) return "Gold";
    if (score >= 45) return "Silver";
    return "Bronze";
  }

  it("should calculate correct score for balanced profile", () => {
    // Income 150k, Expense 80k (savings rate = 46.7%), Emergency = 240k (3 months)
    const score = computeScore(150000, 80000, 240000);
    assert.ok(score >= 75 && score <= 90);
    assert.equal(getScoreTier(score), "Sapphire");
  });

  it("should award Diamond tier for high savings and deep emergency runway", () => {
    // Income 300k, Expense 50k, Emergency 500k (10 months)
    const score = computeScore(300000, 50000, 500000);
    assert.equal(score, 100);
    assert.equal(getScoreTier(score), "Diamond");
  });

  it("should award Bronze tier when expenses exceed income with zero runway", () => {
    const score = computeScore(50000, 80000, 0);
    assert.ok(score < 45);
    assert.equal(getScoreTier(score), "Bronze");
  });
});

/* ── 3. Vault Configuration & Lock Verification ─────────── */
describe("Vault Specifications", () => {
  const VAULTS = [
    { id: "basic", label: "Basic Needs", target: 250000, pct: 50, locked: false },
    { id: "emergency", label: "Emergency Vault", target: 1500000, pct: 15, locked: true },
    { id: "personal", label: "Personal Savings", target: 500000, pct: 15, locked: false },
    { id: "invest", label: "Investment Fund", target: 1000000, pct: 20, locked: false },
  ];

  it("should ensure total vault allocation percentage equals 100%", () => {
    const total = VAULTS.reduce((sum, v) => sum + v.pct, 0);
    assert.equal(total, 100);
  });

  it("should lock the Emergency Vault by default for capital protection", () => {
    const emergency = VAULTS.find((v) => v.id === "emergency");
    assert.ok(emergency);
    assert.equal(emergency.locked, true);
  });

  it("should keep discretionary vaults unlocked for normal operations", () => {
    const nonEmergency = VAULTS.filter((v) => v.id !== "emergency");
    for (const v of nonEmergency) {
      assert.equal(v.locked, false, `Vault ${v.id} should not be locked`);
    }
  });
});

/* ── 4. Route Structure & File Coverage ─────────────────── */
describe("Frontend Routes & Pages Coverage", () => {
  const projectRoot = path.resolve(import.meta.dirname, "..");

  const expectedPages = [
    "src/app/(dashboard)/page.tsx",
    "src/app/(dashboard)/layout.tsx",
    "src/app/(dashboard)/income/page.tsx",
    "src/app/(dashboard)/expenses/page.tsx",
    "src/app/(dashboard)/vaults/page.tsx",
    "src/app/(dashboard)/analytics/page.tsx",
    "src/app/(dashboard)/settings/page.tsx",
    "src/app/(dashboard)/help/page.tsx",
    "src/app/login/page.tsx",
    "src/app/register/page.tsx",
    "src/app/layout.tsx",
    "src/proxy.ts",
  ];

  for (const relPath of expectedPages) {
    it(`should have ${relPath} present on disk`, () => {
      const fullPath = path.join(projectRoot, relPath);
      assert.ok(fs.existsSync(fullPath), `Expected file missing: ${fullPath}`);
    });
  }

  it("should ensure conflicting root page.tsx is not present", () => {
    const rootPage = path.join(projectRoot, "src/app/page.tsx");
    assert.equal(fs.existsSync(rootPage), false, "src/app/page.tsx should not exist to avoid route conflict with (dashboard)/page.tsx");
  });
});

/* ── 5. Proxy & Middleware Guard Logic ──────────────────── */
describe("Proxy Route Protection Logic", () => {
  const PUBLIC_ROUTES = ["/login", "/register"];

  function shouldBypassAuth(pathname: string): boolean {
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) return true;
    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return true;
    return false;
  }

  it("should allow public authentication routes without token", () => {
    assert.equal(shouldBypassAuth("/login"), true);
    assert.equal(shouldBypassAuth("/register"), true);
  });

  it("should allow static assets and Next internals", () => {
    assert.equal(shouldBypassAuth("/favicon.ico"), true);
    assert.equal(shouldBypassAuth("/_next/static/chunks/main.js"), true);
    assert.equal(shouldBypassAuth("/api/health"), true);
  });

  it("should require auth check for dashboard routes", () => {
    assert.equal(shouldBypassAuth("/"), false);
    assert.equal(shouldBypassAuth("/income"), false);
    assert.equal(shouldBypassAuth("/expenses"), false);
    assert.equal(shouldBypassAuth("/vaults"), false);
    assert.equal(shouldBypassAuth("/analytics"), false);
    assert.equal(shouldBypassAuth("/settings"), false);
    assert.equal(shouldBypassAuth("/help"), false);
  });
});

/* ── 6. TaifaCare Indicator Surveillance Benchmarks ───────── */
describe("TaifaCare Indicator Surveillance Benchmarks", () => {
  function evaluateIndicator(code: string, value: number, baseline: number) {
    switch (code) {
      case "BW-IND-01": // Living Needs Ratio
        return value <= baseline ? "NORMAL" : "ELEVATED";
      case "BW-IND-02": // Disbursement Velocity
        return value <= baseline ? "CONTROLLED" : "DEFICIT";
      case "BW-IND-03": // Surplus Buffer
        return value >= baseline ? "ACCUMULATING" : "DRAWDOWN";
      case "BW-IND-04": // Emergency Reserve Runway
        return value >= baseline ? "PROTECTED" : "VULNERABLE";
      default:
        return "UNKNOWN";
    }
  }

  it("should assess controlled disbursement when spending is below income", () => {
    assert.equal(evaluateIndicator("BW-IND-02", 70000, 100000), "CONTROLLED");
    assert.equal(evaluateIndicator("BW-IND-02", 120000, 100000), "DEFICIT");
  });

  it("should assess protected status when emergency runway >= 3 months", () => {
    assert.equal(evaluateIndicator("BW-IND-04", 4.5, 3.0), "PROTECTED");
    assert.equal(evaluateIndicator("BW-IND-04", 1.2, 3.0), "VULNERABLE");
  });

  it("should assess accumulating surplus buffer", () => {
    assert.equal(evaluateIndicator("BW-IND-03", 45000, 30000), "ACCUMULATING");
    assert.equal(evaluateIndicator("BW-IND-03", -15000, 0), "DRAWDOWN");
  });
});

/* ── 7. Voucher & M-Pesa Identifier Protocol ──────────────── */
describe("Encounter Reference & Voucher Code Formats", () => {
  function formatVoucher(index: number, prefix: "VCH" | "REC" = "VCH"): string {
    return `${prefix}-${String(index).padStart(4, "0")}`;
  }

  function sanitizeMpesaRef(input: string): string {
    return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  it("should format voucher references with 4-digit zero-padded index", () => {
    assert.equal(formatVoucher(1, "VCH"), "VCH-0001");
    assert.equal(formatVoucher(42, "REC"), "REC-0042");
    assert.equal(formatVoucher(105, "VCH"), "VCH-0105");
  });

  it("should sanitize and normalize Kenyan M-Pesa confirmation codes", () => {
    assert.equal(sanitizeMpesaRef(" tk78qw194j "), "TK78QW194J");
    assert.equal(sanitizeMpesaRef("qf-49-aa-812"), "QF49AA812");
  });
});

/* ── 8. Categorical Expenditure Epidemiology & Aggregation ── */
describe("Categorical Expenditure Aggregation", () => {
  const sampleExpenses = [
    { category: "food", amount: 25000 },
    { category: "rent", amount: 50000 },
    { category: "transport", amount: 15000 },
    { category: "food", amount: 10000 },
  ];

  function aggregateCategories(expenses: typeof sampleExpenses) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totals: Record<string, number> = {};
    for (const e of expenses) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    }
    const breakdown = Object.entries(totals).map(([name, amount]) => ({
      name,
      amount,
      pct: Math.round((amount / total) * 100),
    }));
    return { total, breakdown };
  }

  it("should aggregate multi-entry categories accurately", () => {
    const { total, breakdown } = aggregateCategories(sampleExpenses);
    assert.equal(total, 100000);
    const food = breakdown.find((b) => b.name === "food");
    assert.ok(food);
    assert.equal(food.amount, 35000);
    assert.equal(food.pct, 35);
  });

  it("should compute accurate percentage shares for Recharts donut view", () => {
    const { breakdown } = aggregateCategories(sampleExpenses);
    const rent = breakdown.find((b) => b.name === "rent");
    assert.ok(rent);
    assert.equal(rent.pct, 50);
  });
});

/* ── 9. Inter-Vault Custody Transfer Validation ───────────── */
describe("Inter-Vault Custody Transfer Validation", () => {
  function validateTransfer(from: string, to: string, amount: number, currentBal: number) {
    if (!from || !to) return { valid: false, error: "Source and destination required" };
    if (from === to) return { valid: false, error: "Source and destination cannot be identical" };
    if (amount <= 0 || isNaN(amount)) return { valid: false, error: "Invalid transfer amount" };
    if (amount > currentBal) return { valid: false, error: "Insufficient balance in source vault" };
    const warning = from === "emergency" ? "Emergency Vault drawdown warning" : null;
    return { valid: true, warning, error: null };
  }

  it("should prevent transferring from a vault to itself", () => {
    const res = validateTransfer("basic", "basic", 5000, 20000);
    assert.equal(res.valid, false);
    assert.match(res.error!, /cannot be identical/);
  });

  it("should prevent overdraft transfers beyond available vault balance", () => {
    const res = validateTransfer("basic", "invest", 50000, 20000);
    assert.equal(res.valid, false);
    assert.match(res.error!, /Insufficient balance/);
  });

  it("should trigger caution warning when withdrawing from Emergency Vault", () => {
    const res = validateTransfer("emergency", "invest", 10000, 50000);
    assert.equal(res.valid, true);
    assert.ok(res.warning);
    assert.match(res.warning!, /Emergency Vault drawdown/);
  });
});

/* ── 10. Allocation Matrix Validation & Constraints ──────── */
describe("Allocation Matrix Constraints", () => {
  function validateMatrix(basic: number, emergency: number, personal: number, invest: number): boolean {
    return (basic + emergency + personal + invest) === 100;
  }

  it("should accept valid 50/15/15/20 configuration", () => {
    assert.equal(validateMatrix(50, 15, 15, 20), true);
  });

  it("should reject configurations that deviate from 100%", () => {
    assert.equal(validateMatrix(50, 15, 15, 25), false); // 105%
    assert.equal(validateMatrix(40, 15, 15, 20), false); // 90%
  });
});
