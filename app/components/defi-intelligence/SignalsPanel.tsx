"use client";

import { useEffect, useState } from "react";

import { formatCompact, formatCurrency, formatPct, tone, type SignalsResponse } from "@/lib/defiIntelligence";

import SectionHeading from "./SectionHeading";

function toneClass(value: number | null | undefined) {
  const t = tone(value);
  if (t === "up") return "text-[var(--theme-positive)]";
  if (t === "down") return "text-[var(--theme-danger)]";
  return "text-[var(--theme-text-soft)]";
}

function fgColor(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "var(--theme-text-soft)";
  if (value <= 25) return "#c0392b";
  if (value <= 45) return "#e67e22";
  if (value <= 55) return "#b8a900";
  if (value <= 75) return "#6ab814";
  return "#27ae60";
}

export default function SignalsPanel({ active }: { active: boolean }) {
  const [data, setData] = useState<SignalsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/defi-intelligence?section=signals");
      const payload = (await response.json()) as SignalsResponse & { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.message || payload.error || "Signals request failed");
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Signals request failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active || data || loading) return;
    fetchSignals();
  }, [active, data, loading]);

  const fg = data?.fearAndGreed?.value ?? 0;
  const arc = `${(Math.max(Math.min(fg, 100), 0) / 100) * 283} 283`;
  const fgStroke = fgColor(fg);

  return (
    <section className="di-panel">
      <SectionHeading
        eyebrow="Market Signals"
        title="Live sentiment and trending"
        description="Fear and Greed index, CoinGecko trending tokens, and key market pulse metrics - all live."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="theme-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">BTC Price</p>
          <p className="mt-2 text-xl font-semibold text-[var(--theme-text-strong)]">{formatCurrency(data?.pulse.bitcoin)}</p>
        </div>
        <div className="theme-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">ETH Price</p>
          <p className="mt-2 text-xl font-semibold text-[var(--theme-text-strong)]">{formatCurrency(data?.pulse.ethereum)}</p>
        </div>
        <div className="theme-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">AVAX Price</p>
          <p className="mt-2 text-xl font-semibold text-[var(--theme-text-strong)]">{formatCurrency(data?.pulse.avalanche)}</p>
        </div>
        <div className="theme-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">BTC Dominance</p>
          <p className="mt-2 text-xl font-semibold text-[var(--theme-text-strong)]">{formatPct(data?.pulse.btcDominance)}</p>
        </div>
      </div>

      {loading ? <p className="mt-6 text-sm text-[var(--theme-text-soft)]">Loading live signals...</p> : null}
      {error ? <div className="mt-6 rounded-xl bg-[var(--theme-danger-soft)] px-4 py-3 text-sm">{error}</div> : null}

      {!loading && !error && data ? (
        <div className="mt-7 space-y-6">
          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="theme-card rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Fear and Greed Index</p>
              <div className="mx-auto mt-3 h-[120px] w-[220px]">
                <div className="relative h-[120px] w-[220px]">
                  <svg viewBox="0 0 220 120" className="h-[120px] w-[220px]">
                    <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="var(--theme-border-subtle)" strokeWidth="16" strokeLinecap="round" />
                    <path
                      className="defi-arc"
                      d="M 20 110 A 90 90 0 0 1 200 110"
                      fill="none"
                      stroke={fgStroke}
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={arc}
                    />
                  </svg>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-5xl font-extrabold leading-none text-[var(--theme-text-strong)]">
                    {data.fearAndGreed?.value ?? "-"}
                  </div>
                </div>
              </div>
              <p className="mt-1 text-center text-xs font-bold uppercase tracking-[0.12em]" style={{ color: fgColor(data.fearAndGreed?.value) }}>
                {data.fearAndGreed?.classification ?? "Unavailable"}
              </p>
              <p className="mx-auto mt-1 max-w-[220px] text-center text-xs leading-5 text-[var(--theme-text-soft)]">
                {data.fearAndGreed?.hint ?? "Fetching from Alternative.me..."}
              </p>
              <div className="mt-4 flex h-1.5 overflow-hidden rounded">
                <span className="h-1.5 flex-1 bg-[#c0392b]" />
                <span className="h-1.5 flex-1 bg-[#e67e22]" />
                <span className="h-1.5 flex-1 bg-[#f0fa40]/70" />
                <span className="h-1.5 flex-1 bg-[#6ab814]" />
                <span className="h-1.5 flex-1 bg-[#27ae60]" />
              </div>
              <div className="mt-1 grid grid-cols-5 text-[10px] text-[var(--theme-text-soft)]">
                <span className="text-left">Extreme Fear</span>
                <span className="text-center">Fear</span>
                <span className="text-center">Neutral</span>
                <span className="text-center">Greed</span>
                <span className="text-right">Extreme Greed</span>
              </div>
            </div>

            <div className="theme-card rounded-2xl p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Trending on CoinGecko</p>
                <p className="text-xs text-[var(--theme-text-soft)]">{new Date(data.updatedAt).toLocaleTimeString()}</p>
              </div>
              <div className="mt-4 space-y-3">
                {data.trending.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--theme-border-subtle)] bg-white/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img src={coin.thumb} alt={coin.name} className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="font-semibold text-[var(--theme-text-strong)]">{coin.symbol}</p>
                        <p className="text-xs text-[var(--theme-text-soft)]">{coin.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[var(--theme-text-strong)]">{formatCurrency(coin.price, coin.price != null && coin.price < 1 ? 4 : 2)}</p>
                      <p className={`text-xs font-semibold ${toneClass(coin.change24h)}`}>{formatPct(coin.change24h)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="theme-card rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Top Gainers - 24h</p>
              <div className="mt-3 space-y-2">
                {data.gainers.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between rounded-xl border border-[color:var(--theme-border-subtle)] bg-white/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full" />
                      <span className="font-medium text-[var(--theme-text-strong)]">{coin.symbol}</span>
                    </div>
                    <span className="text-[var(--theme-positive)]">{formatPct(coin.price_change_percentage_24h)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="theme-card rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Top Losers - 24h</p>
              <div className="mt-3 space-y-2">
                {data.losers.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between rounded-xl border border-[color:var(--theme-border-subtle)] bg-white/60 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full" />
                      <span className="font-medium text-[var(--theme-text-strong)]">{coin.symbol}</span>
                    </div>
                    <span className="text-[var(--theme-danger)]">{formatPct(coin.price_change_percentage_24h)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="theme-card rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Hot on DexScreener</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.hotPairs.map((pair) => (
                <div key={`${pair.chainId}-${pair.tokenAddress}`} className="rounded-xl border border-[color:var(--theme-border-subtle)] bg-white/60 p-3">
                  <p className="text-sm font-semibold text-[var(--theme-text-strong)]">{pair.symbol}</p>
                  <p className="text-xs text-[var(--theme-text-soft)]">{pair.name}</p>
                  <p className="mt-2 text-sm text-[var(--theme-text-strong)]">{formatCurrency(pair.priceUsd, pair.priceUsd != null && pair.priceUsd < 1 ? 4 : 2)}</p>
                  <p className={`text-xs font-semibold ${toneClass(pair.change24h)}`}>{formatPct(pair.change24h)}</p>
                  <p className="mt-1 text-xs text-[var(--theme-text-soft)]">Vol {formatCompact(pair.volume24h)}</p>
                  <p className="text-xs text-[var(--theme-text-soft)]">Liq {formatCompact(pair.liquidityUsd)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-card rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Price Arbitrage Scanner</p>
              <button type="button" onClick={fetchSignals} className="theme-button-secondary px-3 py-1.5 text-xs">
                Refresh
              </button>
            </div>
            <p className="mt-2 text-sm text-[var(--theme-text-soft)]">
              Cross-DEX spreads plus perp basis versus spot reference from CoinGecko derivatives.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[color:var(--theme-border-subtle)] text-xs uppercase tracking-[0.14em] text-[var(--theme-text-soft)]">
                  <tr>
                    <th className="px-3 py-2">Token</th>
                    <th className="px-3 py-2">Spread %</th>
                    <th className="px-3 py-2">High Venue</th>
                    <th className="px-3 py-2">Low Venue</th>
                    <th className="px-3 py-2">Idea</th>
                  </tr>
                </thead>
                <tbody>
                  {data.arbitrage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-5 text-center text-xs text-[var(--theme-text-soft)]">
                        Arbitrage rows are temporarily unavailable from the upstream derivatives feed. Try refresh.
                      </td>
                    </tr>
                  ) : (
                    data.arbitrage.map((row) => (
                      <tr key={`${row.sym}-${row.highVenue}-${row.lowVenue}`} className="border-b border-[color:var(--theme-border-subtle)]">
                        <td className="px-3 py-2 font-semibold text-[var(--theme-text-strong)]">{row.sym}</td>
                        <td className={`px-3 py-2 font-semibold ${toneClass(row.spread)}`}>
                          {row.spread.toFixed(3)}%
                          {row.basis != null ? <span className="ml-2 text-xs text-[var(--theme-text-soft)]">basis {formatPct(row.basis, 3)}</span> : null}
                        </td>
                        <td className="px-3 py-2 text-[var(--theme-text-soft)]">{row.highVenue}</td>
                        <td className="px-3 py-2 text-[var(--theme-text-soft)]">{row.lowVenue}</td>
                        <td className="px-3 py-2 text-xs text-[var(--theme-text-strong)]">
                          {row.count > 1 ? `Long ${row.lowVenue} / Short ${row.highVenue}` : row.basis != null && row.basis > 0 ? "Short perp + long spot" : "Long perp + short spot"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[var(--theme-text-soft)]">
              Updated {new Date(data.updatedAt).toLocaleTimeString()} - Source: CoinGecko derivatives - {data.arbitrageContractCount ?? 0} contracts
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
