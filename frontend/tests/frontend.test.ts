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
