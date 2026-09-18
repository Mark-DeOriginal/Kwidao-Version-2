"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
      <div className="di-shell mx-4 space-y-5 md:mx-8 lg:mx-12">
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
