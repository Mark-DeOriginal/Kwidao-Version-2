"use client";

import { useEffect, useMemo, useState } from "react";

import {
  PERP_FILTERS,
  PERP_SNAPSHOT_LABEL,
  formatCompact,
  type PerpFilter,
  type PerpsResponse,
} from "@/lib/defiIntelligence";

import SectionHeading from "./SectionHeading";

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFromName(name: string) {
  const parts = name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/[\s/-]+/g)
    .filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return (letters.join("") || name.slice(0, 2).toUpperCase()).replace(/[^A-Z0-9]/g, "");
}

function fallbackLogoDataUri(name: string) {
  const palette = ["#0ea5e9", "#f97316", "#8b5cf6", "#22c55e", "#ef4444", "#14b8a6", "#eab308"];
  const idx = hashString(name) % palette.length;
  const bg = palette[idx];
  const text = initialsFromName(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="0" y="0" width="64" height="64" rx="12" fill="${bg}"/>
  <text x="32" y="38" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="22" font-weight="700" fill="#ffffff">${text}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function ExchangeLogo({ name, src }: { name: string; src: string | null }) {
  const [current, setCurrent] = useState(() => src || fallbackLogoDataUri(name));

  useEffect(() => {
    setCurrent(src || fallbackLogoDataUri(name));
  }, [name, src]);

  return (
    <img
      src={current}
      alt={name}
      className="h-7 w-7 rounded-md border border-[color:var(--theme-border-subtle)] bg-white/70 object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setCurrent(fallbackLogoDataUri(name))}
    />
  );
}

export default function PerpsPanel({ active }: { active: boolean }) {
  const [data, setData] = useState<PerpsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PerpFilter>("all");
  const [sortKey, setSortKey] = useState<"dailyVolume" | "openInterest">("dailyVolume");
  const [sortAsc, setSortAsc] = useState(false);

  const fetchPerps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/defi-intelligence?section=perps");
      const payload = (await response.json()) as PerpsResponse & { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.message || payload.error || "Perps request failed");
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Perps request failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active || data || loading) return;
    fetchPerps();
  }, [active, data, loading]);

  const rows = useMemo(() => {
    const source = data?.exchanges ?? [];
    const filtered = filter === "all" ? source : source.filter((row) => row.filter === filter);
    const launched = filtered.filter((row) => row.launched);
    const prelaunch = filtered.filter((row) => !row.launched);
    const sorted = [...launched].sort((a, b) => {
      const diff = b[sortKey] - a[sortKey];
      return sortAsc ? -diff : diff;
    });
    return { sorted, prelaunch };
  }, [data, filter, sortKey, sortAsc]);

  const totalVol = rows.sorted.reduce((sum, row) => sum + row.dailyVolume, 0);

  return (
    <section className="di-panel">
      <SectionHeading
        eyebrow="Perpetual DEX Intelligence"
        title="Perp DEX Rankings"
        description="Live data from CoinGecko derivatives. Open Interest, 24h Volume converted to USD via BTC price, and curated fee schedules for tracked perp exchanges."
      />

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="theme-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Total Volume 24H</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-strong)]">{formatCompact(data?.totalVolume)}</p>
          <p className="mt-2 text-xs text-[var(--theme-text-soft)]">{data?.liveExchangeCount ?? 0} live via CoinGecko</p>
        </div>
        <div className="theme-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Open Interest</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-strong)]">{formatCompact(data?.totalOpenInterest)}</p>
          <p className="mt-2 text-xs text-[var(--theme-text-soft)]">Live derivatives exchange snapshot</p>
        </div>
        <div className="theme-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">Tracked DEXes</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-strong)]">{data?.exchanges.length ?? 0}</p>
          <p className="mt-2 text-xs text-[var(--theme-text-soft)]">Snapshot {PERP_SNAPSHOT_LABEL}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {PERP_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={filter === item.id ? "theme-button-primary px-4 py-2 text-sm" : "theme-button-secondary px-4 py-2 text-sm"}
          >
            {item.label}
          </button>
        ))}
        <button type="button" onClick={fetchPerps} className="theme-button-secondary ml-auto px-4 py-2 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-6 text-sm text-[var(--theme-text-soft)]">Loading 46 DEX perp protocols...</p> : null}
      {error ? <div className="mt-6 rounded-xl bg-[var(--theme-danger-soft)] px-4 py-3 text-sm">{error}</div> : null}

      {!loading && !error && data ? (
        <>
          <div className="theme-table-shell mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--theme-surface-contrast)] text-xs uppercase tracking-[0.14em] text-[var(--theme-text-soft)]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortKey === "dailyVolume") setSortAsc((prev) => !prev);
                        else {
                          setSortKey("dailyVolume");
                          setSortAsc(false);
                        }
                      }}
                    >
                      Volume 24H
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortKey === "openInterest") setSortAsc((prev) => !prev);
                        else {
                          setSortKey("openInterest");
                          setSortAsc(false);
                        }
                      }}
                    >
                      Open Interest
                    </button>
                  </th>
                  <th className="px-4 py-3">Vol Share</th>
                  <th className="px-4 py-3">Maker Fee</th>
                  <th className="px-4 py-3">Taker Fee</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Airdrop</th>
                </tr>
              </thead>
              <tbody>
                {rows.sorted.map((row, idx) => {
                  const share = totalVol > 0 ? (row.dailyVolume / totalVol) * 100 : 0;
                  return (
                    <tr key={row.name} className="border-t border-[color:var(--theme-border-subtle)]">
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ExchangeLogo name={row.name} src={row.logo} />
                          {row.url ? (
                            <a href={row.url} target="_blank" rel="noreferrer" className="font-semibold text-[var(--theme-text-strong)] hover:text-[var(--theme-primary)]">
                              {row.name}
                            </a>
                          ) : (
                            <span className="font-semibold text-[var(--theme-text-strong)]">{row.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.dailyVolume > 0 ? formatCompact(row.dailyVolume) : "-"}</td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.openInterest > 0 ? formatCompact(row.openInterest) : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="h-2 w-20 rounded-full bg-[var(--theme-surface-strong)]">
                          <div className="h-2 rounded-full bg-[var(--theme-primary)]" style={{ width: `${Math.min(share, 100)}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-[var(--theme-text-soft)]">{share.toFixed(1)}%</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.maker}</td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.taker}</td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.token}</td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.airdrop}</td>
                    </tr>
                  );
                })}
                {rows.prelaunch.length > 0 ? (
                  <tr className="border-t border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-contrast)]">
                    <td colSpan={9} className="px-4 py-3 text-xs uppercase tracking-[0.14em] text-[var(--theme-text-soft)]">
                      Pre-launch ({rows.prelaunch.length})
                    </td>
                  </tr>
                ) : null}
                {rows.prelaunch.map((row, idx) => (
                  <tr key={`${row.name}-pre`} className="border-t border-[color:var(--theme-border-subtle)] opacity-65">
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">{rows.sorted.length + idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--theme-text-strong)]">{row.name}</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">not launched</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">-</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">-</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.maker}</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.taker}</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.token}</td>
                    <td className="px-4 py-3 text-[var(--theme-text-soft)]">{row.airdrop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[var(--theme-text-soft)]">
            Source: perpdexlist.com (46 protocols) - Snapshot: {PERP_SNAPSHOT_LABEL} - Live enrichment: CoinGecko
          </p>
        </>
      ) : null}
    </section>
  );
}
