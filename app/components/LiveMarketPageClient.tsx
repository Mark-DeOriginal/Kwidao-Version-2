"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { resolveThemeToken } from "@/lib/theme";

interface AssetConfig {
  id: string;
  symbol: string;
  name: string;
}

interface PriceData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  marketCap: number;
  sparkline: number[];
  image?: string;
}

const TRACKED_ASSETS: AssetConfig[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "sui", symbol: "SUI", name: "Sui" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "toncoin", symbol: "TON", name: "Toncoin" },
  { id: "tron", symbol: "TRX", name: "TRON" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "aptos", symbol: "APT", name: "Aptos" },
];

const REFRESH_INTERVAL = 5000;
const CAROUSEL_SPEED = 0.55;
const TIMEFRAME_OPTIONS = [
  { id: "1H", label: "1H", points: 12 },
  { id: "4H", label: "4H", points: 24 },
  { id: "24H", label: "24H", points: 48 },
] as const;

type TimeframeId = (typeof TIMEFRAME_OPTIONS)[number]["id"];

const makeSparkline = (base: number, change24h: number): number[] => {
  const data: number[] = [];
  const amplitude = Math.max(base * 0.015, base * (Math.abs(change24h) / 100));
  for (let i = 0; i < 48; i += 1) {
    const trend = (i / 47 - 0.5) * amplitude * (change24h >= 0 ? 1 : -1);
    const noise = (Math.random() - 0.5) * amplitude * 0.8;
    data.push(Math.max(0.00001, base + trend + noise));
  }
  return data;
};

const FALLBACK_RAW: Record<
  string,
  {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
    usd_sparkline_7d: number[];
  }
> = {
  bitcoin: {
    usd: 65420,
    usd_24h_change: 2.6,
    usd_market_cap: 1270000000000,
    usd_sparkline_7d: makeSparkline(65420, 2.6),
  },
  ethereum: {
    usd: 3380,
    usd_24h_change: 1.4,
    usd_market_cap: 406000000000,
    usd_sparkline_7d: makeSparkline(3380, 1.4),
  },
  "avalanche-2": {
    usd: 43.2,
    usd_24h_change: 4.2,
    usd_market_cap: 17700000000,
    usd_sparkline_7d: makeSparkline(43.2, 4.2),
  },
  solana: {
    usd: 176.8,
    usd_24h_change: 3.5,
    usd_market_cap: 81600000000,
    usd_sparkline_7d: makeSparkline(176.8, 3.5),
  },
  ripple: {
    usd: 0.72,
    usd_24h_change: -0.8,
    usd_market_cap: 39800000000,
    usd_sparkline_7d: makeSparkline(0.72, -0.8),
  },
  sui: {
    usd: 2.05,
    usd_24h_change: 2.1,
    usd_market_cap: 6400000000,
    usd_sparkline_7d: makeSparkline(2.05, 2.1),
  },
  binancecoin: {
    usd: 585,
    usd_24h_change: 1.1,
    usd_market_cap: 83500000000,
    usd_sparkline_7d: makeSparkline(585, 1.1),
  },
  chainlink: {
    usd: 18.4,
    usd_24h_change: 2.9,
    usd_market_cap: 10800000000,
    usd_sparkline_7d: makeSparkline(18.4, 2.9),
  },
  dogecoin: {
    usd: 0.17,
    usd_24h_change: -1.9,
    usd_market_cap: 24700000000,
    usd_sparkline_7d: makeSparkline(0.17, -1.9),
  },
  cardano: {
    usd: 0.66,
    usd_24h_change: 0.5,
    usd_market_cap: 23400000000,
    usd_sparkline_7d: makeSparkline(0.66, 0.5),
  },
  polkadot: {
    usd: 8.35,
    usd_24h_change: 1.2,
    usd_market_cap: 12300000000,
    usd_sparkline_7d: makeSparkline(8.35, 1.2),
  },
  toncoin: {
    usd: 5.71,
    usd_24h_change: 2.4,
    usd_market_cap: 19700000000,
    usd_sparkline_7d: makeSparkline(5.71, 2.4),
  },
  tron: {
    usd: 0.24,
    usd_24h_change: 0.9,
    usd_market_cap: 21100000000,
    usd_sparkline_7d: makeSparkline(0.24, 0.9),
  },
  litecoin: {
    usd: 92.8,
    usd_24h_change: -0.7,
    usd_market_cap: 6950000000,
    usd_sparkline_7d: makeSparkline(92.8, -0.7),
  },
  uniswap: {
    usd: 12.2,
    usd_24h_change: 1.8,
    usd_market_cap: 7330000000,
    usd_sparkline_7d: makeSparkline(12.2, 1.8),
  },
  aptos: {
    usd: 14.6,
    usd_24h_change: 2.1,
    usd_market_cap: 8120000000,
    usd_sparkline_7d: makeSparkline(14.6, 2.1),
  },
};

const formatPrice = (value: number) => {
  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (value >= 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
};

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

function MiniSparkline({
  data,
  isPositive,
  id,
}: {
  data: number[];
  isPositive: boolean;
  id: string;
}) {
  if (data.length < 2) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((price, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 38 - ((price - min) / range) * 36;
    return `${x},${y}`;
  });

  const color = isPositive ? "#34d399" : "#f87171";
  const pathFill = `${points.join(" ")} 100,40 0,40`;
  const gradientId = `asset-gradient-${id}`;

  return (
    <svg
      viewBox="0 0 100 40"
      className="h-14 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={pathFill} fill={`url(#${gradientId})`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PulseTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;
  const change = Number(point?.change ?? 0);
  const changeColor =
    change >= 0 ? "text-[var(--theme-positive)]" : "text-[var(--theme-danger)]";

  return (
    <div className="rounded-lg border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-contrast-strong)] px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold text-[var(--theme-text-strong)]">
        {point?.price?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      <p className={`mt-1 ${changeColor}`}>
        {change >= 0 ? "+" : ""}
        {change.toFixed(2)}% vs previous point
      </p>
    </div>
  );
}

export default function LiveMarketPageClient() {
  const [assets, setAssets] = useState<PriceData[]>([]);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const [isCarouselReady, setIsCarouselReady] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeId>("24H");
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const chartTheme = useMemo(
    () => ({
      primary: resolveThemeToken("primary"),
      accent: resolveThemeToken("accent"),
      canvas: resolveThemeToken("canvas"),
      textMuted: resolveThemeToken("textMuted"),
      border: resolveThemeToken("border"),
    }),
    [],
  );

  const loadMarketData = useCallback(async () => {
    try {
      const ids = TRACKED_ASSETS.map((asset) => asset.id).join(",");
      const response = await fetch(`/api/market-prices?coins=${ids}`, {
        headers: { "Cache-Control": "no-store" },
      });

      if (!response.ok) {
        throw new Error(`Market API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to load market data");
      }

      const rawData = result.data || {};
      const images = rawData.images || {};

      const formatted = TRACKED_ASSETS.map((asset) => {
        const fromApi = rawData[asset.id] || {};
        const fallback = FALLBACK_RAW[asset.id];
        const sparkline = Array.isArray(fromApi.usd_sparkline_7d)
          ? fromApi.usd_sparkline_7d
          : fallback.usd_sparkline_7d;

        return {
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          currentPrice: Number(fromApi.usd ?? fallback.usd),
          change24h: Number(fromApi.usd_24h_change ?? fallback.usd_24h_change),
          marketCap: Number(fromApi.usd_market_cap ?? fallback.usd_market_cap),
          sparkline: sparkline.slice(-48),
          image: images[asset.id],
        };
      }).sort((a, b) => b.marketCap - a.marketCap);

      setAssets(formatted);
    } catch (_error) {
      const fallback = TRACKED_ASSETS.map((asset) => {
        const data = FALLBACK_RAW[asset.id];
        return {
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          currentPrice: data.usd,
          change24h: data.usd_24h_change,
          marketCap: data.usd_market_cap,
          sparkline: data.usd_sparkline_7d.slice(-48),
        };
      }).sort((a, b) => b.marketCap - a.marketCap);

      setAssets(fallback);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMarketData]);

  const metrics = useMemo(() => {
    if (assets.length === 0) {
      return {
        totalMarketCap: 0,
        average24hChange: 0,
        advancers: 0,
        decliners: 0,
        topGainer: null as PriceData | null,
        topLoser: null as PriceData | null,
        dominanceBtcEth: 0,
      };
    }

    const totalMarketCap = assets.reduce(
      (sum, asset) => sum + asset.marketCap,
      0,
    );
    const average24hChange =
      assets.reduce((sum, asset) => sum + asset.change24h, 0) / assets.length;
    const advancers = assets.filter((asset) => asset.change24h >= 0).length;
    const decliners = assets.length - advancers;
    const sortedByChange = [...assets].sort(
      (a, b) => b.change24h - a.change24h,
    );
    const btcEth = assets
      .filter((asset) => asset.symbol === "BTC" || asset.symbol === "ETH")
      .reduce((sum, asset) => sum + asset.marketCap, 0);

    return {
      totalMarketCap,
      average24hChange,
      advancers,
      decliners,
      topGainer: sortedByChange[0] || null,
      topLoser: sortedByChange[sortedByChange.length - 1] || null,
      dominanceBtcEth: totalMarketCap ? (btcEth / totalMarketCap) * 100 : 0,
    };
  }, [assets]);

  const pulseData = useMemo(() => {
    if (assets.length === 0) {
      return [];
    }
    const usable = assets.filter((asset) => asset.sparkline.length >= 24);
    if (usable.length === 0) {
      return [];
    }

    const length = Math.min(...usable.map((asset) => asset.sparkline.length));
    return Array.from({ length }).map((_, index) => {
      const values = usable.map((asset) => asset.sparkline[index]);
      const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
      return avg;
    });
  }, [assets]);

  const pulseChartData = useMemo(() => {
    const selected = TIMEFRAME_OPTIONS.find(
      (option) => option.id === activeTimeframe,
    )!;
    const sliced = pulseData.slice(-selected.points);

    if (sliced.length === 0) {
      return [];
    }

    return sliced.map((value, index) => {
      const previous = index === 0 ? value : sliced[index - 1];
      const change = previous ? ((value - previous) / previous) * 100 : 0;

      return {
        label: `${index + 1}`,
        price: value,
        change,
      };
    });
  }, [pulseData, activeTimeframe]);

  const pulseInsights = useMemo(() => {
    if (pulseChartData.length < 2) {
      return {
        trend: 0,
        volatility: 0,
        upRatio: 0,
        range: "0.00 - 0.00",
      };
    }

    const prices = pulseChartData.map((point) => point.price);
    const changes = pulseChartData.slice(1).map((point) => point.change);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const trend = first ? ((last - first) / first) * 100 : 0;
    const volatility =
      changes.reduce((sum, value) => sum + Math.abs(value), 0) / changes.length;
    const upRatio =
      (changes.filter((value) => value >= 0).length / changes.length) * 100;

    return {
      trend,
      volatility,
      upRatio,
      range: `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`,
    };
  }, [pulseChartData]);

  const marketSentiment = useMemo(() => {
    const rawScore =
      50 +
      pulseInsights.trend * 2.2 +
      (pulseInsights.upRatio - 50) * 0.9 -
      pulseInsights.volatility * 3.4;
    const score = Math.max(0, Math.min(100, rawScore));

    if (score >= 75)
      return { score, label: "Extreme Greed", tone: "text-[var(--theme-danger)]" };
    if (score >= 60)
      return { score, label: "Greed", tone: "text-[var(--theme-warning)]" };
    if (score >= 45)
      return { score, label: "Neutral", tone: "text-[var(--theme-text-strong)]" };
    if (score >= 25)
      return { score, label: "Fear", tone: "text-[var(--theme-info)]" };
    return { score, label: "Extreme Fear", tone: "text-[var(--theme-primary-strong)]" };
  }, [pulseInsights]);

  const featuredAssets = useMemo(
    () =>
      TRACKED_ASSETS.map((cfg) =>
        assets.find((asset) => asset.id === cfg.id),
      ).filter((asset): asset is PriceData => Boolean(asset)),
    [assets],
  );
  const carouselAssets = useMemo(
    () => [...featuredAssets, ...featuredAssets, ...featuredAssets],
    [featuredAssets],
  );

  const normalizeOffset = useCallback((value: number) => {
    const width = singleSetWidthRef.current;
    if (!width) {
      return value;
    }
    let next = value;
    while (next <= -width) {
      next += width;
    }
    while (next > 0) {
      next -= width;
    }
    return next;
  }, []);

  const applyTrackTransform = useCallback(() => {
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    }
  }, []);

  useEffect(() => {
    const root = carouselRef.current;
    const track = carouselTrackRef.current;
    if (!root || !track || featuredAssets.length === 0) {
      return;
    }

    const measure = () => {
      const width = track.scrollWidth / 3;
      singleSetWidthRef.current = width;
      offsetRef.current = normalizeOffset(offsetRef.current);
      applyTrackTransform();
      setIsCarouselReady(width > 0);
    };

    measure();

    const animate = () => {
      if (!isDraggingRef.current) {
        offsetRef.current = normalizeOffset(offsetRef.current - CAROUSEL_SPEED);
        applyTrackTransform();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", measure);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", measure);
    };
  }, [featuredAssets.length, normalizeOffset, applyTrackTransform]);

  const handleCarouselPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const root = carouselRef.current;
    if (!root) {
      return;
    }
    isDraggingRef.current = true;
    setIsCarouselDragging(true);
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    root.setPointerCapture(event.pointerId);
  };

  const handleCarouselPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!isDraggingRef.current) {
      return;
    }
    const deltaX = event.clientX - dragStartXRef.current;
    offsetRef.current = normalizeOffset(dragStartOffsetRef.current + deltaX);
    applyTrackTransform();
  };

  const handleCarouselPointerUp = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const root = carouselRef.current;
    if (!root) {
      return;
    }
    isDraggingRef.current = false;
    setIsCarouselDragging(false);
    root.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="min-h-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)]">
      <section className="border-b border-[color:var(--theme-border-subtle)] px-4 md:px-8 py-14 md:py-16 bg-[radial-gradient(circle_at_top_right,var(--theme-spotlight),transparent_45%)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--theme-border-strong)] bg-[color:var(--theme-primary-faint)] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[var(--theme-positive)] animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-[var(--theme-primary-strong)]">
                Live Market Terminal
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight text-[var(--theme-primary)]">
                  Track Crypto Markets
                  <br />
                  in Real Time
                </h1>
                <p className="mt-4 max-w-3xl text-base md:text-lg text-[var(--theme-text-muted)]">
                  Professional live market coverage for major assets including
                  BTC, ETH, AVAX, SOL, XRP and SUI with intraday trend visuals,
                  heatmap signals and ranked movers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-10 border-b border-[color:var(--theme-border-subtle)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-2xl border border-[color:var(--theme-border-subtle)] bg-gradient-to-b from-[var(--theme-surface-contrast)] to-[var(--theme-surface-contrast-strong)] p-5 md:p-6">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-[var(--theme-primary)]">
                  Market Pulse
                </h2>
                <p className="text-sm text-[color:var(--theme-text-soft)]">
                  Interactive pulse chart of tracked asset momentum with live
                  trend analytics.
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface-soft)] p-1">
                {TIMEFRAME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActiveTimeframe(option.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTimeframe === option.id
                        ? "bg-[color:var(--theme-primary-soft-strong)] text-[var(--theme-primary-strong)]"
                        : "text-[var(--theme-text-muted)] hover:text-[var(--theme-primary-strong)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {pulseChartData.length > 1 ? (
              <div className="h-64 rounded-xl border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] px-2 py-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pulseChartData}>
                    <defs>
                      <linearGradient
                        id="pulse-area"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={chartTheme.primary}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor={chartTheme.primary}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={chartTheme.border} strokeDasharray="3 6" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartTheme.textMuted, fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartTheme.textMuted, fontSize: 11 }}
                      tickFormatter={(value) => `$${formatCompact(value)}`}
                      width={52}
                    />
                    <Tooltip
                      content={<PulseTooltip />}
                      cursor={{ stroke: chartTheme.border, strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartTheme.primary}
                      strokeWidth={2}
                      fill="url(#pulse-area)"
                      isAnimationActive
                      animationDuration={700}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={chartTheme.accent}
                      strokeWidth={1}
                      dot={false}
                      activeDot={{ r: 4, fill: chartTheme.primary, stroke: chartTheme.canvas }}
                      isAnimationActive
                      animationDuration={850}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 rounded-xl border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] flex items-center justify-center text-sm text-[color:var(--theme-text-soft)]">
                Loading market pulse...
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] p-3">
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--theme-primary-weak)]">
                  Trend
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    pulseInsights.trend >= 0
                      ? "text-[var(--theme-positive)]"
                      : "text-[var(--theme-danger)]"
                  }`}
                >
                  {pulseInsights.trend >= 0 ? "+" : ""}
                  {pulseInsights.trend.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] p-3">
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--theme-primary-weak)]">
                  Volatility
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--theme-text-strong)]">
                  {pulseInsights.volatility.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] p-3">
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--theme-primary-weak)]">
                  Up Sessions
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--theme-text-strong)]">
                  {pulseInsights.upRatio.toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] p-3">
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--theme-primary-weak)]">
                  Range
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--theme-text-strong)]">
                  {pulseInsights.range}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-contrast)] p-5 md:p-6">
            <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">
              Market Signals
            </h3>
            <div className="space-y-4">
              <div className="rounded-xl border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary-weak)]">
                    Market Sentiment
                  </p>
                  <p
                    className={`text-xs font-semibold ${marketSentiment.tone}`}
                  >
                    {marketSentiment.label}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-[var(--theme-surface-contrast)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--theme-danger)] via-[var(--theme-accent)] to-[var(--theme-positive)]"
                    style={{
                      width: `${marketSentiment.score}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--theme-text-muted)]">
                  Fear & Greed Index:{" "}
                  <span className="font-semibold text-[var(--theme-text-strong)]">
                    {marketSentiment.score.toFixed(0)}
                  </span>
                  /100
                </p>
              </div>

              <div className="rounded-xl border border-[color:var(--theme-positive-soft)] bg-[color:var(--theme-positive-soft)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--theme-positive)]">
                  Top Gainer
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--theme-text-strong)]">
                  {metrics.topGainer?.name || "--"}
                </p>
                <p className="font-mono text-[var(--theme-positive)]">
                  {metrics.topGainer
                    ? `${metrics.topGainer.change24h >= 0 ? "+" : ""}${metrics.topGainer.change24h.toFixed(2)}%`
                    : "--"}
                </p>
              </div>

              <div className="rounded-xl border border-[color:var(--theme-danger-soft)] bg-[color:var(--theme-danger-soft)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--theme-danger)]">
                  Top Loser
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--theme-text-strong)]">
                  {metrics.topLoser?.name || "--"}
                </p>
                <p className="font-mono text-[var(--theme-danger)]">
                  {metrics.topLoser
                    ? `${metrics.topLoser.change24h >= 0 ? "+" : ""}${metrics.topLoser.change24h.toFixed(2)}%`
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-10 border-b border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-primary-faint)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--theme-primary)]">
              Featured Assets
            </h2>
          </div>
          <div className="relative">
            <div
              ref={carouselRef}
              onPointerDown={handleCarouselPointerDown}
              onPointerMove={handleCarouselPointerMove}
              onPointerUp={handleCarouselPointerUp}
              onPointerCancel={handleCarouselPointerUp}
              className={`overflow-hidden select-none py-1 touch-pan-y ${
                isCarouselDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <div
                ref={carouselTrackRef}
                className={`flex w-max gap-4 will-change-transform ${
                  isCarouselReady ? "opacity-100" : "opacity-0"
                } transition-opacity duration-200`}
              >
                {carouselAssets.map((asset, index) => {
                  const isPositive = asset.change24h >= 0;
                  return (
                    <article
                      key={`${asset.id}-${index}`}
                      className="theme-card w-[260px] shrink-0 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {asset.image ? (
                            <img
                              src={asset.image}
                              alt={asset.name}
                              className="h-6 w-6 rounded-full"
                              onError={(event) => {
                                (
                                  event.target as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          ) : null}
                          <div>
                            <p className="text-sm font-semibold text-[var(--theme-text-strong)]">
                              {asset.name}
                            </p>
                            <p className="text-xs text-[color:var(--theme-text-soft)]">
                              {asset.symbol}
                            </p>
                          </div>
                        </div>
                        <span
                          className={isPositive ? "theme-pill-positive" : "theme-pill-negative"}
                        >
                          {isPositive ? "+" : ""}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-2xl font-semibold text-[var(--theme-text-strong)]">
                        ${formatPrice(asset.currentPrice)}
                      </p>
                      <p className="text-xs text-[color:var(--theme-text-soft)] mt-1">
                        MCap: ${formatCompact(asset.marketCap)}
                      </p>
                      <div className="mt-3">
                        <MiniSparkline
                          data={asset.sparkline}
                          isPositive={isPositive}
                          id={asset.id}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-12 border-b border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-[color:var(--theme-border-soft)] bg-gradient-to-r from-[var(--theme-surface)] to-[var(--theme-surface-contrast)] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
              Market Alerts
            </p>
            <h3 className="mt-3 text-2xl md:text-3xl font-semibold leading-tight text-[var(--theme-primary)]">
              Get live market updates every hour on Twitter/X
            </h3>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-[var(--theme-text-muted)] leading-relaxed">
              Follow our official Twitter/X account and turn on notifications to
              receive hourly market insights, momentum changes, and key
              price-action highlights across major assets.
            </p>
            <Link
              href="https://x.com/kwidao"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-button-primary mt-6 px-5 py-2.5 text-sm"
            >
              Follow @kwidao on X
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--theme-primary)]">
                Full Market Board
              </h2>
              <p className="text-sm text-[color:var(--theme-text-soft)] mt-1">
                Price, 24H change, market capitalization and intraday range at a
                glance.
              </p>
            </div>
          </div>

          <div className="theme-table-shell overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-[color:var(--theme-border-subtle)] text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--theme-primary-weak)]">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--theme-primary-weak)]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--theme-primary-weak)]">
                    24H
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--theme-primary-weak)]">
                    Market Cap
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--theme-primary-weak)]">
                    24H Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const high = Math.max(...asset.sparkline);
                  const low = Math.min(...asset.sparkline);
                  const isPositive = asset.change24h >= 0;
                  return (
                    <tr
                      key={`${asset.id}-row`}
                      className="border-b border-[color:var(--theme-border-subtle)] hover:bg-[color:var(--theme-primary-faint)] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {asset.image ? (
                            <img
                              src={asset.image}
                              alt={asset.name}
                              className="h-6 w-6 rounded-full"
                              onError={(event) => {
                                (
                                  event.target as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          ) : null}
                          <div>
                            <p className="text-sm font-semibold text-[var(--theme-text-strong)]">
                              {asset.name}
                            </p>
                            <p className="text-xs text-[color:var(--theme-text-soft)]">
                              {asset.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-[var(--theme-text-muted)]">
                        ${formatPrice(asset.currentPrice)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={isPositive ? "theme-pill-positive" : "theme-pill-negative"}
                        >
                          {isPositive ? "+" : ""}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--theme-text-muted)]">
                        ${formatCompact(asset.marketCap)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--theme-text-muted)]">
                        ${formatPrice(low)} - ${formatPrice(high)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
