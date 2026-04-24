"use client";

import { useEffect, useMemo, useState } from "react";

import {
  HEATMAP_OPTIONS,
  formatCompact,
  formatCurrency,
  formatPct,
  type HeatmapCategory,
  type HeatmapResponse,
} from "@/lib/defiIntelligence";

import SectionHeading from "./SectionHeading";

function cellBackground(change: number | null | undefined) {
  if (change == null || !Number.isFinite(change)) return "var(--theme-surface-strong)";
  if (change >= 5) return "color-mix(in srgb, var(--theme-positive) 24%, white)";
  if (change >= 1) return "color-mix(in srgb, var(--theme-positive) 14%, white)";
  if (change <= -5) return "color-mix(in srgb, var(--theme-danger) 22%, white)";
  if (change <= -1) return "color-mix(in srgb, var(--theme-danger) 14%, white)";
  return "var(--theme-surface-strong)";
}

export default function HeatmapPanel({ active }: { active: boolean }) {
  const [category, setCategory] = useState<HeatmapCategory>("decentralized-finance-defi");
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHeatmap = async (nextCategory: HeatmapCategory) => {
    setCategory(nextCategory);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/defi-intelligence?section=heatmap&category=${encodeURIComponent(nextCategory)}`);
      const payload = (await response.json()) as HeatmapResponse & { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.message || payload.error || "Heatmap request failed");
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Heatmap request failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active || loading || data) return;
    loadHeatmap(category);
  }, [active, category, data, loading]);

  const maxMcap = useMemo(() => Math.max(...(data?.coins ?? []).map((c) => c.market_cap), 1), [data]);

  return (
    <section className="di-panel">
      <SectionHeading
        eyebrow="Market Heatmap"
        title="Live DeFi performance map"
        description="Top tokens sized by market cap and colored by 24h performance. Live from CoinGecko."
      />

      <div className="mt-7 flex flex-wrap items-center gap-2">
        {HEATMAP_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => loadHeatmap(option.id)}
            className={category === option.id ? "theme-button-primary px-4 py-2 text-sm" : "theme-button-secondary px-4 py-2 text-sm"}
          >
            {option.label}
          </button>
        ))}
        <button type="button" onClick={() => loadHeatmap(category)} className="theme-button-secondary ml-auto px-4 py-2 text-sm">
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--theme-text-soft)]">
        <span>{`< -5%`}</span>
        <span>-5% to -1%</span>
        <span>~ Flat</span>
        <span>+1% to +5%</span>
        <span>{`> +5%`}</span>
      </div>

      {loading ? <p className="mt-6 text-sm text-[var(--theme-text-soft)]">Loading heatmap...</p> : null}
      {error ? <div className="mt-6 rounded-xl bg-[var(--theme-danger-soft)] px-4 py-3 text-sm">{error}</div> : null}

      {!loading && !error && data ? (
        <>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.coins.slice(0, 48).map((coin) => {
              const ratio = coin.market_cap / maxMcap;
              const spanClass = ratio > 0.6 ? "xl:col-span-2" : ratio > 0.3 ? "sm:col-span-2 xl:col-span-1" : "";
              return (
                <article key={coin.id} className={`rounded-2xl border border-white/70 p-4 ${spanClass}`} style={{ background: cellBackground(coin.price_change_percentage_24h) }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="font-semibold text-[var(--theme-text-strong)]">{coin.symbol.toUpperCase()}</p>
                        <p className="text-xs text-[var(--theme-text-soft)]">{coin.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[var(--theme-text-strong)]">{formatPct(coin.price_change_percentage_24h)}</span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[var(--theme-text-strong)]">
                    {formatCurrency(coin.current_price, coin.current_price < 1 ? 4 : 2)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--theme-text-soft)]">MCap {formatCompact(coin.market_cap)}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-[var(--theme-text-soft)]">Updated {new Date(data.updatedAt).toLocaleTimeString()}</p>
        </>
      ) : null}
    </section>
  );
}
