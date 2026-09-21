"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon } from "@/app/components/icons/ArrowIcons";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

export default function YieldCalculatorPage() {
  const [principal, setPrincipal] = useState(1000);
  const [apy, setApy] = useState(12);
  const [months, setMonths] = useState(12);
  const [compoundPerYear, setCompoundPerYear] = useState(12);

  const result = useMemo(() => {
    const cleanPrincipal = clamp(principal || 0, 0, 1_000_000_000);
    const cleanApy = clamp(apy || 0, 0, 1000) / 100;
    const cleanMonths = clamp(months || 0, 0, 600);
    const years = cleanMonths / 12;
    const frequency = clamp(compoundPerYear || 1, 1, 365);
    const finalAmount = cleanPrincipal > 0 && years > 0
      ? cleanPrincipal * (1 + cleanApy / frequency) ** (frequency * years)
      : 0;
    const profit = Math.max(finalAmount - cleanPrincipal, 0);
    const effectiveReturn = cleanPrincipal > 0 ? (profit / cleanPrincipal) * 100 : 0;
    const checkpoints = [0.25, 0.5, 0.75, 1].map((progress) => {
      const checkpointYears = years * progress;
      const value = cleanPrincipal > 0 && checkpointYears > 0
        ? cleanPrincipal * (1 + cleanApy / frequency) ** (frequency * checkpointYears)
        : cleanPrincipal;
      return {
        label: progress === 1 ? `${cleanMonths} months` : `${Math.max(1, Math.round(cleanMonths * progress))} months`,
        value,
        progress,
      };
    });
    return { finalAmount, profit, effectiveReturn, checkpoints };
  }, [apy, compoundPerYear, months, principal]);

  return (
    <main className="kwidao-standard-tool min-h-screen bg-white py-12 text-[#30283B] md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[#662E91] no-underline hover:text-[#542477]">
          <ArrowLeftIcon className="h-4 w-4 shrink-0" /> All tools
        </Link>

        <header className="mt-10 grid gap-8 border-b border-[#DDD4E3] pb-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#662E91]">Yield planning</p>
            <h1 className="mt-4 text-[clamp(2.35rem,4vw,3.7rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[#190B23]">Project how your capital could compound.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6A6272] md:text-lg">Adjust capital, APY, duration, and compounding frequency to build a clear return estimate before comparing DeFi opportunities.</p>
          </div>
          <div className="border-l-2 border-[#662E91] pl-5">
            <p className="text-sm font-semibold text-[#30283B]">Planning estimate</p>
            <p className="mt-2 text-sm leading-6 text-[#766D7E]">Rates are assumed to remain constant and do not include fees, token price changes, or protocol risk.</p>
          </div>
        </header>

        <section className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] xl:items-start">
          <div className="border border-[#DDD4E3] bg-white">
            <div className="flex items-start justify-between gap-6 border-b border-[#E6DFEA] px-6 py-6 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B739D]">01 · Assumptions</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#30283B]">Set your yield scenario</h2>
              </div>
              <span className="hidden text-sm text-[#92889A] sm:block">Values update instantly</span>
            </div>

            <div className="grid gap-x-6 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
              <Field label="Starting capital" hint="The amount you plan to deposit">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#766D7E]">$</span>
                  <input type="number" min={0} value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} className="tool-input pl-9" />
                </div>
              </Field>
              <Field label="Estimated APY" hint="Annual percentage yield">
                <div className="relative">
                  <input type="number" min={0} value={apy} onChange={(event) => setApy(Number(event.target.value))} className="tool-input pr-10" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#766D7E]">%</span>
                </div>
              </Field>
              <Field label="Duration" hint="How long capital stays deployed">
                <div className="relative">
                  <input type="number" min={1} value={months} onChange={(event) => setMonths(Number(event.target.value))} className="tool-input pr-20" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#766D7E]">months</span>
                </div>
              </Field>
              <Field label="Compounding" hint="How often returns are reinvested">
                <div className="relative">
                  <select value={compoundPerYear} onChange={(event) => setCompoundPerYear(Number(event.target.value))} className="tool-input appearance-none pr-10">
                    <option value={1}>Yearly</option><option value={12}>Monthly</option><option value={52}>Weekly</option><option value={365}>Daily</option>
                  </select>
                  <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#662E91]">⌄</span>
                </div>
              </Field>
            </div>

            <div className="border-t border-[#E6DFEA] bg-[#FAF8FB] px-6 py-5 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-[#766D7E]">Scenario summary</span>
                <span className="font-semibold text-[#30283B]">{money(principal)} at {apy}% APY for {months} months</span>
              </div>
            </div>
          </div>

          <aside className="overflow-hidden bg-[#190B23] text-white shadow-[0_24px_70px_rgba(39,17,52,0.16)]">
            <div className="border-b border-white/15 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DCC8EB]">Projected outcome</p>
              <p className="mt-5 text-sm text-white/65">Estimated portfolio value</p>
              <p className="mt-2 break-words text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-none tracking-[-0.055em]">{money(result.finalAmount)}</p>
              <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
                <div><p className="text-xs uppercase tracking-[0.14em] text-white/55">Total yield</p><p className="mt-2 text-xl font-semibold text-[#F2B35F]">+{money(result.profit)}</p></div>
                <div><p className="text-xs uppercase tracking-[0.14em] text-white/55">Return</p><p className="mt-2 text-xl font-semibold text-[#D8C0E8]">{result.effectiveReturn.toFixed(2)}%</p></div>
              </div>
            </div>
            <div className="px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Growth checkpoints</h2><span className="text-xs text-white/50">Compounded</span></div>
              <div className="mt-6 space-y-5">
                {result.checkpoints.map((checkpoint) => (
                  <div key={`${checkpoint.label}-${checkpoint.progress}`}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-xs"><span className="text-white/60">{checkpoint.label}</span><span className="font-semibold text-white">{money(checkpoint.value)}</span></div>
                    <div className="h-1 bg-white/10"><div className="h-full bg-[#A77AC5]" style={{ width: `${checkpoint.progress * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12 grid gap-8 border-t border-[#DDD4E3] pt-8 md:grid-cols-3">
          {[
            ["Rate consistency", "The estimate assumes the selected APY remains unchanged throughout the period."],
            ["Automatic reinvestment", "Each compounding event is treated as if earned yield is immediately redeployed."],
            ["Risk still matters", "Use this projection alongside protocol, liquidity, smart-contract, and market-risk research."],
          ].map(([title, copy], index) => (
            <div key={title} className="grid grid-cols-[32px_1fr] gap-4"><span className="pt-0.5 text-xs font-semibold text-[#A993BC]">0{index + 1}</span><div><h3 className="font-semibold text-[#30283B]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#766D7E]">{copy}</p></div></div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-semibold text-[#30283B]">{label}</span><span className="mb-3 mt-1 block text-xs text-[#92889A]">{hint}</span>{children}</label>;
}
