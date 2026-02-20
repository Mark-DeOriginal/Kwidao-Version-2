"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline: number[];
  image?: string;
}

const COINS_TO_TRACK = ["bitcoin", "ethereum", "avalanche-2", "solana", "sui"];
const STORAGE_KEY = "kwidao_market_prices";
const REFRESH_INTERVAL = 3000; // 3 seconds

// Helper to generate realistic sparkline data
const generateSparkline = (
  current: number,
  changePercent: number,
): number[] => {
  const sparkline: number[] = [];
  const change = (changePercent / 100) * current;
  const low = current - Math.abs(change) * 1.5;
  const high = current + Math.abs(change) * 1.5;

  for (let i = 0; i < 24; i++) {
    // Create a more realistic chart with some trend
    const trend = (i / 24) * (change / 2);
    const noise = (Math.random() - 0.5) * Math.abs(change);
    const basePrice = low + (high - low) / 2 + trend + noise;
    sparkline.push(Math.max(low, Math.min(high, basePrice)));
  }

  return sparkline;
};

// Fallback data in case API fails completely
const FALLBACK_PRICES: Record<string, any> = {
  bitcoin: {
    usd: 42500,
    usd_24h_change: 2.5,
    usd_sparkline_7d: generateSparkline(42500, 2.5),
  },
  ethereum: {
    usd: 2850,
    usd_24h_change: 1.8,
    usd_sparkline_7d: generateSparkline(2850, 1.8),
  },
  "avalanche-2": {
    usd: 38.5,
    usd_24h_change: 3.2,
    usd_sparkline_7d: generateSparkline(38.5, 3.2),
  },
  solana: {
    usd: 168.75,
    usd_24h_change: 4.1,
    usd_sparkline_7d: generateSparkline(168.75, 4.1),
  },
  sui: {
    usd: 3.45,
    usd_24h_change: 2.9,
    usd_sparkline_7d: generateSparkline(3.45, 2.9),
  },
};

export default function LiveMarketWidget() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Format raw data into PriceData
  const formatPriceData = useCallback(
    (
      data: Record<string, any>,
      images: Record<string, string> = {},
    ): PriceData[] => {
      return [
        {
          id: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          current_price: data.bitcoin?.usd || FALLBACK_PRICES.bitcoin.usd,
          price_change_percentage_24h:
            data.bitcoin?.usd_24h_change ||
            FALLBACK_PRICES.bitcoin.usd_24h_change,
          sparkline: (
            data.bitcoin?.usd_sparkline_7d ||
            FALLBACK_PRICES.bitcoin.usd_sparkline_7d
          ).slice(-24),
          image: images["bitcoin"],
        },
        {
          id: "ethereum",
          symbol: "ETH",
          name: "Ethereum",
          current_price: data.ethereum?.usd || FALLBACK_PRICES.ethereum.usd,
          price_change_percentage_24h:
            data.ethereum?.usd_24h_change ||
            FALLBACK_PRICES.ethereum.usd_24h_change,
          sparkline: (
            data.ethereum?.usd_sparkline_7d ||
            FALLBACK_PRICES.ethereum.usd_sparkline_7d
          ).slice(-24),
          image: images["ethereum"],
        },
        {
          id: "avalanche-2",
          symbol: "AVAX",
          name: "Avalanche",
          current_price:
            data["avalanche-2"]?.usd || FALLBACK_PRICES["avalanche-2"].usd,
          price_change_percentage_24h:
            data["avalanche-2"]?.usd_24h_change ||
            FALLBACK_PRICES["avalanche-2"].usd_24h_change,
          sparkline: (
            data["avalanche-2"]?.usd_sparkline_7d ||
            FALLBACK_PRICES["avalanche-2"].usd_sparkline_7d
          ).slice(-24),
          image: images["avalanche-2"],
        },
        {
          id: "solana",
          symbol: "SOL",
          name: "Solana",
          current_price: data.solana?.usd || FALLBACK_PRICES.solana.usd,
          price_change_percentage_24h:
            data.solana?.usd_24h_change ||
            FALLBACK_PRICES.solana.usd_24h_change,
          sparkline: (
            data.solana?.usd_sparkline_7d ||
            FALLBACK_PRICES.solana.usd_sparkline_7d
          ).slice(-24),
          image: images["solana"],
        },
        {
          id: "sui",
          symbol: "SUI",
          name: "Sui",
          current_price: data.sui?.usd || FALLBACK_PRICES.sui.usd,
          price_change_percentage_24h:
            data.sui?.usd_24h_change || FALLBACK_PRICES.sui.usd_24h_change,
          sparkline: (
            data.sui?.usd_sparkline_7d || FALLBACK_PRICES.sui.usd_sparkline_7d
          ).slice(-24),
          image: images["sui"],
        },
      ];
    },
    [],
  );

  // Load from localStorage
  const loadFromCache = useCallback(() => {
    try {
      if (typeof window === "undefined") return null;
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      return null;
    }
  }, []);

  // Save to localStorage
  const saveToCache = useCallback((data: PriceData[]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      // Silently fail
    }
  }, []);

  // Fetch prices with retry logic
  const fetchPrices = useCallback(
    async (retries = 0) => {
      try {
        const coins = COINS_TO_TRACK.join(",");
        const response = await fetch(`/api/market-prices?coins=${coins}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-store",
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch prices");
        }

        const images = result.data.images || {};
        const priceData = { ...result.data };
        delete priceData.images;

        const formattedData = formatPriceData(priceData, images);
        setPrices(formattedData);
        saveToCache(formattedData);
        setError(null);
        setIsCached(result.cached || false);
        setIsLoading(false);
      } catch (err) {
        // Try to load from cache
        const cachedData = loadFromCache();
        if (cachedData && cachedData.length > 0) {
          setPrices(cachedData);
          setIsCached(true);
          setIsLoading(false);
          setError(null);
          return;
        }

        // Retry with exponential backoff
        if (retries < 3) {
          const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s exponential backoff
          setTimeout(() => {
            fetchPrices(retries + 1);
          }, delay);
        } else {
          // Use fallback data after all retries fail
          const fallbackData = formatPriceData(FALLBACK_PRICES);
          setPrices(fallbackData);
          setIsLoading(false);
          setError(null); // Don't show error, just use fallback
        }
      }
    },
    [formatPriceData, saveToCache, loadFromCache],
  );

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  if (isLoading && prices.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#363523]/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-[#c1c0bc]/20 rounded w-12 mb-2"></div>
            <div className="h-6 bg-[#c1c0bc]/20 rounded w-24 mb-2"></div>
            <div className="h-3 bg-[#c1c0bc]/20 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const getMiniChart = (sparkline: number[], isPositive: boolean) => {
    if (!sparkline || sparkline.length < 2) return null;

    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;

    const points = sparkline.map((price, i) => {
      const x = (i / (sparkline.length - 1)) * 40;
      const y = 16 - ((price - min) / range) * 14 - 1;
      return { x, y, price };
    });

    const pathPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const fillPath = `M ${pathPoints} L ${points[points.length - 1].x},16 L ${points[0].x},16 Z`;

    const strokeColor = isPositive ? "#10b981" : "#ef4444";
    const fillColor = isPositive ? "#10b98120" : "#ef444420";

    return (
      <svg
        viewBox="0 0 40 16"
        className="w-full h-6 mt-2"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`gradient-${isPositive}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={fillPath}
          fill={`url(#gradient-${isPositive})`}
          opacity="0.5"
        />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pathPoints}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {prices.map((coin, i) => {
        const isPositive = coin.price_change_percentage_24h > 0;
        return (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-lg p-4 hover:border-[#fff2b0]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {coin.image && (
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span className="text-xs font-mono text-[#fff2b0] font-semibold">
                  {coin.symbol}
                </span>
              </div>
              <span
                className={`text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {isPositive ? "+" : ""}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
            <div className="text-lg font-bold text-[#c1c0bc] font-mono">
              $
              {coin.current_price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {coin.sparkline.length > 1 &&
              getMiniChart(coin.sparkline, isPositive)}
          </motion.div>
        );
      })}
    </div>
  );
}
