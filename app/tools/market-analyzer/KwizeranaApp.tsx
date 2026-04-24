"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveThemeToken } from "@/lib/theme";

type ViewId = "dashboard" | "trending" | "new-pairs" | "chart";
type SortKey =
  | "symbol"
  | "price"
  | "change1h"
  | "change24h"
  | "volume"
  | "liquidity"
  | "txns"
  | "kwiScore";

type Chain = {
  id: string;
  name: string;
  iconCode: number;
  color: string;
  vol: string;
};

type Pair = {
  address: string;
  symbol: string;
  name: string;
  chainId: string;
  price: number;
  prevPrice: number;
  change24h: number;
  change1h: number;
  volume: number;
  maxVol: number;
  liquidity: number;
  txns: number;
  buys: number;
  sells: number;
  age: number;
  rsi: number;
  macdBull: boolean;
  volRatio: number;
  color: string;
  kwiScore: number;
  flash: "up" | "down" | null;
  flashUntil?: number;
};

type Filter = {
  id: string;
  label: string;
  test?: (p: Pair) => boolean;
};

type Column = {
  key: SortKey;
  label: string;
  align: "left" | "right" | "center";
};

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type LinePoint = {
  time: number;
  value: number;
};

type HistogramPoint = {
  time: number;
  value: number;
  color: string;
};

type ChartSeries<T> = {
  setData: (data: T[]) => void;
};

type ChartInstance = {
  remove: () => void;
  applyOptions: (options: { width: number; height: number }) => void;
  addCandlestickSeries: (
    options: Record<string, unknown>,
  ) => ChartSeries<Candle>;
  addHistogramSeries: (
    options: Record<string, unknown>,
  ) => ChartSeries<HistogramPoint>;
  addLineSeries: (options: Record<string, unknown>) => ChartSeries<LinePoint>;
  timeScale: () => { fitContent: () => void };
  priceScale: (id: string) => {
    applyOptions: (options: {
      scaleMargins: { top: number; bottom: number };
    }) => void;
  };
};

type LightweightChartsApi = {
  createChart: (
    container: HTMLDivElement,
    options: Record<string, unknown>,
  ) => ChartInstance;
  CrosshairMode: {
    Normal: number;
  };
};

declare global {
  interface Window {
    LightweightCharts?: LightweightChartsApi;
  }
}

const CHAINS: Chain[] = [
  {
    id: "avax",
    name: "Avalanche",
    iconCode: 128314,
    color: "#e84142",
    vol: "$4.2B",
  },
  {
    id: "tao",
    name: "Bittensor",
    iconCode: 129504,
    color: "#14b8a6",
    vol: "$892M",
  },
  {
    id: "base",
    name: "Base",
    iconCode: 128309,
    color: "#0052ff",
    vol: "$3.1B",
  },
  {
    id: "aptos",
    name: "Aptos",
    iconCode: 127754,
    color: "#00aaff",
    vol: "$654M",
  },
  { id: "sol", name: "Solana", iconCode: 9711, color: "#9945ff", vol: "$8.7B" },
  {
    id: "eth",
    name: "Ethereum",
    iconCode: 11136,
    color: "#627eea",
    vol: "$12.4B",
  },
  {
    id: "bnb",
    name: "BNB Chain",
    iconCode: 127937,
    color: "#f3ba2f",
    vol: "$2.9B",
  },
];

const NAMES: [string, string][] = [
  ["AVAX", "Avalanche"],
  ["JOE", "TraderJoe"],
  ["PNG", "Pangolin"],
  ["QI", "BENQI"],
  ["GMX", "GMX"],
  ["TAO", "Bittensor"],
  ["ORCA", "Orca"],
  ["RAY", "Raydium"],
  ["BONK", "Bonk"],
  ["WIF", "dogwifhat"],
  ["CBETH", "Coinbase ETH"],
  ["AERO", "Aerodrome"],
  ["BRETT", "Brett"],
  ["BALD", "Bald"],
  ["TOSHI", "Toshi"],
  ["APT", "Aptos"],
  ["CELL", "Cellana"],
  ["ABEL", "Abel Finance"],
  ["MOV", "MoveDEX"],
  ["PANTS", "BlueMove"],
  ["SOL", "Solana"],
  ["JTO", "Jito"],
  ["PYTH", "Pyth"],
  ["W", "Wormhole"],
  ["TNSR", "Tensor"],
  ["WETH", "Wrapped ETH"],
  ["UNI", "Uniswap"],
  ["AAVE", "Aave"],
  ["LINK", "Chainlink"],
  ["CRV", "Curve"],
  ["CAKE", "PancakeSwap"],
  ["BAKE", "BakerySwap"],
  ["XVS", "Venus"],
  ["ALPACA", "Alpaca"],
  ["DODO", "DODO"],
];

const COIN_COLORS = [
  "var(--theme-primary)",
  "var(--theme-accent)",
  "var(--theme-soft-accent)",
  "var(--theme-positive)",
  "var(--theme-warning)",
  "var(--theme-danger)",
  "var(--theme-info)",
  "var(--theme-primary-strong)",
  "var(--theme-text-muted)",
  "var(--theme-border-strong)",
];

const KWI_FILTERS: Filter[] = [
  { id: "all", label: "All" },
  { id: "strong", label: "Strong", test: (p) => p.kwiScore >= 75 },
  {
    id: "opp",
    label: "Opportunity",
    test: (p) => p.kwiScore >= 60 && p.kwiScore < 75,
  },
  {
    id: "watch",
    label: "Watch",
    test: (p) => p.kwiScore >= 45 && p.kwiScore < 60,
  },
  { id: "gainers", label: "Gainers", test: (p) => p.change24h > 0 },
  { id: "losers", label: "Losers", test: (p) => p.change24h < 0 },
];

const COLS: Column[] = [
  { key: "symbol", label: "Pair", align: "left" },
  { key: "price", label: "Price", align: "right" },
  { key: "change1h", label: "1H %", align: "right" },
  { key: "change24h", label: "24H %", align: "right" },
  { key: "volume", label: "Volume", align: "right" },
  { key: "liquidity", label: "Liquidity", align: "right" },
  { key: "txns", label: "Txns", align: "right" },
  { key: "kwiScore", label: "KWI", align: "center" },
];

function iconFromCode(code: number) {
  return String.fromCodePoint(code);
}

function coinColor(sym: string) {
  const h = [...sym].reduce((a, c) => a + c.charCodeAt(0), 0);
  return COIN_COLORS[h % COIN_COLORS.length];
}

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRng(seedInput: string) {
  let seed = hashSeed(seedInput) || 1;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function seededRnd(rng: () => number, a: number, b: number) {
  return a + rng() * (b - a);
}

function seededRndInt(rng: () => number, a: number, b: number) {
  return Math.floor(seededRnd(rng, a, b));
}

function kwiScore(
  p: Pick<Pair, "rsi" | "macdBull" | "volRatio" | "change24h">,
) {
  const r = (p.rsi - 30) / 40;
  const m = p.macdBull ? 1 : 0;
  const v = Math.min(p.volRatio / 3, 1);
  const t =
    p.change24h > 0
      ? Math.min(p.change24h / 10, 1)
      : Math.max(p.change24h / 10, -1) * 0.5 + 0.5;
  return Math.round(r * 25 + m * 25 + v * 25 + t * 25);
}

function kwiBand(score: number) {
  if (score >= 75) return { label: "STRONG", cls: "kwi-strong" };
  if (score >= 60) return { label: "OPP", cls: "kwi-opp" };
  if (score >= 45) return { label: "WATCH", cls: "kwi-watch" };
  if (score >= 35) return { label: "NEUTRAL", cls: "kwi-neutral" };
  return { label: "AVOID", cls: "kwi-avoid" };
}

function genPairs(chainId: string) {
  const ci = CHAINS.findIndex((c) => c.id === chainId);
  const rng = createSeededRng(`pairs:${chainId}`);
  const out: Pair[] = [];
  for (let i = 0; i < 12; i += 1) {
    const [sym, name] = NAMES[(ci * 5 + i) % NAMES.length];
    const price =
      rng() < 0.5 ? seededRnd(rng, 0.0001, 0.1) : seededRnd(rng, 0.5, 500);
    const p: Pair = {
      address: `${chainId}_${sym}_${i}`,
      symbol: sym,
      name,
      chainId,
      price,
      prevPrice: price,
      change24h: seededRnd(rng, -15, 25),
      change1h: seededRnd(rng, -5, 8),
      volume: seededRnd(rng, 100000, 50000000),
      maxVol: 50000000,
      liquidity: seededRnd(rng, 50000, 20000000),
      txns: seededRndInt(rng, 200, 8000),
      buys: seededRndInt(rng, 100, 4000),
      sells: seededRndInt(rng, 100, 4000),
      age: seededRndInt(rng, 1, 720),
      rsi: seededRnd(rng, 25, 75),
      macdBull: rng() > 0.45,
      volRatio: seededRnd(rng, 0.5, 4),
      color: coinColor(sym),
      kwiScore: 0,
      flash: null,
    };
    p.kwiScore = kwiScore(p);
    out.push(p);
  }
  return out;
}

function getStatsDelta(chainId: string) {
  const rng = createSeededRng(`stats:${chainId}`);
  return seededRnd(rng, 1, 5).toFixed(1);
}

function getLightweightCharts() {
  if (typeof window === "undefined") return undefined;
  return window.LightweightCharts;
}

function getPairSortValue(pair: Pair, sortCol: SortKey) {
  switch (sortCol) {
    case "symbol":
      return pair.symbol;
    case "price":
      return pair.price;
    case "change1h":
      return pair.change1h;
    case "change24h":
      return pair.change24h;
    case "volume":
      return pair.volume;
    case "liquidity":
      return pair.liquidity;
    case "txns":
      return pair.txns;
    case "kwiScore":
      return pair.kwiScore;
  }
}

function genCandles(base: number, count: number, tfm: number) {
  const now = Math.floor(Date.now() / 1000);
  const iv = tfm * 60;
  const out: Candle[] = [];
  let price = base;
  for (let i = count; i >= 0; i -= 1) {
    const open = price;
    const move = (Math.random() - 0.48) * price * 0.03;
    const close = Math.max(open + move, open * 0.005);
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);
    out.push({
      time: now - i * iv,
      open,
      high,
      low,
      close,
      volume: rnd(50000, 500000),
    });
    price = close;
  }
  return out;
}

function computeMA(candles: { time: number; close: number }[], period: number) {
  return candles.slice(period - 1).map((c, i) => ({
    time: c.time,
    value:
      candles.slice(i, i + period).reduce((s, x) => s + x.close, 0) / period,
  }));
}

function fmtP(v: number | null | undefined) {
  if (v == null) return "-";
  if (v < 0.0001) return "$" + v.toFixed(8);
  if (v < 0.01) return "$" + v.toFixed(6);
  if (v < 1) return "$" + v.toFixed(4);
  if (v < 1000) return "$" + v.toFixed(2);
  return (
    "$" +
    v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtV(v: number) {
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

function fmtAge(m: number) {
  if (m < 60) return m + "m";
  if (m < 1440) return Math.floor(m / 60) + "h";
  return Math.floor(m / 1440) + "d";
}

function classNames(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function KwizeranaApp() {
  const [pairsByChain, setPairsByChain] = useState<Record<string, Pair[]>>(
    () => {
      const init: Record<string, Pair[]> = {};
      CHAINS.forEach((c) => {
        init[c.id] = genPairs(c.id);
      });
      return init;
    },
  );
  const [currentChainId, setCurrentChainId] = useState("avax");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortCol, setSortCol] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewId>("dashboard");
  const [prevView, setPrevView] = useState<ViewId>("dashboard");
  const [currentChartPair, setCurrentChartPair] = useState<Pair | null>(null);
  const [tfMins, setTfMins] = useState(60);
  const [indMA, setIndMA] = useState(false);
  const [indVOL, setIndVOL] = useState(false);
  const [libReady, setLibReady] = useState(() =>
    Boolean(getLightweightCharts()),
  );
  const statsDelta = useMemo(
    () => getStatsDelta(currentChainId),
    [currentChainId],
  );
  const themeColors = useMemo(
    () => ({
      primary: resolveThemeToken("primary"),
      accent: resolveThemeToken("accent"),
      textMuted: resolveThemeToken("textMuted"),
      surfaceContrast: resolveThemeToken("surfaceContrast"),
      border: resolveThemeToken("border"),
      positive: resolveThemeToken("positive"),
      warning: resolveThemeToken("warning"),
      danger: resolveThemeToken("danger"),
    }),
    [],
  );

  useEffect(() => {
    if (libReady) return;
    const interval = window.setInterval(() => {
      if (getLightweightCharts()) {
        setLibReady(true);
        window.clearInterval(interval);
      }
    }, 120);
    return () => window.clearInterval(interval);
  }, [libReady]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPairsByChain((prev) => {
        const now = Date.now();
        const next: Record<string, Pair[]> = {};
        Object.entries(prev).forEach(([chainId, pairs]) => {
          next[chainId] = pairs.map((pair) => {
            const updated = { ...pair };
            let touched = false;
            if (Math.random() < 0.3) {
              updated.prevPrice = updated.price;
              updated.price = Math.max(
                updated.price * (1 + (Math.random() - 0.495) * 0.008),
                updated.price * 0.001,
              );
              updated.change1h += (Math.random() - 0.5) * 0.2;
              updated.flash =
                updated.price >= updated.prevPrice ? "up" : "down";
              updated.flashUntil = now + 600;
              touched = true;
            }
            if (!touched && updated.flashUntil && updated.flashUntil < now) {
              updated.flash = null;
              updated.flashUntil = undefined;
            }
            return updated;
          });
        });
        return next;
      });
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  const currentPairs = useMemo(
    () => pairsByChain[currentChainId] ?? [],
    [pairsByChain, currentChainId],
  );

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    KWI_FILTERS.forEach((f) => {
      counts[f.id] = f.test
        ? currentPairs.filter(f.test).length
        : currentPairs.length;
    });
    return counts;
  }, [currentPairs]);

  const filteredPairs = useMemo(() => {
    let ps = currentPairs.slice();
    const filter = KWI_FILTERS.find((f) => f.id === activeFilter);
    if (filter?.test) ps = ps.filter(filter.test);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      ps = ps.filter(
        (p) =>
          p.symbol.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q),
      );
    }
    ps.sort((a, b) => {
      const av = getPairSortValue(a, sortCol);
      const bv = getPairSortValue(b, sortCol);
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * sortDir;
      }
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });
    return ps;
  }, [currentPairs, activeFilter, searchQuery, sortCol, sortDir]);

  const trendingPairs = useMemo(() => {
    const all = Object.values(pairsByChain).flat();
    return [...all].sort((a, b) => b.volume - a.volume).slice(0, 20);
  }, [pairsByChain]);

  const newPairs = useMemo(() => {
    const all = Object.values(pairsByChain).flat();
    return [...all].sort((a, b) => a.age - b.age).slice(0, 20);
  }, [pairsByChain]);

  const stats = useMemo(() => {
    const tv = currentPairs.reduce((s, p) => s + p.volume, 0);
    const avg = currentPairs.length
      ? Math.round(
          currentPairs.reduce((s, p) => s + p.kwiScore, 0) /
            currentPairs.length,
        )
      : 0;
    const gainers = currentPairs.filter((p) => p.change24h > 0).length;
    const strong = currentPairs.filter((p) => p.kwiScore >= 75).length;
    return {
      totalVol: tv,
      avgKwi: avg,
      gainers,
      losers: currentPairs.length - gainers,
      strong,
      total: currentPairs.length,
    };
  }, [currentPairs]);

  const selectChain = (id: string) => {
    setCurrentChainId(id);
    setActiveFilter("all");
  };

  const setFilter = (id: string) => {
    setActiveFilter(id);
  };

  const sortBy = (col: SortKey) => {
    if (sortCol === col) {
      setSortDir((d) => d * -1);
      return;
    }
    setSortCol(col);
    setSortDir(-1);
  };

  const showView = (name: ViewId) => {
    setCurrentView(name);
    setPrevView(name);
  };

  const openChart = (pair: Pair) => {
    setCurrentChartPair(pair);
    setPrevView((prev) => (currentView === "chart" ? prev : currentView));
    setCurrentView("chart");
  };

  const closeChart = () => {
    setCurrentView(prevView || "dashboard");
  };

  const setTF = (mins: number) => {
    setTfMins(mins);
  };

  const toggleInd = (ind: "ma" | "vol") => {
    if (ind === "ma") setIndMA((v) => !v);
    if (ind === "vol") setIndVOL((v) => !v);
  };

  return (
    <div id="app" className="market-analyzer-shell">
      <aside id="sidebar">
        <div className="brand">
          <a className="block shrink" href="/">
            <img
              src="/logo.svg"
              alt="Kwidao Logo"
              className="h-8 w-auto md:h-9"
            />
          </a>
        </div>
        <div className="sb-label">Networks</div>
        <div id="chain-list">
          {CHAINS.map((c) => (
            <div
              key={c.id}
              className={classNames(
                "chain-item",
                c.id === currentChainId && "active",
              )}
              style={
                c.id === currentChainId
                  ? { borderLeftColor: c.color }
                  : undefined
              }
              onClick={() => selectChain(c.id)}
            >
              <span className="chain-icon">{iconFromCode(c.iconCode)}</span>
              <div className="chain-info">
                <div className="chain-name">{c.name}</div>
                <div className="chain-vol">{c.vol}</div>
              </div>
              <div className="chain-dot" style={{ background: c.color }}></div>
            </div>
          ))}
        </div>
        <div className="kwi-legend">
          <div className="kwi-legend-title">KWI Score</div>
          <div className="kwi-row">
            <div className="kwi-dot" style={{ background: "#10b981" }}></div>
            STRONG 75+
          </div>
          <div className="kwi-row">
            <div
              className="kwi-dot"
              style={{ background: themeColors.accent }}
            ></div>
            OPPORTUNITY 60-74
          </div>
          <div className="kwi-row">
            <div className="kwi-dot" style={{ background: "#f59e0b" }}></div>
            WATCH 45-59
          </div>
          <div className="kwi-row">
            <div
              className="kwi-dot"
              style={{ background: themeColors.textMuted }}
            ></div>
            NEUTRAL 35-44
          </div>
          <div className="kwi-row">
            <div className="kwi-dot" style={{ background: "#ef4444" }}></div>
            AVOID &lt;35
          </div>
        </div>
      </aside>

      <div id="main">
        <nav id="topnav">
          <Link
            href="/"
            className="mobile-tool-brand"
            aria-label="Back to home"
          >
            <img src="/logo.svg" alt="Kwidao Logo" className="h-8 w-auto" />
          </Link>
          <div className="topnav-links">
            <button
              className={classNames(
                "nav-tab",
                currentView === "dashboard" && "active",
              )}
              data-view="dashboard"
              onClick={() => showView("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={classNames(
                "nav-tab",
                currentView === "trending" && "active",
              )}
              data-view="trending"
              onClick={() => showView("trending")}
            >
              Trending
            </button>
            <button
              className={classNames(
                "nav-tab",
                currentView === "new-pairs" && "active",
              )}
              data-view="new-pairs"
              onClick={() => showView("new-pairs")}
            >
              New Pairs
            </button>
            <Link href="/tools" className="nav-tab">
              Tools Hub
            </Link>
          </div>
          <div className="search-box">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="search-input"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </nav>

        <div id="content">
          {currentView === "dashboard" ? (
            <div className="view active" id="view-dashboard">
              <div className="stats-bar" id="stats-bar">
                <div className="stat-card">
                  <div className="stat-label">24H Volume</div>
                  <div className="stat-value">{fmtV(stats.totalVol)}</div>
                  <div className="stat-change pos">+{statsDelta}% today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg KWI</div>
                  <div
                    className="stat-value"
                    style={{
                      color:
                        stats.avgKwi >= 60
                          ? themeColors.accent
                          : stats.avgKwi >= 45
                            ? themeColors.primary
                            : themeColors.textMuted,
                    }}
                  >
                    {stats.avgKwi}
                  </div>
                  <div className="stat-change">
                    {stats.strong} STRONG signals
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Gainers/Losers</div>
                  <div className="stat-value">
                    <span className="pos">{stats.gainers}</span> /{" "}
                    <span className="neg">{stats.losers}</span>
                  </div>
                  <div className="stat-change">{stats.total} pairs tracked</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Networks</div>
                  <div className="stat-value">{CHAINS.length}</div>
                  <div className="stat-change">chains monitored</div>
                </div>
              </div>

              <div className="filter-bar" id="filter-bar">
                {KWI_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    className={classNames(
                      "filter-pill",
                      activeFilter === f.id && "active",
                    )}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}{" "}
                    <span className="filter-count">
                      {filterCounts[f.id] ?? 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="table-wrap">
                <table>
                  <thead id="table-head">
                    <tr>
                      {COLS.map((col) => {
                        const arrow =
                          sortCol === col.key
                            ? sortDir > 0
                              ? String.fromCharCode(8593)
                              : String.fromCharCode(8595)
                            : String.fromCharCode(8597);
                        return (
                          <th
                            key={col.key}
                            className={sortCol === col.key ? "sorted" : ""}
                            style={{ textAlign: col.align }}
                            onClick={() => sortBy(col.key)}
                          >
                            {col.label}{" "}
                            <span style={{ opacity: 0.5, fontSize: 9 }}>
                              {arrow}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody id="table-body">
                    {filteredPairs.map((p) => {
                      const band = kwiBand(p.kwiScore);
                      const chain = CHAINS.find((c) => c.id === p.chainId);
                      const volPct = Math.min((p.volume / p.maxVol) * 100, 100);
                      return (
                        <tr key={p.address} onClick={() => openChart(p)}>
                          <td>
                            <div className="pair-info">
                              <div
                                className="pair-icon"
                                style={{ background: p.color }}
                              >
                                {p.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="pair-name">{p.symbol}/USDC</div>
                                <div className="pair-chain">
                                  {chain ? iconFromCode(chain.iconCode) : "?"}{" "}
                                  {chain?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "price-cell",
                                p.flash === "up" && "flash-up",
                                p.flash === "down" && "flash-dn",
                              )}
                            >
                              {fmtP(p.price)}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "change-badge",
                                p.change1h >= 0 ? "pos" : "neg",
                              )}
                            >
                              {(p.change1h >= 0 ? "+" : "") +
                                p.change1h.toFixed(2) +
                                "%"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "change-badge",
                                p.change24h >= 0 ? "pos" : "neg",
                              )}
                            >
                              {(p.change24h >= 0 ? "+" : "") +
                                p.change24h.toFixed(2) +
                                "%"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="vol-bar-wrap">
                              <div className="vol-bar-bg">
                                <div
                                  className="vol-bar-fill"
                                  style={{ width: `${volPct}%` }}
                                ></div>
                              </div>
                              <span className="vol-text">{fmtV(p.volume)}</span>
                            </div>
                          </td>
                          <td
                            style={{ textAlign: "right" }}
                            className="vol-text"
                          >
                            {fmtV(p.liquidity)}
                          </td>
                          <td
                            style={{ textAlign: "right" }}
                            className="vol-text"
                          >
                            {p.txns.toLocaleString()}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={classNames("kwi-badge", band.cls)}>
                              {p.kwiScore} {band.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {currentView === "trending" ? (
            <div className="view active" id="view-trending">
              <div className="table-wrap">
                <table>
                  <thead id="trend-head">
                    <tr>
                      {COLS.map((col) => (
                        <th key={col.key} style={{ textAlign: col.align }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody id="trend-body">
                    {trendingPairs.map((p) => {
                      const band = kwiBand(p.kwiScore);
                      const chain = CHAINS.find((c) => c.id === p.chainId);
                      const volPct = Math.min((p.volume / p.maxVol) * 100, 100);
                      return (
                        <tr key={p.address} onClick={() => openChart(p)}>
                          <td>
                            <div className="pair-info">
                              <div
                                className="pair-icon"
                                style={{ background: p.color }}
                              >
                                {p.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="pair-name">{p.symbol}/USDC</div>
                                <div className="pair-chain">
                                  {chain ? iconFromCode(chain.iconCode) : "?"}{" "}
                                  {chain?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span className="price-cell">{fmtP(p.price)}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "change-badge",
                                p.change1h >= 0 ? "pos" : "neg",
                              )}
                            >
                              {(p.change1h >= 0 ? "+" : "") +
                                p.change1h.toFixed(2) +
                                "%"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "change-badge",
                                p.change24h >= 0 ? "pos" : "neg",
                              )}
                            >
                              {(p.change24h >= 0 ? "+" : "") +
                                p.change24h.toFixed(2) +
                                "%"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="vol-bar-wrap">
                              <div className="vol-bar-bg">
                                <div
                                  className="vol-bar-fill"
                                  style={{ width: `${volPct}%` }}
                                ></div>
                              </div>
                              <span className="vol-text">{fmtV(p.volume)}</span>
                            </div>
                          </td>
                          <td
                            style={{ textAlign: "right" }}
                            className="vol-text"
                          >
                            {fmtV(p.liquidity)}
                          </td>
                          <td
                            style={{ textAlign: "right" }}
                            className="vol-text"
                          >
                            {p.txns.toLocaleString()}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={classNames("kwi-badge", band.cls)}>
                              {p.kwiScore} {band.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {currentView === "new-pairs" ? (
            <div className="view active" id="view-new-pairs">
              <div className="table-wrap">
                <table>
                  <thead id="new-head">
                    <tr>
                      {COLS.map((col) => (
                        <th key={col.key} style={{ textAlign: col.align }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody id="new-body">
                    {newPairs.map((p) => {
                      const band = kwiBand(p.kwiScore);
                      const chain = CHAINS.find((c) => c.id === p.chainId);
                      const volPct = Math.min((p.volume / p.maxVol) * 100, 100);
                      return (
                        <tr key={p.address} onClick={() => openChart(p)}>
                          <td>
                            <div className="pair-info">
                              <div
                                className="pair-icon"
                                style={{ background: p.color }}
                              >
                                {p.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="pair-name">{p.symbol}/USDC</div>
                                <div className="pair-chain">
                                  {chain ? iconFromCode(chain.iconCode) : "?"}{" "}
                                  {chain?.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span className="price-cell">{fmtP(p.price)}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "change-badge",
                                p.change1h >= 0 ? "pos" : "neg",
                              )}
                            >
                              {(p.change1h >= 0 ? "+" : "") +
                                p.change1h.toFixed(2) +
                                "%"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={classNames(
                                "change-badge",
                                p.change24h >= 0 ? "pos" : "neg",
                              )}
                            >
                              {(p.change24h >= 0 ? "+" : "") +
                                p.change24h.toFixed(2) +
                                "%"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="vol-bar-wrap">
                              <div className="vol-bar-bg">
                                <div
                                  className="vol-bar-fill"
                                  style={{ width: `${volPct}%` }}
                                ></div>
                              </div>
                              <span className="vol-text">{fmtV(p.volume)}</span>
                            </div>
                          </td>
                          <td
                            style={{ textAlign: "right" }}
                            className="vol-text"
                          >
                            {fmtV(p.liquidity)}
                          </td>
                          <td
                            style={{ textAlign: "right" }}
                            className="vol-text"
                          >
                            {p.txns.toLocaleString()}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={classNames("kwi-badge", band.cls)}>
                              {p.kwiScore} {band.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {currentView === "chart" && currentChartPair ? (
            <ChartView
              pair={currentChartPair}
              tfMins={tfMins}
              indMA={indMA}
              indVOL={indVOL}
              onClose={closeChart}
              onSetTF={setTF}
              onToggleInd={toggleInd}
              libReady={libReady}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChartView({
  pair,
  tfMins,
  indMA,
  indVOL,
  onClose,
  onSetTF,
  onToggleInd,
  libReady,
}: {
  pair: Pair;
  tfMins: number;
  indMA: boolean;
  indVOL: boolean;
  onClose: () => void;
  onSetTF: (mins: number) => void;
  onToggleInd: (ind: "ma" | "vol") => void;
  libReady: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const resizeRef = useRef<ResizeObserver | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const themeColors = useMemo(
    () => ({
      primary: resolveThemeToken("primary"),
      accent: resolveThemeToken("accent"),
      textMuted: resolveThemeToken("textMuted"),
      surfaceContrast: resolveThemeToken("surfaceContrast"),
      border: resolveThemeToken("border"),
      warning: resolveThemeToken("warning"),
    }),
    [],
  );

  useEffect(() => {
    if (!libReady || !containerRef.current) return;
    const LW = getLightweightCharts();
    if (!LW) return;

    const container = containerRef.current;
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch {
        // ignore
      }
      chartRef.current = null;
    }
    container.innerHTML = "";
    setChartError(null);

    try {
      const height =
        container.clientHeight || Math.max(window.innerHeight - 260, 300);
      const chart = LW.createChart(container, {
        width: container.clientWidth,
        height,
        layout: {
          background: { type: "solid", color: themeColors.surfaceContrast },
          textColor: themeColors.textMuted,
        },
        grid: {
          vertLines: { color: themeColors.border },
          horzLines: { color: themeColors.border },
        },
        crosshair: { mode: LW.CrosshairMode.Normal },
        rightPriceScale: { borderColor: themeColors.border },
        timeScale: {
          borderColor: themeColors.border,
          timeVisible: true,
          secondsVisible: false,
        },
      });
      chartRef.current = chart;

      const candles = genCandles(pair.price, 200, tfMins);
      const cs = chart.addCandlestickSeries({
        upColor: "#10b981",
        downColor: "#ef4444",
        borderUpColor: "#10b981",
        borderDownColor: "#ef4444",
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });
      cs.setData(candles);

      if (indVOL) {
        const vs = chart.addHistogramSeries({
          color: themeColors.primary,
          priceFormat: { type: "volume" },
          priceScaleId: "vol",
        });
        chart
          .priceScale("vol")
          .applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
        vs.setData(
          candles.map((c) => ({
            time: c.time,
            value: c.volume,
            color:
              c.close >= c.open
                ? "rgba(16,185,129,0.4)"
                : "rgba(239,68,68,0.4)",
          })),
        );
      }

      if (indMA) {
        const ma7 = chart.addLineSeries({
          color: themeColors.warning,
          lineWidth: 1.5,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        const ma25 = chart.addLineSeries({
          color: themeColors.accent,
          lineWidth: 1.5,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        ma7.setData(computeMA(candles, 7));
        ma25.setData(computeMA(candles, 25));
      }

      chart.timeScale().fitContent();

      if (typeof ResizeObserver !== "undefined") {
        resizeRef.current?.disconnect();
        resizeRef.current = new ResizeObserver(() => {
          if (!chartRef.current) return;
          const nextHeight = container.clientHeight;
          const nextWidth = container.clientWidth;
          if (nextHeight <= 0 || nextWidth <= 0) return;
          chartRef.current.applyOptions({
            width: nextWidth,
            height: nextHeight,
          });
        });
        resizeRef.current.observe(container);
      }
    } catch (error) {
      console.error("Failed to initialize market analyzer chart:", error);
      setChartError("Chart failed to initialize. Please try again.");
    }

    return () => {
      resizeRef.current?.disconnect();
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch {
          // ignore
        }
        chartRef.current = null;
      }
    };
  }, [pair, tfMins, indMA, indVOL, libReady]);

  const band = kwiBand(pair.kwiScore);
  const chain = CHAINS.find((c) => c.id === pair.chainId);
  const arrow = String.fromCharCode(8592);

  return (
    <div className="view active" id="chart-view">
      <div className="chart-topbar">
        <button className="back-btn" onClick={onClose}>
          {arrow} Back
        </button>
        <div
          id="cpi"
          className="pair-icon"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: pair.color,
          }}
        >
          {pair.symbol.charAt(0)}
        </div>
        <span id="cpn" className="chart-pair-name">
          {pair.symbol}/USDC
        </span>
        <span id="cpp" className="chart-pair-price">
          {fmtP(pair.price)}
        </span>
        <span
          id="cpc"
          className={classNames(
            "chart-pair-change",
            "change-badge",
            pair.change24h >= 0 ? "pos" : "neg",
          )}
        >
          {(pair.change24h >= 0 ? "+" : "") + pair.change24h.toFixed(2) + "%"}
        </span>
        <div className="chart-meta" id="chart-meta">
          <div className="chart-meta-item">
            <div className="chart-meta-label">24H Vol</div>
            <div className="chart-meta-val">{fmtV(pair.volume)}</div>
          </div>
          <div className="chart-meta-item">
            <div className="chart-meta-label">Liquidity</div>
            <div className="chart-meta-val">{fmtV(pair.liquidity)}</div>
          </div>
          <div className="chart-meta-item">
            <div className="chart-meta-label">KWI</div>
            <div className="chart-meta-val">
              <span className={classNames("kwi-badge", band.cls)}>
                {pair.kwiScore}
              </span>
            </div>
          </div>
          <div className="chart-meta-item">
            <div className="chart-meta-label">Network</div>
            <div className="chart-meta-val">
              {chain ? iconFromCode(chain.iconCode) : "?"} {chain?.name}
            </div>
          </div>
        </div>
      </div>
      <div className="chart-toolbar">
        {[15, 60, 240, 1440, 10080].map((tf) => (
          <button
            key={tf}
            className={classNames("tf-btn", tfMins === tf && "active")}
            onClick={() => onSetTF(tf)}
          >
            {tf === 15
              ? "15m"
              : tf === 60
                ? "1H"
                : tf === 240
                  ? "4H"
                  : tf === 1440
                    ? "1D"
                    : "1W"}
          </button>
        ))}
        <div className="tb-div"></div>
        <button
          className={classNames("ind-btn", indMA && "active")}
          id="btn-ma"
          onClick={() => onToggleInd("ma")}
        >
          MA
        </button>
        <button
          className={classNames("ind-btn", indVOL && "active")}
          id="btn-vol"
          onClick={() => onToggleInd("vol")}
        >
          VOL
        </button>
      </div>
      <div className="chart-body">
        <div
          id="chart-container"
          ref={containerRef}
          style={chartError ? { display: "none" } : undefined}
        ></div>
        {chartError ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm">
            {chartError}
          </div>
        ) : null}
      </div>
      <div className="chart-stats" id="chart-stats">
        <div className="cstat">
          <div className="cstat-label">Txns</div>
          <div className="cstat-val">{pair.txns.toLocaleString()}</div>
        </div>
        <div className="cstat">
          <div className="cstat-label">Buys</div>
          <div className="cstat-val pos">{pair.buys.toLocaleString()}</div>
        </div>
        <div className="cstat">
          <div className="cstat-label">Sells</div>
          <div className="cstat-val neg">{pair.sells.toLocaleString()}</div>
        </div>
        <div className="cstat">
          <div className="cstat-label">Age</div>
          <div className="cstat-val">{fmtAge(pair.age)}</div>
        </div>
        <div className="cstat">
          <div className="cstat-label">RSI</div>
          <div
            className="cstat-val"
            style={{
              color:
                pair.rsi > 60
                  ? "#10b981"
                  : pair.rsi < 40
                    ? "#ef4444"
                    : "#f59e0b",
            }}
          >
            {pair.rsi.toFixed(0)}
          </div>
        </div>
        <div className="cstat">
          <div className="cstat-label">MACD</div>
          <div
            className={classNames("cstat-val", pair.macdBull ? "pos" : "neg")}
          >
            {pair.macdBull ? "Bullish" : "Bearish"}
          </div>
        </div>
      </div>
    </div>
  );
}
