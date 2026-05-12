import { WALLETCONNECT_ASSETS } from "./constants";
import type { WalletPriceItem } from "../types/walletTypes";

type PriceCacheValue = {
  prices: WalletPriceItem[];
  timestamp: number;
};

const PRICE_CACHE_TTL_MS = 30_000;
const PRICE_CACHE_KEY = "walletconnect-prices";
const priceCache = new Map<string, PriceCacheValue>();

type CoinGeckoPriceResponse = Record<
  string,
  {
    usd?: number;
    usd_24h_change?: number;
  }
>;

export async function getWalletPrices() {
  const cached = priceCache.get(PRICE_CACHE_KEY);
  const now = Date.now();

  if (cached && now - cached.timestamp < PRICE_CACHE_TTL_MS) {
    return {
      prices: cached.prices,
      updatedAt: new Date(cached.timestamp).toISOString(),
    };
  }

  const coingeckoIds = WALLETCONNECT_ASSETS.map((asset) => asset.coingeckoId).join(",");
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd&include_24hr_change=true`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`CoinGecko request failed: ${response.status}`);
  }

  const payload = (await response.json()) as CoinGeckoPriceResponse;
  const prices: WalletPriceItem[] = WALLETCONNECT_ASSETS.map((asset) => ({
    symbol: asset.symbol,
    usd: payload[asset.coingeckoId]?.usd ?? 0,
    usd24hChange: payload[asset.coingeckoId]?.usd_24h_change ?? null,
  }));

  priceCache.set(PRICE_CACHE_KEY, { prices, timestamp: now });
  return {
    prices,
    updatedAt: new Date(now).toISOString(),
  };
}

