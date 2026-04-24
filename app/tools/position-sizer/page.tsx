"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Direction = "long" | "short";

type AssetConfig = {
  id: string;
  symbol: string;
  name: string;
  maxLeverage: number;
  maintenanceMarginRate: number;
};

const ASSETS: AssetConfig[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    maxLeverage: 100,
    maintenanceMarginRate: 0.005,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    maxLeverage: 75,
    maintenanceMarginRate: 0.005,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    maxLeverage: 50,
    maintenanceMarginRate: 0.01,
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    maxLeverage: 25,
    maintenanceMarginRate: 0.01,
  },
  {
    id: "hyperliquid",
    symbol: "HYPE",
    name: "Hyperliquid",
    maxLeverage: 20,
    maintenanceMarginRate: 0.015,
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    maxLeverage: 50,
    maintenanceMarginRate: 0.01,
  },
  {
    id: "zcash",
    symbol: "ZEC",
    name: "Zcash",
    maxLeverage: 20,
    maintenanceMarginRate: 0.015,
  },
  {
    id: "pax-gold",
    symbol: "PAXG",
    name: "Gold (PAXG)",
    maxLeverage: 10,
    maintenanceMarginRate: 0.02,
  },
  {
    id: "kinesis-silver",
    symbol: "KAG",
    name: "Silver (KAG)",
    maxLeverage: 10,
    maintenanceMarginRate: 0.02,
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    maxLeverage: 25,
    maintenanceMarginRate: 0.015,
  },
  {
    id: "arbitrum",
    symbol: "ARB",
    name: "Arbitrum",
    maxLeverage: 20,
    maintenanceMarginRate: 0.02,
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    maxLeverage: 20,
    maintenanceMarginRate: 0.02,
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function PositionSizerPage() {
  const [assetId, setAssetId] = useState<string>("bitcoin");
  const [direction, setDirection] = useState<Direction>("long");
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopPrice, setStopPrice] = useState<number>(0);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(5);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

  const selectedAsset = useMemo(
    () => ASSETS.find((asset) => asset.id === assetId) ?? ASSETS[0],
    [assetId],
  );

  useEffect(() => {
    const coinIds = ASSETS.map((asset) => asset.id).join(",");
    let isMounted = true;

    const fetchPrices = async () => {
      setLoadingPrice(true);
      try {
        const response = await fetch(`/api/market-prices?coins=${coinIds}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!isMounted || !payload?.success || !payload?.data) {
          return;
        }

        const nextPrices: Record<string, number> = {};
        ASSETS.forEach((asset) => {
          const raw = Number(payload.data?.[asset.id]?.usd);
          if (Number.isFinite(raw) && raw > 0) {
            nextPrices[asset.id] = raw;
          }
        });

        setLivePrices(nextPrices);
      } catch {
        // Keep calculator functional with manual pricing.
      } finally {
        if (isMounted) {
          setLoadingPrice(false);
        }
      }
    };

    fetchPrices();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const live = livePrices[assetId];
    if (!live) {
      return;
    }
    setEntryPrice(live);
    const defaultStop = direction === "long" ? live * 0.97 : live * 1.03;
    setStopPrice(defaultStop);
    const defaultTp = direction === "long" ? live * 1.06 : live * 0.94;
    setTakeProfitPrice(defaultTp);
  }, [assetId, direction, livePrices]);

  useEffect(() => {
    setLeverage((current) => clamp(current, 1, selectedAsset.maxLeverage));
  }, [selectedAsset.maxLeverage]);

  const result = useMemo(() => {
    const account = Math.max(accountSize || 0, 0);
    const riskPct = clamp(riskPercent || 0, 0, 100);
    const entry = Math.max(entryPrice || 0, 0);
    const stop = Math.max(stopPrice || 0, 0);
    const takeProfit = Math.max(takeProfitPrice || 0, 0);
    const lev = clamp(leverage || 1, 1, selectedAsset.maxLeverage);
    const mmr = selectedAsset.maintenanceMarginRate;

    const riskAmount = (account * riskPct) / 100;
    const perUnitRisk = direction === "long" ? entry - stop : stop - entry;

    const errors: string[] = [];

    if (entry <= 0) {
      errors.push("Entry price must be greater than 0.");
    }
    if (stop <= 0) {
      errors.push("Stop loss must be greater than 0.");
    }
    if (direction === "long" && stop >= entry) {
      errors.push("For a long trade, stop loss must be below entry price.");
    }
    if (direction === "short" && stop <= entry) {
      errors.push("For a short trade, stop loss must be above entry price.");
    }

    if (entry <= 0 || perUnitRisk <= 0 || riskAmount <= 0) {
      return {
        errors,
        riskAmount,
        positionUnits: 0,
        notionalValue: 0,
        initialMargin: 0,
        maintenanceMargin: 0,
        liquidationPrice: 0,
        stopDistancePercent: 0,
        liquidationDistancePercent: 0,
        expectedLossAtStop: 0,
        expectedPnlAtTakeProfit: 0,
        rewardRiskRatio: 0,
      };
    }

    const positionUnits = riskAmount / perUnitRisk;
    const notionalValue = positionUnits * entry;
    const initialMargin = notionalValue / lev;
    const maintenanceMargin = notionalValue * mmr;

    const liquidationPrice =
      direction === "long"
        ? entry * (1 - 1 / lev + mmr)
        : entry * (1 + 1 / lev - mmr);

    const stopDistancePercent = (perUnitRisk / entry) * 100;
    const liquidationDistancePercent =
      (Math.abs(entry - liquidationPrice) / entry) * 100;

    const expectedLossAtStop = positionUnits * perUnitRisk;

    let expectedPnlAtTakeProfit = 0;
    let rewardRiskRatio = 0;
    if (takeProfit > 0) {
      const pnlPerUnit =
        direction === "long" ? takeProfit - entry : entry - takeProfit;
      expectedPnlAtTakeProfit = positionUnits * pnlPerUnit;
      rewardRiskRatio =
        riskAmount > 0 ? expectedPnlAtTakeProfit / riskAmount : 0;
    }

    return {
      errors,
      riskAmount,
      positionUnits,
      notionalValue,
      initialMargin,
      maintenanceMargin,
      liquidationPrice,
      stopDistancePercent,
      liquidationDistancePercent,
      expectedLossAtStop,
      expectedPnlAtTakeProfit,
      rewardRiskRatio,
    };
  }, [
    accountSize,
    direction,
    entryPrice,
    leverage,
    riskPercent,
    selectedAsset.maintenanceMarginRate,
    selectedAsset.maxLeverage,
    stopPrice,
    takeProfitPrice,
  ]);

  const livePrice = livePrices[assetId] ?? 0;

  const money = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  const num = (value: number, digits = 4) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(
      value,
    );

  const applyLivePrice = () => {
    if (!livePrice) {
      return;
    }
    setEntryPrice(livePrice);
    setStopPrice(direction === "long" ? livePrice * 0.97 : livePrice * 1.03);
    setTakeProfitPrice(
      direction === "long" ? livePrice * 1.06 : livePrice * 0.94,
    );
  };

  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/#"
          className="text-sm text-[var(--theme-primary)] hover:underline inline-block"
        >
          Back to home
        </Link>

        <div className="bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--theme-primary)] mb-2">
                Position Sizer Pro
              </h1>
              <p className="text-[var(--theme-text-muted)]">
                Asset-aware risk sizing with direction logic, leverage, and
                liquidation estimates.
              </p>
            </div>
            <div className="text-sm text-[var(--theme-text-muted)]">
              {loadingPrice
                ? "Fetching market price..."
                : livePrice > 0
                  ? `Live ${selectedAsset.symbol}: ${money(livePrice)}`
                  : "Live price unavailable"}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Asset</span>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              >
                {ASSETS.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Direction</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">
                Leverage (max {selectedAsset.maxLeverage}x)
              </span>
              <div className="space-y-2">
                <input
                  type="range"
                  min={1}
                  max={selectedAsset.maxLeverage}
                  step="1"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full accent-[var(--theme-primary)]"
                />
                <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)]">
                  <span>1x</span>
                  <span className="text-[var(--theme-primary)] font-semibold">{leverage}x</span>
                  <span>{selectedAsset.maxLeverage}x</span>
                </div>
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Account size (USD)</span>
              <input
                type="number"
                min={0}
                value={accountSize}
                onChange={(e) => setAccountSize(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Risk per trade (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Live price helper</span>
              <button
                type="button"
                onClick={applyLivePrice}
                className="w-full rounded-lg border border-[color:var(--theme-border-strong)] bg-[color:var(--theme-primary-soft)] px-3 py-2 text-[var(--theme-primary)] hover:bg-[color:var(--theme-primary-fill)] transition-colors"
              >
                Use current {selectedAsset.symbol} price
              </button>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Entry price</span>
              <input
                type="number"
                min={0}
                step="0.0001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">Stop loss price</span>
              <input
                type="number"
                min={0}
                step="0.0001"
                value={stopPrice}
                onChange={(e) => setStopPrice(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-[var(--theme-primary)]">
                Take profit price (optional)
              </span>
              <input
                type="number"
                min={0}
                step="0.0001"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
                className="w-full rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] px-3 py-2 text-[var(--theme-text-strong)]"
              />
            </label>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-6 rounded-xl border border-red-400/40 bg-red-400/10 p-4 space-y-1">
              {result.errors.map((error) => (
                <p key={error} className="text-sm text-red-200">
                  {error}
                </p>
              ))}
            </div>
          )}

          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="Max Risk"
              value={money(result.riskAmount)}
              valueClass="text-red-400"
            />
            <MetricCard
              label={`Position Size (${selectedAsset.symbol})`}
              value={num(result.positionUnits, 6)}
            />
            <MetricCard
              label="Notional Value"
              value={money(result.notionalValue)}
            />
            <MetricCard
              label="Initial Margin"
              value={money(result.initialMargin)}
            />
            <MetricCard
              label="Maintenance Margin"
              value={money(result.maintenanceMargin)}
            />
            <MetricCard
              label="Liquidation Price"
              value={
                result.liquidationPrice > 0
                  ? money(result.liquidationPrice)
                  : "-"
              }
            />
            <MetricCard
              label="Stop Distance"
              value={`${num(result.stopDistancePercent, 2)}%`}
            />
            <MetricCard
              label="Reward / Risk"
              value={
                Number.isFinite(result.rewardRiskRatio)
                  ? `${num(result.rewardRiskRatio, 2)}R`
                  : "-"
              }
              valueClass={
                result.rewardRiskRatio >= 1
                  ? "text-green-400"
                  : "text-[var(--theme-primary)]"
              }
            />
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--theme-text-soft)]">
                Expected Loss At Stop
              </p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {money(result.expectedLossAtStop)}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--theme-text-soft)]">
                Pnl At Take Profit
              </p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {money(result.expectedPnlAtTakeProfit)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[color:var(--theme-border-subtle)] bg-[var(--theme-surface-contrast)] p-4 text-sm text-[var(--theme-text-muted)]">
            <p className="mb-2 text-[var(--theme-primary)] font-semibold">Risk note</p>
            <p>
              Liquidation uses an isolated-margin estimate with maintenance
              margin rate of {num(selectedAsset.maintenanceMarginRate * 100, 2)}
              %. Actual exchange liquidation rules and fees can differ.
            </p>
            <p className="mt-2">
              Distance to liquidation:{" "}
              <span className="text-[var(--theme-primary)]">
                {num(result.liquidationDistancePercent, 2)}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] p-4">
      <p className="text-xs uppercase tracking-wider text-[color:var(--theme-text-soft)]">
        {label}
      </p>
      <p
        className={`text-2xl font-bold mt-1 ${valueClass ?? "text-[var(--theme-primary)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
