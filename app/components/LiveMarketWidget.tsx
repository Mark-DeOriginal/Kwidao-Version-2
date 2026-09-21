"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface PriceData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  image?: string;
}

interface AssetDefinition {
  id: string;
  symbol: string;
  name: string;
  fallbackPrice: number;
  fallbackChange: number;
}

const ASSETS: AssetDefinition[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", fallbackPrice: 42500, fallbackChange: 2.5 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", fallbackPrice: 2850, fallbackChange: 1.8 },
  { id: "pax-gold", symbol: "PAXG", name: "Gold", fallbackPrice: 2650, fallbackChange: 0.4 },
  { id: "ripple", symbol: "XRP", name: "XRP", fallbackPrice: 2.18, fallbackChange: 1.2 },
  { id: "zcash", symbol: "ZEC", name: "Zcash", fallbackPrice: 48.2, fallbackChange: -0.8 },
  { id: "solana", symbol: "SOL", name: "Solana", fallbackPrice: 168.75, fallbackChange: 4.1 },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", fallbackPrice: 38.5, fallbackChange: 3.2 },
  { id: "sui", symbol: "SUI", name: "Sui", fallbackPrice: 3.45, fallbackChange: 2.9 },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", fallbackPrice: 18.4, fallbackChange: 1.6 },
  { id: "cardano", symbol: "ADA", name: "Cardano", fallbackPrice: 0.72, fallbackChange: -0.3 },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", fallbackPrice: 0.21, fallbackChange: 0.9 },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", fallbackPrice: 7.1, fallbackChange: -1.1 },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", fallbackPrice: 96.4, fallbackChange: 0.7 },
];

const STORAGE_KEY = "kwidao_market_prices_v2";
const REFRESH_INTERVAL = 60_000;

function formatPrice(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 2 : 0,
    maximumFractionDigits: value < 1 ? 4 : value < 100 ? 2 : 0,
  });
}

function MarketCard({ asset }: { asset: PriceData }) {
  const isPositive = asset.change24h >= 0;

  return (
    <article
      className="group relative z-0 -ml-px flex w-[248px] shrink-0 items-center gap-3 border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface)] px-6 py-5 outline-none first:ml-0 transition-[box-shadow,border-color] duration-300 ease-out hover:z-10 hover:border-transparent hover:shadow-[0_16px_38px_rgba(72,42,92,0.13)] focus-visible:z-10 focus-visible:border-transparent focus-visible:shadow-[0_16px_38px_rgba(72,42,92,0.13)] md:w-[270px]"
      tabIndex={0}
      aria-label={`${asset.name}, ${formatPrice(asset.currentPrice)}, ${isPositive ? "up" : "down"} ${Math.abs(asset.change24h).toFixed(2)} percent in 24 hours`}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[color:var(--theme-border-soft)] bg-white shadow-[0_6px_20px_rgba(64,38,84,0.08)]">
        {asset.image ? (
          <img src={asset.image} alt="" className="h-7 w-7 object-contain" loading="lazy" decoding="async" />
        ) : (
          <span className="text-xs font-bold text-[color:var(--theme-primary)]">{asset.symbol.slice(0, 2)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold text-[color:var(--theme-text-strong)]">{asset.symbol}</h3>
          <span className="truncate text-xs text-[color:var(--theme-text-soft)]">{asset.name}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="font-mono text-[15px] font-semibold tabular-nums text-[color:var(--theme-text-strong)]">{formatPrice(asset.currentPrice)}</span>
          <span className={`font-mono text-xs font-semibold tabular-nums ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? "+" : ""}{asset.change24h.toFixed(2)}%
          </span>
        </div>
      </div>
    </article>
  );
}

function MarketSkeleton() {
  return (
    <div className="flex overflow-hidden" aria-label="Loading live market prices">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex w-[248px] shrink-0 animate-pulse items-center gap-3 px-6 py-5 md:w-[270px]">
          <div className="h-11 w-11 rounded-full bg-[color:var(--theme-border-soft)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-[color:var(--theme-border-soft)]" />
            <div className="h-4 w-28 rounded bg-[color:var(--theme-border-soft)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LiveMarketWidget() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pointerXRef = useRef(0);
  const pointerTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const directionRef = useRef(-1);
  const velocityRef = useRef(-42);

  const formatPriceData = useCallback((data: Record<string, any>, images: Record<string, string> = {}) => (
    ASSETS.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      currentPrice: Number(data[asset.id]?.usd ?? asset.fallbackPrice),
      change24h: Number(data[asset.id]?.usd_24h_change ?? asset.fallbackChange),
      image: images[asset.id],
    }))
  ), []);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(`/api/market-prices?coins=${ASSETS.map(({ id }) => id).join(",")}`);
      if (!response.ok) throw new Error(`Market API returned ${response.status}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Unable to load market prices");

      const formatted = formatPriceData(result.data, result.data.images ?? {});
      setPrices(formatted);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
    } catch {
      const cached = localStorage.getItem(STORAGE_KEY);
      setPrices(cached ? JSON.parse(cached) : formatPriceData({}));
    } finally {
      setIsLoading(false);
    }
  }, [formatPriceData]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void fetchPrices();
    };
    refreshWhenVisible();
    const interval = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [fetchPrices]);

  useEffect(() => {
    if (prices.length === 0) return;

    let animationFrame = 0;
    let previousTime = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = (time: number) => {
      const track = trackRef.current;
      if (track) {
        const setWidth = track.scrollWidth / 2;
        const elapsed = Math.min((time - previousTime) / 1000, 0.05);
        if (!reduceMotion && !isDraggingRef.current) {
          const targetVelocity = isHoveredRef.current
            ? directionRef.current * 14
            : -42;
          const easing = 1 - Math.exp(-elapsed * 3.2);
          velocityRef.current += (targetVelocity - velocityRef.current) * easing;
          offsetRef.current += velocityRef.current * elapsed;
        }
        if (setWidth > 0) {
          while (offsetRef.current <= -setWidth) offsetRef.current += setWidth;
          while (offsetRef.current > 0) offsetRef.current -= setWidth;
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      previousTime = time;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [prices]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    pointerXRef.current = event.clientX;
    pointerTimeRef.current = performance.now();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const delta = event.clientX - pointerXRef.current;
    const elapsed = Math.max((now - pointerTimeRef.current) / 1000, 0.008);
    offsetRef.current += delta;
    velocityRef.current = Math.max(-1600, Math.min(1600, delta / elapsed));
    if (Math.abs(delta) > 0.5) directionRef.current = delta > 0 ? 1 : -1;
    pointerXRef.current = event.clientX;
    pointerTimeRef.current = now;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    isHoveredRef.current = event.currentTarget.matches(":hover") || event.currentTarget.contains(document.activeElement);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (isLoading && prices.length === 0) return <MarketSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="market-ticker-mask group/ticker cursor-grab touch-pan-y select-none overflow-hidden bg-[color:var(--theme-surface)] active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerEnter={() => { isHoveredRef.current = true; }}
      onPointerLeave={() => {
        if (!isDraggingRef.current) {
          isHoveredRef.current = false;
          directionRef.current = -1;
        }
      }}
      onFocusCapture={() => { isHoveredRef.current = true; }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          isHoveredRef.current = false;
          directionRef.current = -1;
        }
      }}
      aria-label="Draggable live market price carousel"
    >
      <div ref={trackRef} className="market-ticker-track flex w-max">
        <div className="flex shrink-0" role="list" aria-label="Live market prices">
          {prices.map((asset) => <MarketCard key={asset.id} asset={asset} />)}
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          {prices.map((asset) => <MarketCard key={`duplicate-${asset.id}`} asset={asset} />)}
        </div>
      </div>
    </motion.div>
  );
}
