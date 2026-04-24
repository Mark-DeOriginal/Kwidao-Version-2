import type { BotState, GridType } from "./types";

export const RSI_PRESETS = [30, 35, 40, 45, 50, 55, 60, 70];
export const DAILY_PRESETS = [0, 200, 300, 500, 750, 1000, 1500];
export const WEEKLY_PRESETS = [0, 500, 750, 1000, 1500, 2000, 3000];
export const SCALP_PCT_PRESETS = [1.5, 2, 3, 5, 7, 10, 15];
export const SCALP_QTY_PRESETS = [25, 33, 50, 75, 100];
export const INTERVAL_PRESETS = [0, 3, 5, 10, 15, 30, 60, 120];

export const BUDGET_PRESETS = [
  500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000,
];
export const NLEVEL_PRESETS = [4, 5, 6, 7, 8, 10, 12, 15, 20];
export const RANGE_PRESETS = [
  { label: "Tight -15%", depth: 0.15 },
  { label: "Medium -20%", depth: 0.2 },
  { label: "Standard -30%", depth: 0.3 },
  { label: "Wide -40%", depth: 0.4 },
  { label: "Deep -55%", depth: 0.55 },
  { label: "X-Deep -70%", depth: 0.7 },
];

export function genArith(low: number, high: number, n: number) {
  const step = (high - low) / (n - 1);
  return Array.from({ length: n }, (_, i) => high - i * step);
}

export function genGeo(low: number, high: number, n: number) {
  const r = Math.pow(low / high, 1 / (n - 1));
  return Array.from({ length: n }, (_, i) => high * Math.pow(r, i));
}

export function genFib(low: number, high: number, n: number) {
  const fibs = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618];
  const range = high - low;
  return fibs
    .slice(0, n)
    .map((f) => high - f * range)
    .sort((a, b) => b - a);
}

export function genLevels(type: GridType, low: number, high: number, n: number) {
  if (type === "geo") return genGeo(low, high, n);
  if (type === "fib") return genFib(low, high, n);
  return genArith(low, high, n);
}

export function getLevels(bot: BotState) {
  const base = genLevels(bot.gridType, bot.low, bot.high, bot.nLevels);
  return [...base, ...bot.extraLevels].sort((a, b) => b - a);
}

export function getWeekKey(d = new Date()) {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return s.toDateString();
}

export function computeRSI(prices: number[], period = 14) {
  if (prices.length < period + 1) return 50;
  const slice = prices.slice(-(period + 1));
  const changes = slice.slice(1).map((p, i) => p - slice[i]);
  const ag =
    changes.map((c) => (c > 0 ? c : 0)).reduce((a, b) => a + b, 0) / period;
  const al =
    changes.map((c) => (c < 0 ? -c : 0)).reduce((a, b) => a + b, 0) / period;
  if (al === 0) return 100;
  return 100 - 100 / (1 + ag / al);
}

export function computeMA(prices: number[], period = 20) {
  if (!prices.length) return 0;
  const sl = prices.slice(-Math.min(period, prices.length));
  return sl.reduce((a, b) => a + b, 0) / sl.length;
}

export function fmtPrice(bot: BotState, value: number) {
  const decimals = bot.id === "phar" ? 2 : 4;
  return "$" + value.toFixed(decimals);
}

export function fmtTokens(bot: BotState, value: number) {
  const decimals = bot.id === "phar" ? 3 : 1;
  return value.toFixed(decimals);
}
