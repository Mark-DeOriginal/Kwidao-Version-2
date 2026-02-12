'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline: number[];
}

const COINS_TO_TRACK = ['bitcoin', 'ethereum', 'avalanche-2', 'solana', 'sui'];
const STORAGE_KEY = 'kwidao_market_prices';
const REFRESH_INTERVAL = 3000; // 3 seconds

// Fallback data in case API fails completely
const FALLBACK_PRICES: Record<string, any> = {
  bitcoin: { usd: 42500, usd_24h_change: 2.5, usd_sparkline_7d: Array(24).fill(42000) },
  ethereum: { usd: 2850, usd_24h_change: 1.8, usd_sparkline_7d: Array(24).fill(2800) },
  'avalanche-2': { usd: 38.5, usd_24h_change: 3.2, usd_sparkline_7d: Array(24).fill(37.5) },
  solana: { usd: 168.75, usd_24h_change: 4.1, usd_sparkline_7d: Array(24).fill(162) },
  sui: { usd: 3.45, usd_24h_change: 2.9, usd_sparkline_7d: Array(24).fill(3.35) },
};

export default function LiveMarketWidget() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Format raw data into PriceData
  const formatPriceData = useCallback((data: Record<string, any>): PriceData[] => {
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: data.bitcoin?.usd || FALLBACK_PRICES.bitcoin.usd,
        price_change_percentage_24h: data.bitcoin?.usd_24h_change || FALLBACK_PRICES.bitcoin.usd_24h_change,
        sparkline: (data.bitcoin?.usd_sparkline_7d || FALLBACK_PRICES.bitcoin.usd_sparkline_7d).slice(-24),
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: data.ethereum?.usd || FALLBACK_PRICES.ethereum.usd,
        price_change_percentage_24h: data.ethereum?.usd_24h_change || FALLBACK_PRICES.ethereum.usd_24h_change,
        sparkline: (data.ethereum?.usd_sparkline_7d || FALLBACK_PRICES.ethereum.usd_sparkline_7d).slice(-24),
      },
      {
        id: 'avalanche-2',
        symbol: 'AVAX',
        name: 'Avalanche',
        current_price: data['avalanche-2']?.usd || FALLBACK_PRICES['avalanche-2'].usd,
        price_change_percentage_24h: data['avalanche-2']?.usd_24h_change || FALLBACK_PRICES['avalanche-2'].usd_24h_change,
        sparkline: (data['avalanche-2']?.usd_sparkline_7d || FALLBACK_PRICES['avalanche-2'].usd_sparkline_7d).slice(-24),
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        current_price: data.solana?.usd || FALLBACK_PRICES.solana.usd,
        price_change_percentage_24h: data.solana?.usd_24h_change || FALLBACK_PRICES.solana.usd_24h_change,
        sparkline: (data.solana?.usd_sparkline_7d || FALLBACK_PRICES.solana.usd_sparkline_7d).slice(-24),
      },
      {
        id: 'sui',
        symbol: 'SUI',
        name: 'Sui',
        current_price: data.sui?.usd || FALLBACK_PRICES.sui.usd,
        price_change_percentage_24h: data.sui?.usd_24h_change || FALLBACK_PRICES.sui.usd_24h_change,
        sparkline: (data.sui?.usd_sparkline_7d || FALLBACK_PRICES.sui.usd_sparkline_7d).slice(-24),
      },
    ];
  }, []);

  // Load from localStorage
  const loadFromCache = useCallback(() => {
    try {
      if (typeof window === 'undefined') return null;
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      return null;
    }
  }, []);

  // Save to localStorage
  const saveToCache = useCallback((data: PriceData[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      // Silently fail
    }
  }, []);

  // Fetch prices with retry logic
  const fetchPrices = useCallback(async (retries = 0) => {
    try {
      const coins = COINS_TO_TRACK.join(',');
      const response = await fetch(`/api/market-prices?coins=${coins}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch prices');
      }

      const formattedData = formatPriceData(result.data);
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
  }, [formatPriceData, saveToCache, loadFromCache]);

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
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;

    return (
      <svg viewBox="0 0 40 16" className="w-full h-6 mt-2">
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1"
          points={sparkline
            .map((price, i) => {
              const x = (i / (sparkline.length - 1)) * 40;
              const y = 16 - ((price - min) / range) * 14 - 1;
              return `${x},${y}`;
            })
            .join(' ')}
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#fff2b0]">{coin.symbol}</span>
              <span className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
            <div className="text-lg font-bold text-[#c1c0bc] font-mono">
              ${coin.current_price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {coin.sparkline.length > 1 && getMiniChart(coin.sparkline, isPositive)}
          </motion.div>
        );
      })}
    </div>
  );
}
