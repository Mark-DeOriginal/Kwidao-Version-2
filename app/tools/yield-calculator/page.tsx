"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function YieldCalculatorPage() {
  const [principal, setPrincipal] = useState(1000);
  const [apy, setApy] = useState(12);
  const [months, setMonths] = useState(12);
  const [compoundPerYear, setCompoundPerYear] = useState(12);

  const result = useMemo(() => {
    const cleanPrincipal = clamp(principal || 0, 0, 1000000000);
    const cleanApy = clamp(apy || 0, 0, 1000) / 100;
    const years = clamp(months || 0, 0, 600) / 12;
    const n = clamp(compoundPerYear || 1, 1, 365);

    if (cleanPrincipal <= 0 || years <= 0) {
      return {
        finalAmount: 0,
        profit: 0,
      };
    }

    const finalAmount = cleanPrincipal * (1 + cleanApy / n) ** (n * years);
    return {
      finalAmount,
      profit: finalAmount - cleanPrincipal,
    };
  }, [apy, compoundPerYear, months, principal]);

  const money = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/#" className="text-sm text-[var(--theme-primary)] hover:underline inline-block">
          Back to home
        </Link>

        <div className="bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--theme-primary)] mb-2">
            Yield Calculator
          </h1>
          <p className="text-[var(--theme-text-muted)] mb-8">
            Estimate compounded return based on capital, APY, and timeframe.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Starting capital (USD)</span>
              <input
                type="number"
                min={0}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">APY (%)</span>
              <input
                type="number"
                min={0}
                value={apy}
                onChange={(e) => setApy(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Duration (months)</span>
              <input
                type="number"
                min={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Compounds per year</span>
              <select
                value={compoundPerYear}
                onChange={(e) => setCompoundPerYear(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              >
                <option value={1}>1 (Yearly)</option>
                <option value={12}>12 (Monthly)</option>
                <option value={52}>52 (Weekly)</option>
                <option value={365}>365 (Daily)</option>
              </select>
            </label>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--theme-text-soft)]">Projected Value</p>
              <p className="text-2xl font-bold text-[var(--theme-primary)] mt-1">{money(result.finalAmount)}</p>
            </div>
            <div className="rounded-xl bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--theme-text-soft)]">Estimated Profit</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{money(result.profit)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
