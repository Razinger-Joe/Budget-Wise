"use client";

import { useState } from "react";
import {
  HelpCircle, ChevronDown, ChevronUp, Shield, TrendingUp,
  LineChart, Sparkles, Home, HeartPulse, PartyPopper,
  Mail, ExternalLink, BookOpen, AlertTriangle
} from "lucide-react";

const FAQS = [
  {
    q: "How does the 50/15/15/20 allocation rule work?",
    a: "Every time you log an income entry in Budget-Wise, the platform automatically splits the total into four designated vaults: 50% for Basic Needs (rent, utilities, groceries, transport), 15% for your Emergency Vault (safety net), 15% for Personal Savings (leisure and hobbies), and 20% for your Investment Fund (stocks, SACCOs, bonds).",
  },
  {
    q: "Why is the Emergency Vault locked?",
    a: "The Emergency Vault is deliberately locked to prevent impulse spending and accidental withdrawals. It is designed to accumulate 3 to 6 months of living expenses. If you need to access funds during a genuine crisis, you can transfer money to another vault with a warning verification step.",
  },
  {
    q: "How is the Legacy Score calculated?",
    a: "The Legacy Score (0 to 100) measures your long-term financial resilience. It evaluates three factors: your monthly savings rate (percentage of income kept after expenses), your emergency fund runway (months of living costs saved), and your adherence to the 50/15/15/20 allocation rules.",
  },
  {
    q: "How does the AI Financial Advisor generate recommendations?",
    a: "The advisor runs on Anthropic Claude 3.5 Sonnet. It reviews your real-time financial trajectory—including income consistency, category spending velocity, and vault balances—to deliver tailored, non-technical financial guidance and actionable warnings.",
  },
  {
    q: "Can I customize the vault percentage allocations?",
    a: "Yes! While 50/15/15/20 is the default benchmark for financial independence, you can adjust these ratios in your Settings under the Allocation Engine tab to suit your unique circumstances.",
  },
  {
    q: "Is my financial data stored securely?",
    a: "Yes. All backend communications utilize OAuth2 bearer tokens (JWT) with encryption, and passwords are encrypted using bcrypt hashing before persistence.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div
        className="bg-white border border-[var(--border)] p-6 lg:p-8 animate-fade-up"
        style={{ borderLeft: "4px solid var(--primary)" }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Budget-Wise Knowledge Base</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Master personal finance automation in Kenya. Learn how our automated allocation formula, vault locking rules, and AI advisory work together to build generational wealth.
            </p>
          </div>
        </div>
      </div>

      {/* Allocation Model Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-delay-1">
        <div className="bg-white border border-[var(--border)] p-5" style={{ borderTop: "3px solid #0043ce" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#edf5ff]">
              <Home className="h-4 w-4 text-[#0043ce]" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Basic Needs</p>
              <span className="font-mono text-xs font-bold text-[#0043ce]">50% Allocation</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Essential obligations: shelter, groceries, utilities, school fees, and daily transport.
          </p>
        </div>

        <div className="bg-white border border-[var(--border)] p-5" style={{ borderTop: "3px solid #6929c4" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#f6f2ff]">
              <Shield className="h-4 w-4 text-[#6929c4]" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Emergency Vault</p>
              <span className="font-mono text-xs font-bold text-[#6929c4]">15% Protected</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Locked resilience buffer. Aim to store at least 3-6 months of expenses for emergencies.
          </p>
        </div>

        <div className="bg-white border border-[var(--border)] p-5" style={{ borderTop: "3px solid #8c6400" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#fcf4d6]">
              <PartyPopper className="h-4 w-4 text-[#8c6400]" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Personal Savings</p>
              <span className="font-mono text-xs font-bold text-[#8c6400]">15% Flexible</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Guilt-free lifestyle funds for dining out, holiday travel, entertainment, and personal projects.
          </p>
        </div>

        <div className="bg-white border border-[var(--border)] p-5" style={{ borderTop: "3px solid #006A4E" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[#defbe6]">
              <LineChart className="h-4 w-4 text-[#006A4E]" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Investment Fund</p>
              <span className="font-mono text-xs font-bold text-[#006A4E]">20% Growth</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Long-term wealth builders: NSE equities, treasury bills/bonds, money market funds, and land.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-[var(--border)] animate-fade-up-delay-2">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[#f4f4f4]">
          <p className="section-label">Frequently Asked Questions</p>
          <p className="text-xs text-muted-foreground">Answers to common financial and technical inquiries</p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="transition-colors hover:bg-[#fafafa]">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-[var(--border)] pt-3 bg-[#fdfdfd]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Card */}
      <div className="bg-white border border-[var(--border)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">Need personalized assistance?</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Our engineering and financial guidance team is available to assist you.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="mailto:support@budgetwise.ke"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-[var(--border)] hover:bg-muted transition-colors text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            support@budgetwise.ke
          </a>
          <a
            href="https://github.com/josefrazinger/Budget-Wise"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
}
