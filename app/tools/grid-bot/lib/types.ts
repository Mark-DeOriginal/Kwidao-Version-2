export type BotId = "phar" | "aero";

export type GridType = "arith" | "geo" | "fib";

export type ScalpTarget = {
  fillIdx: number;
  fillPrice: number;
  targetPrice: number;
  tokens: number;
  active: boolean;
};

export type BotState = {
  id: BotId;
  sym: string;
  price: number;
  active: boolean;
  trailing: boolean;
  expansion: boolean;
  gridType: GridType;
  nLevels: number;
  low: number;
  high: number;
  orderSize: number;
  budget: number;
  held: number;
  invested: number;
  fills: Set<number>;
  extraLevels: number[];
  change: number;
  atr: number;
  priceHi: number;
  priceLo: number;
  zoneFilter: boolean;
  rsiThreshold: number;
  maFilter: boolean;
  rsi: number;
  ma20: number;
  priceHistory: number[];
  scalping: boolean;
  scalpPct: number;
  scalpQty: number;
  scalpTargets: ScalpTarget[];
  scalpProfit: number;
  dailyLimit: number;
  weeklyLimit: number;
  dailySpent: number;
  weeklySpent: number;
  lastDayReset: string;
  lastWeekReset: string;
  minInterval: number;
  lastFillTime: number;
  rangeDepthIdx: number;
};

export type LogType =
  | "buy"
  | "info"
  | "warn"
  | "trail"
  | "scalp"
  | "sell";

export type LogEntry = {
  type: LogType;
  msg: string;
  t: string;
};

export type PriceSource = "sim" | "live" | "stale";

export type WalletState = {
  connected: boolean;
  address: string | null;
  chainId: string | null;
  balances: Record<string, number>;
};

export type WalletConnectResult =
  | {
      success: true;
      address: string;
      chainId: string;
    }
  | {
      success: false;
      reason: "metamask-missing" | "rejected" | "error";
      title?: string;
      message?: string;
    };

export type TabId = "dashboard" | "backtest" | "strategy" | "portfolio";

export type BacktestConfig = {
  tokenId: BotId;
  period: number;
  gridType: GridType;
  levels: number;
  budget: number;
  trail: boolean;
  expansion: boolean;
};

export type BacktestEquityPoint = {
  day: number;
  val: number;
};

export type BacktestTrade = {
  day: number;
  price: number;
  tokens: number;
  amount: number;
  close: number;
};

export type BacktestResult = {
  title: string;
  badge: {
    label: string;
    background: string;
    color: string;
  };
  retPct: number;
  winRate: number;
  maxDrawdown: number;
  sharpe: number;
  sharpeValid: boolean;
  fills: number;
  avgFillPrice: number;
  tokensAccum: number;
  profitFactor: number;
  profitFactorInfinite: boolean;
  equity: BacktestEquityPoint[];
  trades: BacktestTrade[];
  usedRealData: boolean;
  tokenId: BotId;
};
