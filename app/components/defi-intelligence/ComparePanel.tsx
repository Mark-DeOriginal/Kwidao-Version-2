"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  COMPARE_PRESETS,
  type CompareChartType,
  type CompareLiteResponse,
  formatCompact,
  formatCurrency,
  formatPct,
  type CompareMetric,
  type CompareResponse,
} from "@/lib/defiIntelligence";

import SectionHeading from "./SectionHeading";

function valueByMetric(metric: CompareMetric, coin: CompareResponse["coins"][number]) {
  if (metric === "24h") return coin.price_change_percentage_24h ?? 0;
  if (metric === "7d") return coin.price_change_percentage_7d_in_currency ?? 0;
  if (metric === "30d") return coin.price_change_percentage_30d_in_currency ?? 0;
  if (metric === "mcap") return coin.market_cap ?? 0;
  return coin.total_volume ?? 0;
}

const CHART_COLORS = [
  "#e07040",
  "#9060d0",
  "#e8904a",
  "#5c9be0",
  "#e05c5c",
  "#6ab814",
];

const CHART_FILLS = [
  "rgba(224,112,64,0.16)",
  "rgba(144,96,208,0.16)",
  "rgba(232,144,74,0.16)",
  "rgba(92,155,224,0.16)",
  "rgba(224,92,92,0.16)",
  "rgba(106,184,20,0.16)",
];

function withAlpha(color: string, alpha: number) {
  const normalized = color.replace("#", "");
  if (normalized.length !== 6) return `rgba(144,96,208,${alpha})`;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type ChartJsLike = {
  new (ctx: HTMLCanvasElement, config: Record<string, unknown>): { destroy: () => void };
};

declare global {
  interface Window {
    Chart?: ChartJsLike;
    __diChartLoader?: Promise<ChartJsLike>;
  }
}

function loadChartJsCdn(): Promise<ChartJsLike> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window unavailable"));
  }
  if (window.Chart) return Promise.resolve(window.Chart);
  if (window.__diChartLoader) return window.__diChartLoader;

  window.__diChartLoader = new Promise<ChartJsLike>((resolve, reject) => {
    const existing = document.querySelector('script[data-di-chartjs="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.Chart) resolve(window.Chart);
        else reject(new Error("Chart.js failed to initialize"));
      });
      existing.addEventListener("error", () => reject(new Error("Chart.js failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    script.async = true;
    script.dataset.diChartjs = "true";
    script.onload = () => {
      if (window.Chart) resolve(window.Chart);
      else reject(new Error("Chart.js failed to initialize"));
    };
    script.onerror = () => reject(new Error("Chart.js failed to load"));
    document.head.appendChild(script);
  });

  return window.__diChartLoader;
}

function SparklineCanvas({
  coinId,
  spark,
  stroke,
}: {
  coinId: string;
  spark: number[];
  stroke: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let chart: { destroy: () => void } | null = null;
    let cancelled = false;

    const render = async () => {
      if (!canvasRef.current || !spark.length) return;
      try {
        const Chart = await loadChartJsCdn();
        if (cancelled || !canvasRef.current) return;

        chart = new Chart(canvasRef.current, {
          type: "line",
          data: {
            labels: spark.map((_, i) => i),
            datasets: [
              {
                data: spark,
                borderColor: stroke,
                backgroundColor: withAlpha(stroke, 0.1),
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 850 },
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: {
                ticks: { color: "#9078c0", font: { size: 10 } },
                grid: { color: "rgba(150,90,220,.06)" },
              },
            },
          },
        });
      } catch {
        // keep card visible even if CDN fails
      }
    };

    render();
    return () => {
      cancelled = true;
      if (chart) chart.destroy();
    };
  }, [coinId, spark, stroke]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}

export default function ComparePanel({ active }: { active: boolean }) {
  const [ids, setIds] = useState("bitcoin, ethereum, avalanche-2, solana");
  const [metric, setMetric] = useState<CompareMetric>("24h");
  const [chartType, setChartType] = useState<CompareChartType>("bar");
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompare = async (idsInput: string, options?: { silent?: boolean; lite?: boolean }) => {
    const silent = options?.silent === true;
    const lite = options?.lite === true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await fetch(
        `/api/defi-intelligence?section=compare&ids=${encodeURIComponent(idsInput)}${lite ? "&lite=1" : ""}`,
      );
      const payload = (await response.json()) as (CompareResponse | CompareLiteResponse) & { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.message || payload.error || "Compare request failed");
      if (lite) {
        const litePayload = payload as CompareLiteResponse;
        setData((current) => {
          if (!current) return current;
          const updates = new Map(litePayload.updates.map((row) => [row.id, row]));
          return {
            ...current,
            updatedAt: litePayload.updatedAt,
            coins: current.coins.map((coin) => {
              const update = updates.get(coin.id);
              if (!update) return coin;
              return {
                ...coin,
                current_price: update.current_price ?? coin.current_price,
                price_change_percentage_24h:
                  update.price_change_percentage_24h ?? coin.price_change_percentage_24h,
              };
            }),
          };
        });
      } else {
        setData(payload as CompareResponse);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Compare request failed.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!active || data || loading) return;
    fetchCompare(ids);
  }, [active, data, loading, ids]);

  useEffect(() => {
    if (!active || !data) return;
    const timer = window.setInterval(() => {
      fetchCompare(ids, { silent: true, lite: true });
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [active, data, ids]);

  const bars = useMemo(
    () =>
      (data?.coins ?? []).map((coin) => ({
        id: coin.id,
        label: coin.symbol.toUpperCase(),
        value: valueByMetric(metric, coin),
      })),
    [data, metric],
  );

  const maxBar = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);
  const hasAnySparklines = (data?.coins ?? []).some((coin) => (coin.sparkline_in_7d?.price ?? []).length > 0);

  const radarAxes = [
    { key: "price_change_percentage_24h", label: "24h" },
    { key: "price_change_percentage_7d_in_currency", label: "7d" },
    { key: "price_change_percentage_30d_in_currency", label: "30d" },
    { key: "market_cap", label: "MCap" },
    { key: "total_volume", label: "Vol" },
  ] as const;

  const radarData = useMemo(() => {
    const coins = data?.coins ?? [];
    return radarAxes.map((axis) => {
      const rawVals = coins.map((coin) => Math.abs(Number(coin[axis.key] ?? 0)));
      const max = Math.max(...rawVals, 1);
      const row: Record<string, number | string> = { metric: axis.label };
      coins.forEach((coin) => {
        row[coin.symbol.toUpperCase()] = (Math.abs(Number(coin[axis.key] ?? 0)) / max) * 100;
      });
      return row;
    });
  }, [data]);

  return (
    <section className="di-panel">
      <SectionHeading
        eyebrow="Asset Comparison Engine"
        title="Compare any 2-6 assets side by side"
        description="Live data from CoinGecko. Compare price performance, market cap, volume, and 7-day context."
      />

      <div className="mt-8 rounded-3xl border border-[color:var(--theme-border-subtle)] bg-white/70 p-5 md:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_170px_160px]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--theme-primary-weak)]">
              Assets (comma separated - names or symbols)
            </span>
            <input
              value={ids}
              onChange={(event) => setIds(event.target.value)}
              className="theme-field h-12 w-full rounded-xl px-4 outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--theme-primary-weak)]">Metric</span>
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value as CompareMetric)}
              className="theme-field h-12 w-full rounded-xl px-3 outline-none"
            >
              <option value="24h">24h % Change</option>
              <option value="7d">7d % Change</option>
              <option value="30d">30d % Change</option>
              <option value="mcap">Market Cap</option>
              <option value="volume">24h Volume</option>
            </select>
          </label>
          <button type="button" onClick={() => fetchCompare(ids)} className="theme-button-primary h-12 px-5 text-sm">
            Compare -&gt;
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMPARE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setIds(preset.ids);
                fetchCompare(preset.ids);
              }}
              className="theme-button-secondary px-3 py-2 text-xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="mt-7 text-sm text-[var(--theme-text-soft)]">Fetching live data from CoinGecko...</div> : null}
      {error ? <div className="mt-7 rounded-xl bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-text-strong)]">{error}</div> : null}

      {data && !loading && !error ? (
        <div className="mt-7 space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={chartType === "bar" ? "theme-button-primary px-3 py-2 text-xs" : "theme-button-secondary px-3 py-2 text-xs"}
            >
              Bar Chart
            </button>
            <button
              type="button"
              onClick={() => setChartType("radar")}
              className={chartType === "radar" ? "theme-button-primary px-3 py-2 text-xs" : "theme-button-secondary px-3 py-2 text-xs"}
            >
              Radar
            </button>
            <button
              type="button"
              onClick={() => setChartType("sparkline")}
              className={chartType === "sparkline" ? "theme-button-primary px-3 py-2 text-xs" : "theme-button-secondary px-3 py-2 text-xs"}
            >
              7d Sparklines
            </button>
          </div>

          {chartType === "bar" ? (
            <div className="theme-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-primary)]">Bar Chart</h3>
              <div className="mt-4 h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border-subtle)" />
                    <XAxis dataKey="label" tick={{ fill: "var(--theme-text-soft)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--theme-text-soft)", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) =>
                        metric === "mcap" || metric === "volume"
                          ? formatCompact(Number(value))
                          : formatPct(Number(value))
                      }
                    />
                    <Bar dataKey="value" fill="var(--theme-primary)" radius={[6, 6, 0, 0]} animationDuration={850} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {chartType === "radar" ? (
            <div className="theme-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--theme-primary)]">
                Multi-Metric Radar (normalised 0-100)
              </h3>
              <div className="mt-4 h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--theme-border-subtle)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--theme-text-soft)", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip />
                    {data.coins.map((coin, idx) => (
                      <Radar
                        key={`${coin.id}-radar`}
                        name={coin.symbol.toUpperCase()}
                        dataKey={coin.symbol.toUpperCase()}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        fill={CHART_FILLS[idx % CHART_FILLS.length]}
                        fillOpacity={1}
                        strokeWidth={2}
                        animationDuration={900}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {chartType === "sparkline" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {!hasAnySparklines ? (
                <div className="theme-card rounded-2xl p-8 md:col-span-2 xl:col-span-3">
                  <p className="text-center text-sm leading-7 text-[var(--theme-text-soft)]">
                    Sparkline data unavailable (rate limit or API tier). Switch to <strong>Bar Chart</strong> or{" "}
                    <strong>Radar</strong> view.
                  </p>
                </div>
              ) : null}
              {data.coins.map((coin, idx) => {
                const spark = coin.sparkline_in_7d?.price ?? [];
                const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
                const stroke = change7d >= 0 ? CHART_COLORS[idx % CHART_COLORS.length] : "#e05c5c";

                return (
                  <div key={`${coin.id}-spark`} className="theme-card rounded-2xl p-4">
                    <h4 className="text-[13px] font-semibold text-[var(--theme-text-strong)]">
                      {coin.symbol.toUpperCase()} — 7-Day Price
                    </h4>
                    <div className="mt-3 flex items-center justify-between text-[13px]">
                      <span className="font-bold text-[var(--theme-text-strong)]">
                        {formatCurrency(coin.current_price, coin.current_price < 1 ? 4 : 2)}
                      </span>
                      <span className={change7d >= 0 ? "font-bold text-[var(--theme-positive)]" : "font-bold text-[var(--theme-danger)]"}>
                        {formatPct(change7d)} 7d
                      </span>
                    </div>
                    {spark.length ? (
                      <div className="mt-3 h-[135px]">
                        <SparklineCanvas coinId={coin.id} spark={spark} stroke={stroke} />
                      </div>
                    ) : (
                      <div className="mt-6 text-center text-sm text-[var(--theme-text-soft)]">No sparkline data</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="theme-table-shell">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[color:var(--theme-surface-contrast)] text-xs uppercase tracking-[0.16em] text-[var(--theme-text-soft)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Asset</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">24h</th>
                    <th className="px-4 py-3 text-left">7d</th>
                    <th className="px-4 py-3 text-left">30d</th>
                    <th className="px-4 py-3 text-left">Market Cap</th>
                    <th className="px-4 py-3 text-left">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {data.coins.map((coin) => (
                    <tr key={coin.id} className="border-t border-[color:var(--theme-border-subtle)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                          <div>
                            <p className="font-semibold text-[var(--theme-text-strong)]">{coin.name}</p>
                            <p className="text-xs uppercase tracking-[0.15em] text-[var(--theme-text-soft)]">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{formatCurrency(coin.current_price, coin.current_price < 1 ? 4 : 2)}</td>
                      <td className="px-4 py-3">{formatPct(coin.price_change_percentage_24h)}</td>
                      <td className="px-4 py-3">{formatPct(coin.price_change_percentage_7d_in_currency)}</td>
                      <td className="px-4 py-3">{formatPct(coin.price_change_percentage_30d_in_currency)}</td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{formatCompact(coin.market_cap)}</td>
                      <td className="px-4 py-3 text-[var(--theme-text-soft)]">{formatCompact(coin.total_volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-[var(--theme-text-soft)]">
            Last updated: {new Date(data.updatedAt).toLocaleTimeString()} - Source: CoinGecko
          </p>
        </div>
      ) : null}
    </section>
  );
}
