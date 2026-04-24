"use client";

import { useEffect, useState } from "react";

import {
  TABS,
  type DefiTabId,
  type TickerResponse,
} from "@/lib/defiIntelligence";

import ComparePanel from "./ComparePanel";
import HeatmapPanel from "./HeatmapPanel";
import IntelligencePanel from "./IntelligencePanel";
import PerpsPanel from "./PerpsPanel";
import SignalsPanel from "./SignalsPanel";
import TickerStrip from "./TickerStrip";

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

    loadTicker();
    const timer = window.setInterval(loadTicker, 5_000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
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

        <div className={tab === "intelligence" ? "block" : "hidden"}>
          <IntelligencePanel
            globalMarketCap={ticker?.globalMarketCap ?? null}
          />
        </div>
        <div className={tab === "compare" ? "block" : "hidden"}>
          <ComparePanel active={tab === "compare"} />
        </div>
        <div className={tab === "heatmap" ? "block" : "hidden"}>
          <HeatmapPanel active={tab === "heatmap"} />
        </div>
        <div className={tab === "signals" ? "block" : "hidden"}>
          <SignalsPanel active={tab === "signals"} />
        </div>
        <div className={tab === "perps" ? "block" : "hidden"}>
          <PerpsPanel active={tab === "perps"} />
        </div>
      </div>
    </>
  );
}
