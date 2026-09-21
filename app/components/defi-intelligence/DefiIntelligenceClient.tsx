"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeftIcon } from "@/app/components/icons/ArrowIcons";

import {
  TABS,
  type DefiTabId,
  type TickerResponse,
} from "@/lib/defiIntelligence";

import IntelligencePanel from "./IntelligencePanel";
import TickerStrip from "./TickerStrip";

const ComparePanel = dynamic(() => import("./ComparePanel"));
const HeatmapPanel = dynamic(() => import("./HeatmapPanel"));
const SignalsPanel = dynamic(() => import("./SignalsPanel"));
const PerpsPanel = dynamic(() => import("./PerpsPanel"));

export default function DefiIntelligenceClient() {
  const [tab, setTab] = useState<DefiTabId>("intelligence");
  const [ticker, setTicker] = useState<TickerResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTicker = async () => {
      try {
        const response = await fetch("/api/defi-intelligence?section=ticker");
        if (!response.ok) return;
        const payload = (await response.json()) as TickerResponse;
        if (mounted) setTicker(payload);
      } catch {
        // Keep the page usable if ticker fails.
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadTicker();
    };
    refreshWhenVisible();
    const timer = window.setInterval(refreshWhenVisible, 30_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      mounted = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return (
    <>
      <TickerStrip items={ticker?.items ?? []} />
      <div className="di-shell mx-auto w-full max-w-[1600px] space-y-6 px-6 pb-8 pt-10 sm:px-10 lg:px-12 xl:px-16">
        <header className="grid gap-6 border-b border-[#DDD4E3] pb-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <Link href="/tools" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#662E91] no-underline hover:text-[#542477]"><ArrowLeftIcon className="h-4 w-4 shrink-0" /> All tools</Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#662E91]">DeFi intelligence</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,4vw,3.7rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[#190B23]">One workspace for onchain market context.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6A6272]">Query market intelligence, compare assets, scan heatmaps, review signals, and study perpetual DEX activity without switching tools.</p>
          </div>
          <div className="grid grid-cols-2 border-y border-[#DDD4E3] py-5">
            <div><p className="text-2xl font-semibold text-[#190B23]">6</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#92889A]">Agents</p></div>
            <div className="border-l border-[#DDD4E3] pl-6"><p className="text-2xl font-semibold text-[#190B23]">24/7</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#92889A]">Coverage</p></div>
          </div>
        </header>
        <section className="di-tabsbar">
          <div className="di-tabs">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={tab === item.id ? "di-tab active" : "di-tab"}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {tab === "intelligence" ? (
          <IntelligencePanel
            globalMarketCap={ticker?.globalMarketCap ?? null}
          />
        ) : null}
        {tab === "compare" ? <ComparePanel active /> : null}
        {tab === "heatmap" ? <HeatmapPanel active /> : null}
        {tab === "signals" ? <SignalsPanel active /> : null}
        {tab === "perps" ? <PerpsPanel active /> : null}
      </div>
    </>
  );
}
