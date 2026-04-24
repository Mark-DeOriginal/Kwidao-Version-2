import { NextRequest, NextResponse } from "next/server";

import {
  DEX_ARB_FILTER,
  PERP_DIRECTORY,
  resolveCompareIds,
  type CompareCoin,
  type CompareLiteResponse,
  type CompareResponse,
  type DexPair,
  type HeatmapCategory,
  type HeatmapCoin,
  type HeatmapResponse,
  type PerpsResponse,
  type SignalMover,
  type SignalsResponse,
  type TickerResponse,
  type TrendingCoin,
} from "@/lib/defiIntelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CG = "https://api.coingecko.com/api/v3";
const DEX = "https://api.dexscreener.com";
const FG = "https://api.alternative.me/fng/?limit=1&format=json";

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "kwidao-defi-intelligence",
};

const cache = new Map<string, { expires: number; staleUntil: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();
let cgQueue: Promise<void> = Promise.resolve();
let cgLastRequestAt = 0;
const CG_MIN_GAP_MS = 1100;

type CoinGeckoGlobal = {
  data?: {
    total_market_cap?: { usd?: number };
    market_cap_percentage?: { btc?: number };
  };
};

type FearGreedApi = {
  data?: Array<{ value: string; value_classification: string }>;
};

type TrendingApi = {
  coins?: Array<{
    item: {
      id: string;
      symbol: string;
      name: string;
      market_cap_rank: number | null;
      thumb: string;
    };
  }>;
};

type DexBoost = { chainId?: string; tokenAddress?: string };

type DexPairsApi = {
  pairs?: Array<{
    chainId?: string;
    priceUsd?: string;
    liquidity?: { usd?: number };
    volume?: { h24?: number };
    priceChange?: { h24?: number };
    baseToken?: { address?: string; symbol?: string; name?: string };
  }>;
};

type DerivTicker = {
  market?: string;
  symbol?: string;
  index_id?: string;
  price?: number;
  index?: number;
  contract_type?: string;
};

type DerivExchange = {
  name?: string;
  image?: string | null;
  url?: string | null;
  trade_volume_24h_btc?: number | null;
  open_interest_btc?: number | null;
};

function cgUrl(path: string, params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined) search.set(key, String(val));
  });
  return `${CG}${path}?${search.toString()}`;
}

async function fetchJson<T>(url: string, revalidate = 60) {
  const isCoinGecko = url.startsWith(CG);

  const run = async () => {
    if (isCoinGecko) {
      await new Promise<void>((resolve) => {
        cgQueue = cgQueue
          .catch(() => undefined)
          .then(async () => {
            const wait = Math.max(0, CG_MIN_GAP_MS - (Date.now() - cgLastRequestAt));
            if (wait > 0) await new Promise((r) => setTimeout(r, wait));
            cgLastRequestAt = Date.now();
            resolve();
          });
      });
    }

    let response = await fetch(url, { headers: HEADERS, next: { revalidate } });
    if (response.status === 429 && isCoinGecko) {
      await new Promise((r) => setTimeout(r, 2200));
      response = await fetch(url, { headers: HEADERS, next: { revalidate } });
    }

    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  };

  const existing = inflight.get(url) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = run().finally(() => inflight.delete(url));
  inflight.set(url, pending);
  return pending;
}

async function withCache<T>(key: string, ttlMs: number, loader: () => Promise<T>, staleTtlMs = 300_000): Promise<T> {
  const now = Date.now();
  const found = cache.get(key);
  if (found && found.expires > now) return found.data as T;
  try {
    const data = await loader();
    cache.set(key, { expires: now + ttlMs, staleUntil: now + staleTtlMs, data });
    return data;
  } catch (error) {
    if (found && found.staleUntil > now) {
      return found.data as T;
    }
    throw error;
  }
}

async function getSimplePrice(ids: string[], include24hChange = false, ttlMs = 5_000) {
  const normalized = ids.map((id) => id.trim().toLowerCase()).filter(Boolean);
  const key = `cg:simple:${normalized.slice().sort().join(",")}:${include24hChange ? "chg" : "plain"}`;
  return withCache(
    key,
    ttlMs,
    () =>
      fetchJson<Record<string, { usd?: number; usd_24h_change?: number }>>(
        cgUrl("/simple/price", {
          ids: normalized.join(","),
          vs_currencies: "usd",
          include_24hr_change: include24hChange,
        }),
        5,
      ),
    300_000,
  );
}

function n(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeDerivativeSymbol(symbol: string | undefined, indexId: string | undefined) {
  const fallback = (indexId ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const raw = (symbol ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const stripped = raw
    .replace(/PERP$/g, "")
    .replace(/USDTPERP$/g, "")
    .replace(/USDCPERP$/g, "")
    .replace(/USDEPERP$/g, "")
    .replace(/USDT$/g, "")
    .replace(/USDC$/g, "")
    .replace(/USD$/g, "");
  return stripped || fallback;
}

function fearHint(value: number) {
  if (value <= 25) return "Extreme fear conditions, risk can be elevated but reversals can form.";
  if (value <= 45) return "Fear regime, favor selective entries with confirmation.";
  if (value <= 60) return "Neutral sentiment, leadership and flow matter more than mood.";
  if (value <= 75) return "Greed regime, trend can stay strong but watch exhaustion.";
  return "Extreme greed, tighten risk controls and avoid overexposure.";
}

async function getTicker(): Promise<TickerResponse> {
  return withCache("ticker", 5_000, async () => {
    const ids = ["bitcoin", "ethereum", "avalanche-2", "solana", "chainlink", "uniswap"];
    const [prices, global] = await Promise.all([
      getSimplePrice(ids, true, 5_000),
      withCache("coingecko:global", 60_000, () => fetchJson<CoinGeckoGlobal>(`${CG}/global`, 60)),
    ]);

    const symbols: Record<string, string> = {
      bitcoin: "BTC",
      ethereum: "ETH",
      "avalanche-2": "AVAX",
      solana: "SOL",
      chainlink: "LINK",
      uniswap: "UNI",
    };

    return {
      items: ids.map((id) => ({
        id,
        symbol: symbols[id] ?? id.toUpperCase(),
        price: n(prices[id]?.usd),
        change24h: n(prices[id]?.usd_24h_change),
      })),
      globalMarketCap: global.data?.total_market_cap?.usd ?? null,
      updatedAt: new Date().toISOString(),
    };
  });
}

async function getCompare(input: string | null): Promise<CompareResponse> {
  const resolved = resolveCompareIds(input ?? "bitcoin, ethereum, avalanche-2, solana");
  if (resolved.length < 2) throw new Error("Please enter at least 2 assets.");

  return withCache(`compare:${resolved.join(",")}`, 30_000, async () => {
    const coins = await fetchJson<CompareCoin[]>(
      cgUrl("/coins/markets", {
        vs_currency: "usd",
        ids: resolved.join(","),
        order: "market_cap_desc",
        per_page: resolved.length,
        page: 1,
        sparkline: true,
        price_change_percentage: "24h,7d,30d",
      }),
    );
    return { coins, resolvedIds: resolved, updatedAt: new Date().toISOString() };
  });
}

async function getCompareLite(input: string | null): Promise<CompareLiteResponse> {
  const resolved = resolveCompareIds(input ?? "bitcoin, ethereum, avalanche-2, solana");
  if (resolved.length < 2) throw new Error("Please enter at least 2 assets.");

  return withCache(`compare-lite:${resolved.join(",")}`, 5_000, async () => {
    const prices = await getSimplePrice(resolved, true, 5_000);

    return {
      resolvedIds: resolved,
      updates: resolved.map((id) => ({
        id,
        current_price: prices[id]?.usd ?? null,
        price_change_percentage_24h: prices[id]?.usd_24h_change ?? null,
      })),
      updatedAt: new Date().toISOString(),
    };
  });
}

async function getHeatmap(categoryInput: string | null): Promise<HeatmapResponse> {
  const category = (categoryInput as HeatmapCategory) || "decentralized-finance-defi";
  return withCache(`heatmap:${category}`, 60_000, async () => {
    const coins = await fetchJson<HeatmapCoin[]>(
      cgUrl("/coins/markets", {
        vs_currency: "usd",
        category,
        order: "market_cap_desc",
        per_page: 60,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      }),
    );
    return { category, coins, updatedAt: new Date().toISOString() };
  });
}

async function fetchDexPairs(): Promise<DexPair[]> {
  const boosts = await fetchJson<DexBoost[]>(`${DEX}/token-boosts/top/v1`, 60);
  const top = boosts.slice(0, 8).filter((b) => b.tokenAddress && b.chainId);
  if (!top.length) return [];

  const addresses = top.map((b) => b.tokenAddress).join(",");
  const pairsData = await fetchJson<DexPairsApi>(`${DEX}/latest/dex/tokens/${addresses}`, 60).catch(() => ({ pairs: [] }));
  const bestByAddress = new Map<string, DexPairsApi["pairs"][number]>();

  (pairsData.pairs ?? []).forEach((pair) => {
    const address = (pair.baseToken?.address ?? "").toLowerCase();
    if (!address) return;
    const current = bestByAddress.get(address);
    const currentLiq = current?.liquidity?.usd ?? 0;
    const nextLiq = pair.liquidity?.usd ?? 0;
    if (!current || nextLiq > currentLiq) bestByAddress.set(address, pair);
  });

  return top.map((boost) => {
    const pair = bestByAddress.get((boost.tokenAddress ?? "").toLowerCase());
    return {
      tokenAddress: boost.tokenAddress ?? "",
      chainId: boost.chainId ?? "",
      symbol: pair?.baseToken?.symbol ?? "N/A",
      name: pair?.baseToken?.name ?? "Unknown",
      priceUsd: pair?.priceUsd ? n(pair.priceUsd) : null,
      change24h: pair?.priceChange?.h24 ?? null,
      volume24h: pair?.volume?.h24 ?? null,
      liquidityUsd: pair?.liquidity?.usd ?? null,
    };
  });
}

function buildArbitrageRows(tickers: DerivTicker[]) {
  const grouped: Record<string, DerivTicker[]> = {};
  tickers.forEach((ticker) => {
    const sym = normalizeDerivativeSymbol(ticker.symbol, ticker.index_id);
    if (!sym) return;
    if (!grouped[sym]) grouped[sym] = [];
    grouped[sym].push(ticker);
  });

  return Object.entries(grouped)
    .map(([sym, rows]) => {
      const prices = rows.map((r) => n(r.price)).filter((v) => v > 0);
      if (!prices.length) return null;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const spread = prices.length > 1 ? ((maxPrice - minPrice) / minPrice) * 100 : 0;
      const high = rows.find((r) => n(r.price) === maxPrice)?.market ?? "-";
      const low = rows.find((r) => n(r.price) === minPrice)?.market ?? "Spot";
      const spot = n(rows[0]?.index);
      const basis = spot > 0 ? ((maxPrice - spot) / spot) * 100 : null;
      if (spread < 0.01 && (basis == null || Math.abs(basis) < 0.01)) return null;
      return { sym, spread, maxPrice, minPrice, highVenue: high, lowVenue: low, basis, count: prices.length };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.spread ?? 0) - (a?.spread ?? 0))
    .slice(0, 30) as SignalsResponse["arbitrage"];
}

async function getSignals(): Promise<SignalsResponse> {
  return withCache("signals", 60_000, async () => {
    const [pulse, global, fear, trending, movers, hotPairs, derivatives] = await Promise.all([
      getSimplePrice(["bitcoin", "ethereum", "avalanche-2"], false, 5_000),
      fetchJson<CoinGeckoGlobal>(`${CG}/global`),
      fetchJson<FearGreedApi>(FG).catch(() => ({ data: [] })),
      fetchJson<TrendingApi>(`${CG}/search/trending`),
      fetchJson<CompareCoin[]>(
        cgUrl("/coins/markets", {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 250,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
        }),
      ),
      fetchDexPairs().catch(() => []),
      fetchJson<DerivTicker[]>(`${CG}/derivatives?include_tickers=unexpired`, 60).catch(() => []),
    ]);

    const trendingIds = (trending.coins ?? []).map((c) => c.item.id).slice(0, 7);
    const trendingPrices = trendingIds.length
      ? await getSimplePrice(trendingIds, true, 5_000).catch(() => ({}))
      : {};

    const trendingList: TrendingCoin[] = (trending.coins ?? []).slice(0, 7).map((row) => ({
      id: row.item.id,
      symbol: row.item.symbol.toUpperCase(),
      name: row.item.name,
      thumb: row.item.thumb,
      marketCapRank: row.item.market_cap_rank,
      price: trendingPrices[row.item.id]?.usd ?? null,
      change24h: trendingPrices[row.item.id]?.usd_24h_change ?? null,
    }));

    const valid = movers
      .filter((m) => m.price_change_percentage_24h != null && Number.isFinite(m.price_change_percentage_24h))
      .sort((a, b) => n(b.price_change_percentage_24h) - n(a.price_change_percentage_24h));

    const mapMover = (coin: CompareCoin): SignalMover => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: n(coin.price_change_percentage_24h),
      market_cap_rank: null,
    });

    const dexOnly = derivatives.filter(
      (t) =>
        t.contract_type === "perpetual" &&
        n(t.price) > 0 &&
        n(t.index) > 0 &&
        DEX_ARB_FILTER.some((name) => normalize(t.market ?? "").includes(name)),
    );
    const fallback = derivatives.filter((t) => t.contract_type === "perpetual" && n(t.price) > 0 && n(t.index) > 0);
    const primaryArbRows = buildArbitrageRows(dexOnly.length ? dexOnly : fallback);
    const secondaryArbRows = dexOnly.length && primaryArbRows.length === 0 ? buildArbitrageRows(fallback) : [];
    const arbitrageRows = primaryArbRows.length > 0 ? primaryArbRows : secondaryArbRows;
    const arbSource = dexOnly.length ? dexOnly : fallback;

    const point = fear.data?.[0];
    const value = point ? Number.parseInt(point.value, 10) : Number.NaN;

    return {
      updatedAt: new Date().toISOString(),
      fearAndGreed:
        Number.isFinite(value) && point
          ? { value, classification: point.value_classification, hint: fearHint(value) }
          : null,
      pulse: {
        bitcoin: pulse.bitcoin?.usd ?? null,
        ethereum: pulse.ethereum?.usd ?? null,
        avalanche: pulse["avalanche-2"]?.usd ?? null,
        btcDominance: global.data?.market_cap_percentage?.btc ?? null,
      },
      trending: trendingList,
      gainers: valid.slice(0, 6).map(mapMover),
      losers: valid.slice(-6).reverse().map(mapMover),
      hotPairs,
      arbitrage: arbitrageRows,
      arbitrageContractCount: arbSource.length,
      arbitrageDexOnly: dexOnly.length > 0,
    };
  });
}

function pickLiveRow(name: string, rows: DerivExchange[]) {
  const norm = normalize(name);
  return rows.find((row) => {
    const rowName = normalize(row.name ?? "");
    return rowName === norm || rowName.includes(norm) || norm.includes(rowName);
  });
}

async function getPerps(): Promise<PerpsResponse> {
  return withCache("perps", 180_000, async () => {
    const [btc, page1, page2] = await Promise.all([
      fetchJson<Record<string, { usd?: number }>>(cgUrl("/simple/price", { ids: "bitcoin", vs_currencies: "usd" }), 180),
      fetchJson<DerivExchange[]>(cgUrl("/derivatives/exchanges", { per_page: 20, page: 1, order: "open_interest_btc_desc" }), 180),
      fetchJson<DerivExchange[]>(cgUrl("/derivatives/exchanges", { per_page: 20, page: 2, order: "open_interest_btc_desc" }), 180).catch(
        () => [],
      ),
    ]);

    const btcPrice = n(btc.bitcoin?.usd);
    const rows = [...page1, ...page2];
    let liveCount = 0;

    const exchanges = PERP_DIRECTORY.map((entry) => {
      const live = pickLiveRow(entry.name, rows);
      const dailyVolume = live?.trade_volume_24h_btc ? n(live.trade_volume_24h_btc) * btcPrice : entry.fallbackVolume;
      const openInterest = live?.open_interest_btc ? n(live.open_interest_btc) * btcPrice : entry.fallbackOi;
      if (live) liveCount += 1;
      return {
        name: entry.name,
        filter: entry.filter,
        maker: entry.maker,
        taker: entry.taker,
        token: entry.token,
        airdrop: entry.airdrop,
        url: live?.url || entry.url,
        launched: entry.launched,
        dailyVolume,
        openInterest,
        logo: live?.image ?? null,
      };
    });

    const launched = exchanges.filter((e) => e.launched);
    return {
      updatedAt: new Date().toISOString(),
      totalVolume: launched.reduce((sum, row) => sum + row.dailyVolume, 0),
      totalOpenInterest: launched.reduce((sum, row) => sum + row.openInterest, 0),
      liveExchangeCount: liveCount,
      exchanges,
    };
  });
}

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section");
  try {
    if (section === "ticker") return NextResponse.json(await getTicker());
    if (section === "compare") {
      const lite = request.nextUrl.searchParams.get("lite") === "1";
      if (lite) return NextResponse.json(await getCompareLite(request.nextUrl.searchParams.get("ids")));
      return NextResponse.json(await getCompare(request.nextUrl.searchParams.get("ids")));
    }
    if (section === "heatmap") return NextResponse.json(await getHeatmap(request.nextUrl.searchParams.get("category")));
    if (section === "signals") return NextResponse.json(await getSignals());
    if (section === "perps") return NextResponse.json(await getPerps());
    return NextResponse.json({ error: "Unknown section. Use ticker, compare, heatmap, signals, or perps." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load DeFi Intelligence data.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
