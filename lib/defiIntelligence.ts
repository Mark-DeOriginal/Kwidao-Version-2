export type DefiTabId = "intelligence" | "compare" | "heatmap" | "signals" | "perps";

export type CompareMetric = "24h" | "7d" | "30d" | "mcap" | "volume";
export type CompareChartType = "bar" | "radar" | "sparkline";
export type HeatmapCategory =
  | "decentralized-finance-defi"
  | "layer-1"
  | "layer-2"
  | "avalanche-ecosystem";
export type PerpFilter = "all" | "ethereum" | "arbitrum" | "avalanche" | "bsc" | "solana" | "base";

export type TickerItem = {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
};

export type TickerResponse = {
  items: TickerItem[];
  globalMarketCap: number | null;
  updatedAt: string;
};

export type CompareCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  price_change_percentage_30d_in_currency: number | null;
  sparkline_in_7d?: { price: number[] };
};

export type CompareResponse = {
  coins: CompareCoin[];
  resolvedIds: string[];
  updatedAt: string;
};

export type CompareLiteResponse = {
  resolvedIds: string[];
  updates: Array<{
    id: string;
    current_price: number | null;
    price_change_percentage_24h: number | null;
  }>;
  updatedAt: string;
};

export type HeatmapCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number | null;
};

export type HeatmapResponse = {
  category: HeatmapCategory;
  coins: HeatmapCoin[];
  updatedAt: string;
};

export type FearGreed = {
  value: number;
  classification: string;
  hint: string;
};

export type TrendingCoin = {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
  marketCapRank: number | null;
  price: number | null;
  change24h: number | null;
};

export type SignalMover = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number | null;
};

export type DexPair = {
  tokenAddress: string;
  chainId: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
};

export type ArbitrageRow = {
  sym: string;
  spread: number;
  maxPrice: number;
  minPrice: number;
  highVenue: string;
  lowVenue: string;
  basis: number | null;
  count: number;
};

export type SignalsResponse = {
  updatedAt: string;
  fearAndGreed: FearGreed | null;
  pulse: {
    bitcoin: number | null;
    ethereum: number | null;
    avalanche: number | null;
    btcDominance: number | null;
  };
  trending: TrendingCoin[];
  gainers: SignalMover[];
  losers: SignalMover[];
  hotPairs: DexPair[];
  arbitrage: ArbitrageRow[];
  arbitrageContractCount: number | null;
  arbitrageDexOnly: boolean;
};

export type PerpExchange = {
  name: string;
  filter: PerpFilter | "multichain";
  maker: string;
  taker: string;
  token: string;
  airdrop: string;
  url: string;
  launched: boolean;
  dailyVolume: number;
  openInterest: number;
  logo: string | null;
};

export type PerpsResponse = {
  updatedAt: string;
  totalVolume: number;
  totalOpenInterest: number;
  liveExchangeCount: number;
  exchanges: PerpExchange[];
};

export const TABS: Array<{ id: DefiTabId; label: string }> = [
  { id: "intelligence", label: "Intelligence" },
  { id: "compare", label: "Compare" },
  { id: "heatmap", label: "Heatmap" },
  { id: "signals", label: "Signals" },
  { id: "perps", label: "Perp DEXes" },
];

export const QUICK_QUERIES = [
  "Top perpetual DEXes by volume and OI",
  "DexScreener new and hot token pairs",
  "Messari deep metrics for AVAX",
  "Top AVAX yield farms right now",
  "Stablecoin peg health check",
  "DeFi hacks and security alerts",
  "CoinGecko trending narratives",
  "Fear and Greed plus NVT signal",
];

export const AGENTS = [
  {
    name: "News Scanner",
    description:
      "CryptoPanic headlines, Fear and Greed index, BTC dominance, and Messari institutional research.",
    tags: ["CryptoPanic", "Messari", "Fear and Greed"],
  },
  {
    name: "On-Chain Intel",
    description:
      "DeFiLlama TVL across chains, yield farms, stablecoin peg health, hack tracker, and NVT context.",
    tags: ["DeFiLlama", "Messari", "TVL and NVT"],
  },
  {
    name: "Market Data",
    description:
      "CoinGecko prices, market caps, trend velocity, and comparative performance for assets and sectors.",
    tags: ["CoinGecko", "Compare", "Heatmap"],
  },
  {
    name: "Perp DEX Intel",
    description:
      "CoinGecko derivatives exchange data with fee and token context from the perp DEX ecosystem snapshot.",
    tags: ["Perp DEXes", "Volume", "Open Interest"],
  },
  {
    name: "Security Radar",
    description:
      "Tracks exploit patterns, bridge incidents, and protocol risk signals used to flag execution risk.",
    tags: ["Incidents", "Bridges", "Risk"],
  },
  {
    name: "Strategy Layer",
    description:
      "Maps market conditions to tactical views, including trend and arbitrage context from the signals panel.",
    tags: ["Signals", "Arbitrage", "Execution"],
  },
];

export const DATA_SOURCES = [
  { name: "Avalanche", type: "C-Chain and EVM" },
  { name: "DeFiLlama", type: "TVL, stablecoins, hacks" },
  { name: "CoinGecko", type: "Markets and derivatives" },
  { name: "DexScreener", type: "Boosted pair activity" },
  { name: "Alternative.me", type: "Fear and Greed index" },
  { name: "Messari", type: "Research metrics" },
];

export const COMPARE_PRESETS = [
  { label: "BTC vs ETH vs AVAX vs SOL", ids: "bitcoin,ethereum,avalanche-2,solana" },
  { label: "DeFi majors", ids: "chainlink,uniswap,aave,maker" },
  { label: "L1 leaders", ids: "bitcoin,ethereum,solana,avalanche-2" },
];

export const HEATMAP_OPTIONS: Array<{ id: HeatmapCategory; label: string }> = [
  { id: "decentralized-finance-defi", label: "DeFi Tokens" },
  { id: "layer-1", label: "Layer 1" },
  { id: "layer-2", label: "Layer 2" },
  { id: "avalanche-ecosystem", label: "Avalanche" },
];

export const PERP_FILTERS: Array<{ id: PerpFilter; label: string }> = [
  { id: "all", label: "All Chains" },
  { id: "ethereum", label: "Ethereum" },
  { id: "arbitrum", label: "Arbitrum" },
  { id: "avalanche", label: "Avalanche" },
  { id: "bsc", label: "BSC" },
  { id: "solana", label: "Solana" },
  { id: "base", label: "Base" },
];

const ALIAS_MAP: Record<string, string> = {
  avax: "avalanche-2",
  avalanche: "avalanche-2",
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  link: "chainlink",
  uni: "uniswap",
};

export function resolveCompareIds(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => ALIAS_MAP[item] || item.replace(/\s+/g, "-"))
    .filter((item, idx, arr) => arr.indexOf(item) === idx)
    .slice(0, 6);
}

export function formatCurrency(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPct(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function tone(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "neutral";
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

export const DEX_ARB_FILTER = [
  "hyperliquid",
  "gmx",
  "vertex",
  "drift",
  "dydx",
  "apex",
  "synfutures",
  "kwenta",
  "rabbitx",
  "ostium",
  "perennial",
];

export const PERP_SNAPSHOT_LABEL = "Apr 7 2026";

const PERP_FILTER_MAP: Partial<Record<string, PerpFilter | "multichain">> = {
  tradeXYZ: "ethereum",
  Aster: "bsc",
  edgeX: "ethereum",
  Lighter: "base",
  ApeX: "arbitrum",
  Extended: "ethereum",
  Ostium: "arbitrum",
  Reya: "ethereum",
  GMX: "arbitrum",
  Paradex: "ethereum",
  Ethereal: "ethereum",
  "01": "solana",
  Avantis: "base",
  Drift: "solana",
};

const PERP_RAW = [
  ["Hyperliquid", "0.015%", "0.045%", "$HYPE", "Season 2", "https://hyperliquid.xyz", true, 6.62e9, 5.61e9],
  ["tradeXYZ", "0.03%", "0.09%", "-", "Active", "https://trade.xyz", true, 5.56e9, 1.84e9],
  ["Aster", "0.005%", "0.04%", "$ASTER", "Stage 5", "https://aster.exchange", true, 2.87e9, 1.87e9],
  ["edgeX", "0.012%", "0.038%", "-", "Active", "https://edgex.exchange", true, 2.68e9, 1.04e9],
  ["Lighter", "0%", "0%", "$LIT", "Season 3", "https://lighter.xyz", true, 2.41e9, 710.4e6],
  ["GRVT", "-0.0001%", "0.045%", "-", "Active", "https://grvt.io", true, 1.91e9, 456.2e6],
  ["ApeX", "0.02%", "0.05%", "$APEX", "-", "https://apex.exchange", true, 1.18e9, 120.2e6],
  ["Extended", "0%", "0.025%", "-", "Active", "https://extended.xyz", true, 990.3e6, 337.6e6],
  ["Pacifica", "0.015%", "0.04%", "-", "Active", "https://pacifica.fi", true, 821.7e6, 78.2e6],
  ["Variational", "0%", "0%", "-", "Active", "https://variational.io", true, 708.2e6, 657.3e6],
  ["StandX", "0.01%", "0.04%", "-", "Active", "https://standx.xyz", true, 557.3e6, 100.5e6],
  ["Ostium", "0.03%", "0.1%", "-", "Active", "https://ostium.io", true, 435e6, 180.4e6],
  ["Nado", "0.01%", "0.035%", "-", "Active", "https://nado.trade", true, 416.1e6, 109.5e6],
  ["dYdX", "0.01%", "0.05%", "$DYDX", "-", "https://dydx.exchange", true, 337e6, 69.1e6],
  ["Dreamcash", "0.025%", "0.025%", "-", "Active", "https://dreamcash.trade", true, 248e6, 75.9e6],
  ["Reya", "0.04%", "0.04%", "$REYA", "Active", "https://reya.network", true, 200e6, 21.5e6],
  ["GMX", "0.04%", "0.06%", "$GMX", "-", "https://gmx.io", true, 142.5e6, 58.5e6],
  ["Rho", "dynamic", "dynamic", "-", "Active", "https://rho.trading", true, 139.5e6, 70.8e6],
  ["Felix", "0.03%", "0.09%", "-", "Active", "https://felix.trade", true, 52.3e6, 15.1e6],
  ["Gains", "0.05%", "0.05%", "$GNS", "-", "https://gains.trade", true, 49.2e6, 4.8e6],
  ["Markets", "0.038%", "0.0431%", "$KNTQ", "-", "https://markets.trade", true, 46.2e6, 15.9e6],
  ["Paradex", "0%", "0%", "-", "Active", "https://paradex.trade", true, 44.8e6, 53.4e6],
  ["Vest", "0.01%", "0.01%", "-", "Active", "https://vest.exchange", true, 37.1e6, 64.5e6],
  ["Ethereal", "0%", "0.03%", "-", "Active", "https://ethereal.trade", true, 30.4e6, 137.2e6],
  ["HYENA", "0.0167%", "0.05%", "-", "Active", "https://hyena.trade", true, 27.9e6, 52e6],
  ["Hibachi", "0%", "0.045%", "-", "Active", "https://hibachi.xyz", true, 27.3e6, 2.8e6],
  ["01", "0.01%", "0.035%", "-", "Active", "https://01exchange.io", true, 25e6, 4.4e6],
  ["Decibel", "0.011%", "0.034%", "-", "Active", "https://decibel.finance", true, 23.5e6, 2.5e6],
  ["Hotstuff", "-0.002%", "0.025%", "-", "Active", "https://hotstuff.trade", true, 21e6, 4.2e6],
  ["Boros", "dynamic", "dynamic", "-", "-", "https://boros.fi", true, 17.6e6, 19.7e6],
  ["Avantis", "0.06%", "0.06%", "$AVNT", "Season 3", "https://avantisfi.com", true, 15.1e6, 7.6e6],
  ["Ventuals", "0.03%", "0.09%", "-", "Active", "https://ventuals.xyz", true, 5.3e6, 9.7e6],
  ["Perpl", "0.019%", "0.05%", "-", "Active", "https://perpl.io", true, 556e3, 123e3],
  ["Rocket", "0.01%", "0.01%", "-", "Active", "https://rocket.trade", true, 363e3, 29e3],
  ["Drift", "-0.0025%", "0.035%", "$DRIFT", "-", "https://drift.trade", true, 0, 124.5e6],
  ["Nunchi", "-", "-", "-", "Active", "", false, 0, 0],
  ["GTE", "-", "-", "-", "Active", "", false, 0, 0],
  ["Drake", "-", "-", "-", "Active", "", false, 0, 0],
  ["Noise", "-", "-", "-", "Active", "", false, 0, 0],
  ["Euphoria", "-", "-", "-", "Active", "", false, 0, 0],
  ["Polyester", "-", "-", "-", "Active", "", false, 0, 0],
  ["Cascade", "-", "-", "-", "Active", "", false, 0, 0],
  ["Bulk", "-", "-", "-", "Active", "", false, 0, 0],
  ["HelloTrade", "-", "-", "-", "Active", "", false, 0, 0],
  ["Ondo Perps", "-", "-", "-", "Active", "", false, 0, 0],
  ["Bullet", "-", "-", "-", "Active", "", false, 0, 0],
] as const;

function keyFromName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const PERP_DIRECTORY = PERP_RAW.map((row) => ({
  key: keyFromName(row[0]),
  name: row[0],
  maker: row[1],
  taker: row[2],
  token: row[3],
  airdrop: row[4],
  url: row[5],
  launched: row[6],
  fallbackVolume: row[7],
  fallbackOi: row[8],
  filter: PERP_FILTER_MAP[row[0]] ?? "multichain",
}));
