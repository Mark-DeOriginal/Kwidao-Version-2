"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type {
  BotId,
  BotState,
  BacktestConfig,
  BacktestResult,
  BacktestTrade,
  LogEntry,
  LogType,
  PriceSource,
  TabId,
  WalletConnectResult,
  WalletState,
} from "../lib/types";
import { initialBots } from "../lib/initial";
import {
  BUDGET_PRESETS,
  computeMA,
  computeRSI,
  DAILY_PRESETS,
  fmtPrice,
  genLevels,
  getLevels,
  getWeekKey,
  INTERVAL_PRESETS,
  NLEVEL_PRESETS,
  RANGE_PRESETS,
  RSI_PRESETS,
  SCALP_PCT_PRESETS,
  SCALP_QTY_PRESETS,
  WEEKLY_PRESETS,
} from "../lib/utils";

const PRICE_CONFIG: Record<BotId, { network: string; address: string }> = {
  phar: {
    network: "avax",
    address: "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b",
  },
  aero: {
    network: "base",
    address: "0x940181a94A35A4569E4529a3CDfB74e38FD98631",
  },
};

const GT_BASE = "https://api.geckoterminal.com/api/v2";
const TOKENS = {
  phar: { avax: "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b" },
  aero: { base: "0x940181a94A35A4569E4529a3CDfB74e38FD98631" },
  usdc: {
    avax: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
};

function cloneBot(bot: BotState): BotState {
  return {
    ...bot,
    fills: new Set(bot.fills),
    extraLevels: [...bot.extraLevels],
    priceHistory: [...bot.priceHistory],
    scalpTargets: bot.scalpTargets.map((t) => ({ ...t })),
  };
}

function cloneBots(prev: Record<BotId, BotState>) {
  return {
    phar: cloneBot(prev.phar),
    aero: cloneBot(prev.aero),
  };
}

function logEntry(type: LogType, msg: string): LogEntry {
  const t = new Date().toTimeString().slice(0, 8);
  return { type, msg, t };
}

function playBeep(freq = 660, dur = 0.2, vol = 0.18) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {
    // ignore audio failures
  }
}

function requestNotifPermission(ref: MutableRefObject<NotificationPermission>) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    Notification.requestPermission().then((p) => {
      ref.current = p;
    });
  } else {
    ref.current = Notification.permission;
  }
}

export function useGridBot() {
  const [bots, setBots] = useState<Record<BotId, BotState>>(() =>
    cloneBots(initialBots),
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [alertsEnabled, setAlertsEnabled] = useState<Record<BotId, boolean>>({
    phar: true,
    aero: true,
  });
  const [priceSource, setPriceSource] = useState<Record<BotId, PriceSource>>({
    phar: "sim",
    aero: "sim",
  });
  const [fillPanel, setFillPanel] = useState<{
    botId: BotId | null;
    levelIdx: number | null;
    useLive: boolean;
  }>({ botId: null, levelIdx: null, useLive: true });
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
    balances: {},
  });
  const [realPriceData, setRealPriceData] = useState<any | null>(null);
  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig>({
    tokenId: "phar",
    period: 90,
    gridType: "arith",
    levels: 10,
    budget: 2000,
    trail: true,
    expansion: true,
  });
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(
    null,
  );

  const botsRef = useRef(bots);
  const alertsRef = useRef(alertsEnabled);
  const priceSourceRef = useRef(priceSource);
  const lastAlertTime = useRef<{ phar: Record<number, number>; aero: Record<number, number> }>(
    { phar: {}, aero: {} },
  );
  const notifPermission = useRef<NotificationPermission>("default");
  const lastFetchTime = useRef<Record<BotId, number>>({ phar: 0, aero: 0 });

  useEffect(() => {
    botsRef.current = bots;
  }, [bots]);
  useEffect(() => {
    alertsRef.current = alertsEnabled;
  }, [alertsEnabled]);
  useEffect(() => {
    priceSourceRef.current = priceSource;
  }, [priceSource]);

  const appendLog = useCallback((type: LogType, msg: string) => {
    setLogs((prev) => {
      const next = [logEntry(type, msg), ...prev];
      return next.slice(0, 60);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const updateBot = useCallback(
    (id: BotId, updater: (bot: BotState) => void) => {
      setBots((prev) => {
        const next = cloneBots(prev);
        updater(next[id]);
        return next;
      });
    },
    [],
  );

  const switchTab = useCallback((tab: TabId) => setActiveTab(tab), []);

  const cycleRSI = useCallback(
    (id: BotId) => {
      const current = botsRef.current[id].rsiThreshold;
      const idx = (RSI_PRESETS.indexOf(current) + 1) % RSI_PRESETS.length;
      const nextValue = RSI_PRESETS[idx];
      updateBot(id, (bot) => {
        bot.rsiThreshold = nextValue;
      });
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> RSI zone threshold -> <strong>${nextValue}</strong>`,
      );
    },
    [appendLog, updateBot],
  );

  const cycleDaily = useCallback(
    (id: BotId) => {
      const current = botsRef.current[id].dailyLimit;
      const idx = (DAILY_PRESETS.indexOf(current) + 1) % DAILY_PRESETS.length;
      const limit = DAILY_PRESETS[idx];
      updateBot(id, (bot) => {
        bot.dailyLimit = limit;
      });
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> daily spend limit -> ${
          limit > 0 ? "$" + limit : "unlimited"
        }`,
      );
    },
    [appendLog, updateBot],
  );

  const cycleWeekly = useCallback(
    (id: BotId) => {
      const current = botsRef.current[id].weeklyLimit;
      const idx = (WEEKLY_PRESETS.indexOf(current) + 1) % WEEKLY_PRESETS.length;
      const limit = WEEKLY_PRESETS[idx];
      updateBot(id, (bot) => {
        bot.weeklyLimit = limit;
      });
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> weekly spend limit -> ${
          limit > 0 ? "$" + limit : "unlimited"
        }`,
      );
    },
    [appendLog, updateBot],
  );

  const cycleScalpPct = useCallback(
    (id: BotId) => {
      const current = botsRef.current[id].scalpPct;
      const idx =
        (SCALP_PCT_PRESETS.indexOf(current) + 1) % SCALP_PCT_PRESETS.length;
      const nextValue = SCALP_PCT_PRESETS[idx];
      updateBot(id, (bot) => {
        bot.scalpPct = nextValue;
        bot.scalpTargets.forEach((t) => {
          if (t.active) t.targetPrice = t.fillPrice * (1 + nextValue / 100);
        });
      });
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> scalp take-profit -> <strong>+${nextValue}%</strong>`,
      );
    },
    [appendLog, updateBot],
  );

  const cycleScalpQty = useCallback(
    (id: BotId) => {
      const current = botsRef.current[id].scalpQty;
      const idx =
        (SCALP_QTY_PRESETS.indexOf(current) + 1) % SCALP_QTY_PRESETS.length;
      const nextValue = SCALP_QTY_PRESETS[idx];
      updateBot(id, (bot) => {
        bot.scalpQty = nextValue;
      });
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> scalp sell qty -> <strong>${nextValue}%</strong> of filled tokens`,
      );
    },
    [appendLog, updateBot],
  );

  const cycleInterval = useCallback(
    (id: BotId) => {
      const current = botsRef.current[id].minInterval;
      const idx =
        (INTERVAL_PRESETS.indexOf(current) + 1) % INTERVAL_PRESETS.length;
      const nextValue = INTERVAL_PRESETS[idx];
      updateBot(id, (bot) => {
        bot.minInterval = nextValue;
      });
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> min fill interval -> ${
          nextValue > 0 ? nextValue + " minutes" : "unlimited"
        }`,
      );
    },
    [appendLog, updateBot],
  );

  const updateBotAlloc = useCallback(
    (id: BotId, updater: (bot: BotState) => void, message: string) => {
      updateBot(id, (bot) => {
        updater(bot);
        bot.orderSize = bot.budget / bot.nLevels;
        bot.fills = new Set();
        bot.extraLevels = [];
        bot.scalpTargets = [];
        bot.scalpProfit = 0;
        bot.dailySpent = 0;
        bot.weeklySpent = 0;
      });
      appendLog("info", message);
    },
    [appendLog, updateBot],
  );

  const cycleBudget = useCallback(
    (id: BotId) => {
      const bot = botsRef.current[id];
      const idx =
        (BUDGET_PRESETS.indexOf(bot.budget) + 1) % BUDGET_PRESETS.length;
      const budget = BUDGET_PRESETS[idx];
      updateBotAlloc(
        id,
        (b) => {
          b.budget = budget;
        },
        `<strong>${bot.sym}</strong> allocation -> <strong>$${budget.toLocaleString()}</strong> / ${bot.nLevels} levels @ $${(budget / bot.nLevels).toFixed(2)}/order`,
      );
    },
    [updateBotAlloc],
  );

  const cycleNLevels = useCallback(
    (id: BotId) => {
      const bot = botsRef.current[id];
      const idx =
        (NLEVEL_PRESETS.indexOf(bot.nLevels) + 1) % NLEVEL_PRESETS.length;
      const nextLevels = NLEVEL_PRESETS[idx];
      updateBotAlloc(
        id,
        (b) => {
          b.nLevels = nextLevels;
        },
        `<strong>${bot.sym}</strong> grid levels -> <strong>${nextLevels}</strong> ($${(bot.budget / nextLevels).toFixed(2)}/order)`,
      );
    },
    [updateBotAlloc],
  );

  const cycleRange = useCallback(
    (id: BotId) => {
      const bot = botsRef.current[id];
      const nextIdx = ((bot.rangeDepthIdx || 2) + 1) % RANGE_PRESETS.length;
      const preset = RANGE_PRESETS[nextIdx];
      const newHigh = bot.price * 0.97;
      const newLow = newHigh * (1 - preset.depth);
      updateBotAlloc(
        id,
        (b) => {
          b.rangeDepthIdx = nextIdx;
          b.high = newHigh;
          b.low = newLow;
        },
        `<strong>${bot.sym}</strong> grid range -> ${fmtPrice(
          bot,
          newLow,
        )} - ${fmtPrice(bot, newHigh)} (${preset.label})`,
      );
    },
    [updateBotAlloc],
  );

  const toggleBot = useCallback(
    (id: BotId) => {
      updateBot(id, (bot) => {
        bot.active = !bot.active;
      });
      const next = botsRef.current[id];
      appendLog(
        next.active ? "info" : "warn",
        `<strong>${next.sym} ${next.active ? "ACTIVATED" : "PAUSED"}</strong>`,
      );
    },
    [appendLog, updateBot],
  );

  const setGridType = useCallback(
    (id: BotId, type: BotState["gridType"]) => {
      updateBot(id, (bot) => {
        bot.gridType = type;
        bot.fills = new Set();
        bot.extraLevels = [];
      });
      const next = botsRef.current[id];
      appendLog(
        "info",
        `<strong>${next.sym}</strong> grid type changed to <strong>${type.toUpperCase()}</strong> - levels recalculated`,
      );
    },
    [appendLog, updateBot],
  );

  const toggleFeature = useCallback(
    (id: BotId, feat: "trailing" | "expansion" | "zone" | "scalp") => {
      updateBot(id, (bot) => {
        const keyMap = {
          trailing: "trailing",
          expansion: "expansion",
          zone: "zoneFilter",
          scalp: "scalping",
        } as const;
        const key = keyMap[feat];
        (bot as any)[key] = !(bot as any)[key];
        if (feat === "scalp" && !bot.scalping) {
          bot.scalpTargets = bot.scalpTargets.filter((t) => !t.active);
        }
      });
      const next = botsRef.current[id];
      const nameMap = {
        trailing: "Trailing Up",
        expansion: "Expansion Down",
        zone: "Zone Filter (RSI+MA)",
        scalp: "Scalping module",
      } as const;
      const enabled = feat === "zone" ? next.zoneFilter : feat === "scalp" ? next.scalping : feat === "trailing" ? next.trailing : next.expansion;
      appendLog(
        "info",
        `<strong>${next.sym}</strong> ${nameMap[feat]} ${enabled ? '<span style="color:#10b981">ENABLED</span>' : '<span style="color:#f59e0b">DISABLED</span>'}`,
      );
    },
    [appendLog, updateBot],
  );

  const toggleAlerts = useCallback(
    (id: BotId) => {
      setAlertsEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
      const enabled = !alertsRef.current[id];
      appendLog(
        "info",
        `<strong>${botsRef.current[id].sym}</strong> proximity alerts ${enabled ? '<span style="color:#10b981">ON</span>' : '<span style="color:#f59e0b">OFF</span>'}`,
      );
      if (enabled) requestNotifPermission(notifPermission);
    },
    [appendLog],
  );

  const copyLevels = useCallback(
    async (id: BotId) => {
      const bot = botsRef.current[id];
      const lvls = getLevels(bot);
      const unfilled = lvls.filter((_, i) => !bot.fills.has(i));
      if (!unfilled.length) {
        appendLog("info", `<strong>${bot.sym}</strong> - all levels already filled!`);
        return;
      }
      const dex =
        id === "phar"
          ? "Pharaoh Exchange (AVAX)"
          : "Aerodrome Finance (Base)";
      const lines = [
        `${bot.sym} Grid Levels - ${dex}`,
        `Budget: $${bot.budget.toLocaleString()} | Levels: ${bot.nLevels} | Order: $${bot.orderSize.toFixed(2)}/level`,
        `Generated: ${new Date().toLocaleString()}`,
        "",
        `UNFILLED LEVELS (${unfilled.length}):`,
        ...lvls
          .map((lp, i) => {
            if (bot.fills.has(i)) return null;
            const toks = bot.orderSize / lp;
            return `  L${i + 1}: ${fmtPrice(bot, lp)} -> buy ${bot.id === "phar" ? toks.toFixed(3) : toks.toFixed(2)} ${bot.sym} ($${bot.orderSize.toFixed(2)})`;
          })
          .filter(Boolean),
        "",
        `DEX: ${id === "phar" ? "https://app.pharaoh.exchange" : "https://aerodrome.finance"}`,
      ];
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        appendLog(
          "info",
          `<strong>${bot.sym}</strong> - ${unfilled.length} grid levels copied to clipboard`,
        );
      } catch {
        appendLog("warn", "Clipboard copy failed - please use HTTPS or localhost");
      }
    },
    [appendLog],
  );

  const openFillPanel = useCallback((botId: BotId, levelIdx: number) => {
    setFillPanel((prev) => ({ ...prev, botId, levelIdx }));
  }, []);

  const closeFillPanel = useCallback(() => {
    setFillPanel({ botId: null, levelIdx: null, useLive: true });
  }, []);

  const confirmManualFill = useCallback(() => {
    const { botId, levelIdx, useLive } = fillPanel;
    if (!botId || levelIdx === null) return;
    const bot = botsRef.current[botId];
    const lvls = getLevels(bot);
    const lp = lvls[levelIdx];
    if (lp === undefined || bot.fills.has(levelIdx)) {
      closeFillPanel();
      return;
    }
    const fillPrice = useLive && priceSourceRef.current[botId] === "live" ? bot.price : lp;
    updateBot(botId, (b) => {
      b.fills.add(levelIdx);
      const toks = b.orderSize / fillPrice;
      b.held += toks;
      b.invested += b.orderSize;
      b.dailySpent += b.orderSize;
      b.weeklySpent += b.orderSize;
      b.lastFillTime = Date.now();
      if (b.scalping) {
        b.scalpTargets.push({
          fillIdx: levelIdx,
          fillPrice,
          targetPrice: fillPrice * (1 + b.scalpPct / 100),
          tokens: (toks * b.scalpQty) / 100,
          active: true,
        });
      }
    });
    const src =
      useLive && priceSourceRef.current[botId] === "live"
        ? '<span style="color:#10b981">[manual @ live]</span>'
        : '<span style="color:#f59e0b">[manual @ grid]</span>';
    appendLog(
      "buy",
      `<strong>MANUAL FILL</strong> ${src} - ${bot.sym} L${levelIdx + 1}: ${botId === "phar" ? (bot.orderSize / fillPrice).toFixed(3) : (bot.orderSize / fillPrice).toFixed(2)} ${bot.sym} @ ${fmtPrice(bot, fillPrice)} ($${bot.orderSize})`,
    );
    playBeep(523, 0.15);
    closeFillPanel();
  }, [appendLog, closeFillPanel, fillPanel, updateBot]);

  const setFillUseLive = useCallback((value: boolean) => {
    setFillPanel((prev) => ({ ...prev, useLive: value }));
  }, []);

  const checkProximityAlerts = useCallback(
    (bot: BotState, log: (type: LogType, msg: string) => void) => {
      if (!alertsRef.current[bot.id]) return;
      const lvls = getLevels(bot);
      const cooldown = 180000;
      lvls.forEach((lp, i) => {
        if (bot.fills.has(i)) return;
        const dist = Math.abs(bot.price - lp) / lp;
        if (dist < 0.02) {
          const now = Date.now();
          const last = lastAlertTime.current[bot.id][i] || 0;
          if (now - last > cooldown) {
            lastAlertTime.current[bot.id][i] = now;
            const pct = (dist * 100).toFixed(1);
            log(
              "warn",
              `<strong>PRICE ALERT</strong> - ${bot.sym} is ${pct}% from Level ${i + 1} (${fmtPrice(bot, lp)}) - <a href="#" data-fill="${bot.id}:${i}" style="color:#f59e0b">ready to mark filled</a>`,
            );
            playBeep(880, 0.25);
            if (notifPermission.current === "granted") {
              try {
                new Notification(`${bot.sym} Grid Alert`, {
                  body: `Price ${pct}% from Level ${i + 1} at ${fmtPrice(bot, lp)}`,
                });
              } catch {
                // ignore
              }
            }
          }
        }
      });
    },
    [],
  );

  useEffect(() => {
    requestNotifPermission(notifPermission);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const prev = botsRef.current;
      const next = cloneBots(prev);
      const newLogs: LogEntry[] = [];
      const log = (type: LogType, msg: string) => {
        newLogs.push(logEntry(type, msg));
      };

      (Object.values(next) as BotState[]).forEach((bot) => {
        const drift =
          (Math.random() - 0.51) *
          bot.price *
          (bot.id === "aero" ? 0.009 : 0.006);
        bot.price = Math.max(bot.price + drift, bot.id === "phar" ? 60 : 0.03);
        bot.change += (Math.random() - 0.5) * 0.3;
        bot.change = Math.max(-25, Math.min(25, bot.change));
        bot.atr += (Math.random() - 0.5) * 0.5;
        bot.atr = Math.max(0.5, Math.min(15, bot.atr));
        if (Math.random() < 0.004) {
          bot.price *= 0.9 + Math.random() * 0.04;
          log(
            "warn",
            `<strong>DIP ALERT</strong> - ${bot.sym} sharp drop, checking ${getLevels(bot).length} grid levels...`,
          );
        }

        // update indicators
        bot.priceHistory.push(bot.price);
        if (bot.priceHistory.length > 60) bot.priceHistory.shift();
        bot.rsi = computeRSI(bot.priceHistory);
        bot.ma20 = computeMA(bot.priceHistory);

        // reset daily/weekly
        const dayKey = new Date().toDateString();
        const weekKey = getWeekKey();
        if (bot.lastDayReset !== dayKey) {
          bot.dailySpent = 0;
          bot.lastDayReset = dayKey;
          log("info", `<strong>${bot.sym}</strong> daily spend limit reset`);
        }
        if (bot.lastWeekReset !== weekKey) {
          bot.weeklySpent = 0;
          bot.lastWeekReset = weekKey;
          log("info", `<strong>${bot.sym}</strong> weekly spend limit reset`);
        }

        // fill checks
        if (bot.active) {
          let zoneOk = true;
          if (bot.zoneFilter) {
            const rsiOk = bot.rsi <= bot.rsiThreshold;
            const maOk = !bot.maFilter || bot.ma20 === 0 || bot.price < bot.ma20;
            zoneOk = rsiOk && maOk;
          }
          const lvls = getLevels(bot);
          lvls.forEach((lp, i) => {
            if (bot.fills.has(i) || bot.price > lp) return;
            if (!zoneOk) return;
            if (bot.dailyLimit > 0 && bot.dailySpent + bot.orderSize > bot.dailyLimit) return;
            if (bot.weeklyLimit > 0 && bot.weeklySpent + bot.orderSize > bot.weeklyLimit) return;
            if (bot.minInterval > 0 && bot.lastFillTime > 0) {
              if (Date.now() - bot.lastFillTime < bot.minInterval * 60000) return;
            }
            bot.fills.add(i);
            const toks = bot.orderSize / lp;
            bot.held += toks;
            bot.invested += bot.orderSize;
            bot.dailySpent += bot.orderSize;
            bot.weeklySpent += bot.orderSize;
            bot.lastFillTime = Date.now();
            if (bot.scalping) {
              bot.scalpTargets.push({
                fillIdx: i,
                fillPrice: lp,
                targetPrice: lp * (1 + bot.scalpPct / 100),
                tokens: (toks * bot.scalpQty) / 100,
                active: true,
              });
            }
            const zoneNote = bot.zoneFilter
              ? ` <span style="color:var(--text3);font-size:9px">[RSI ${bot.rsi.toFixed(0)} ok]</span>`
              : "";
            log(
              "buy",
              `<strong>BUY FILLED</strong> - ${bot.sym} L${i + 1}: ${bot.id === "phar" ? toks.toFixed(3) : toks.toFixed(1)} ${bot.sym} @ ${fmtPrice(bot, lp)} ($${bot.orderSize})${zoneNote}`,
            );
          });

          if (bot.scalping) {
            bot.scalpTargets
              .filter((t) => t.active)
              .forEach((t) => {
                if (bot.price >= t.targetPrice) {
                  t.active = false;
                  const proceeds = t.tokens * bot.price;
                  const cost = t.tokens * t.fillPrice;
                  bot.held = Math.max(0, bot.held - t.tokens);
                  bot.invested = Math.max(0, bot.invested - cost);
                  bot.scalpProfit += proceeds - cost;
                  log(
                    "scalp",
                    `<strong>SCALP SELL</strong> - ${bot.sym}: ${bot.id === "phar" ? t.tokens.toFixed(3) : t.tokens.toFixed(2)} tokens @ ${fmtPrice(bot, bot.price)} -> <span class="pos">+$${(proceeds - cost).toFixed(2)}</span>`,
                  );
                }
              });
          }

          if (bot.trailing && bot.price > bot.high * 1.02) {
            const newHigh = bot.price * 0.98;
            if (!bot.extraLevels.includes(newHigh)) {
              bot.extraLevels.push(newHigh);
              bot.high = newHigh;
              log(
                "trail",
                `<strong>TRAILING UP</strong> - ${bot.sym} grid expanded upward: new level added at ${fmtPrice(bot, newHigh)}`,
              );
            }
          }

          if (bot.expansion && bot.price < bot.low * 0.97) {
            const floor = bot.id === "phar" ? 80 : 0.05;
            const newLow = bot.price * 0.985;
            if (newLow > floor && !bot.extraLevels.includes(newLow)) {
              bot.extraLevels.push(newLow);
              bot.low = newLow;
              log(
                "warn",
                `<strong>EXPAND DOWN</strong> - ${bot.sym} new grid level at ${fmtPrice(bot, newLow)} (price broke below range)`,
              );
            }
          }

          checkProximityAlerts(bot, log);
        }
      });

      botsRef.current = next;
      setBots(next);
      if (newLogs.length) {
        setLogs((prevLogs) => [...newLogs, ...prevLogs].slice(0, 60));
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [checkProximityAlerts]);

  useEffect(() => {
    const fetchLivePrices = async () => {
      for (const [id, cfg] of Object.entries(PRICE_CONFIG) as [BotId, { network: string; address: string }][]) {
        try {
          const url = `${GT_BASE}/simple/networks/${cfg.network}/token_price/${cfg.address}`;
          const r = await fetch(url, { headers: { Accept: "application/json" } });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = await r.json();
          const prices = data?.data?.attributes?.token_prices || {};
          const raw = prices[cfg.address.toLowerCase()] || prices[cfg.address];
          if (raw) {
            const newPrice = parseFloat(raw);
            if (newPrice > 0 && isFinite(newPrice)) {
              setBots((prev) => {
                const next = cloneBots(prev);
                next[id].price = newPrice;
                return next;
              });
              setPriceSource((prev) => ({ ...prev, [id]: "live" }));
              lastFetchTime.current[id] = Date.now();
              // fetch 24h change
              fetch(`${GT_BASE}/networks/${cfg.network}/tokens/${cfg.address}`, {
                headers: { Accept: "application/json" },
              })
                .then((r2) => (r2.ok ? r2.json() : null))
                .then((d2) => {
                  const chg = d2?.data?.attributes?.price_change_percentage?.h24;
                  if (chg != null) {
                    setBots((prev) => {
                      const next = cloneBots(prev);
                      next[id].change = parseFloat(chg);
                      return next;
                    });
                  }
                })
                .catch(() => undefined);
            }
          }
        } catch {
          if (Date.now() - lastFetchTime.current[id] > 120000) {
            setPriceSource((prev) => ({ ...prev, [id]: "stale" }));
            appendLog(
              "warn",
              `<strong>Price feed lost</strong> - ${botsRef.current[id].sym} reverting to simulation`,
            );
          }
        }
      }
    };

    appendLog("info", "<strong>Fetching live prices</strong> from GeckoTerminal...");
    fetchLivePrices();
    const interval = window.setInterval(fetchLivePrices, 30000);
    return () => window.clearInterval(interval);
  }, [appendLog]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await fetch("/api/price-data");
        if (!res.ok) return;
        const data = await res.json();
        setRealPriceData(data);
        const ph = data?.phar?.candles?.length || 0;
        const ae = data?.aero?.candles?.length || 0;
        if (ph > 0 || ae > 0) {
          setBots((prev) => {
            const next = cloneBots(prev);
            if (ph > 0) {
              const last = data.phar.candles[data.phar.candles.length - 1];
              if (last?.close) next.phar.price = Number(last.close);
            }
            if (ae > 0) {
              const last = data.aero.candles[data.aero.candles.length - 1];
              if (last?.close) next.aero.price = Number(last.close);
            }
            return next;
          });
          appendLog(
            "info",
            `<strong>Real price data loaded</strong> - PHAR: ${ph} candles, AERO: ${ae} candles`,
          );
        }
      } catch {
        // ignore
      }
    };
    fetchRealData();
  }, [appendLog]);

  const runBacktest = useCallback(() => {
    const cfg = backtestConfig;
    const bot = botsRef.current[cfg.tokenId];

    const buildResult = (
      candles: { open: number; high: number; low: number; close: number }[],
      usedRealData: boolean,
      startPriceOverride?: number,
    ): BacktestResult => {
      const orderSize = cfg.budget / cfg.levels;
      let currentLow = usedRealData
        ? (startPriceOverride ?? candles[0]?.open ?? bot.price) * 0.7
        : bot.low;
      let currentHigh = usedRealData
        ? (startPriceOverride ?? candles[0]?.open ?? bot.price) * 0.98
        : bot.high;
      let levels = genLevels(cfg.gridType, currentLow, currentHigh, cfg.levels);
      const filledIdx = new Set<number>();
      let held = 0;
      let invested = 0;
      const equity = [{ day: 0, val: cfg.budget }];
      const fills: BacktestTrade[] = [];

      candles.forEach((c, ci) => {
        levels.forEach((lp, i) => {
          if (!filledIdx.has(i) && c.low <= lp && invested < cfg.budget) {
            filledIdx.add(i);
            const toks = orderSize / lp;
            held += toks;
            invested += orderSize;
            fills.push({
              day: ci,
              price: lp,
              tokens: toks,
              amount: orderSize,
              close: c.close,
            });
          }
        });

        if (cfg.trail && c.high > currentHigh * 1.03) {
          const nl = c.high * 0.97;
          if (!levels.includes(nl)) {
            levels.push(nl);
            currentHigh = nl;
          }
        }
        if (cfg.expansion && c.low < currentLow * 0.95) {
          const nl = c.low * 0.985;
          const floor = cfg.tokenId === "phar" ? 60 : 0.03;
          if (nl > floor && !levels.includes(nl)) {
            levels.push(nl);
            currentLow = nl;
          }
        }

        const portVal = cfg.budget - invested + held * c.close;
        equity.push({ day: ci, val: portVal });
      });

      const finalPrice = candles[candles.length - 1]?.close ?? bot.price;
      const finalVal = cfg.budget - invested + held * finalPrice;
      const ret = (finalVal / cfg.budget - 1) * 100;

      let peak = cfg.budget;
      let maxDD = 0;
      equity.forEach((e) => {
        if (e.val > peak) peak = e.val;
        const dd = ((peak - e.val) / peak) * 100;
        if (dd > maxDD) maxDD = dd;
      });

      const winRate =
        fills.length > 0
          ? (fills.filter((f) => f.close >= f.price).length / fills.length) *
            100
          : 0;

      const returns = equity
        .slice(1)
        .map((e, i) => (e.val - equity[i].val) / equity[i].val);
      const avgR = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
      const stdR = Math.sqrt(
        returns.reduce((a, b) => a + (b - avgR) ** 2, 0) /
          (returns.length || 1),
      );
      const sharpe = (avgR / stdR) * Math.sqrt(365);
      const sharpeValid = Number.isFinite(sharpe);

      const avgFillPrice = fills.length
        ? fills.reduce((s, f) => s + f.price, 0) / fills.length
        : 0;
      const grossProfit = fills
        .filter((f) => f.close >= f.price)
        .reduce((s, f) => s + (f.close - f.price) * f.tokens, 0);
      const grossLoss = fills
        .filter((f) => f.close < f.price)
        .reduce((s, f) => s + Math.abs(f.close - f.price) * f.tokens, 0);
      const profitFactor =
        grossLoss > 0 ? grossProfit / grossLoss : fills.length > 0 ? 999 : 0;

      const badge = usedRealData
        ? {
            label: "Using real historical prices",
            background: "rgba(16,185,129,.15)",
            color: "#10b981",
          }
        : {
            label: `${ret >= 0 ? "+" : ""}${ret.toFixed(1)}% return`,
            background:
              ret >= 0 ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
            color: ret >= 0 ? "#10b981" : "#ef4444",
          };

      const title = usedRealData
        ? `${bot.sym} ${candles.length}-Day Backtest (REAL DATA - ${cfg.gridType.toUpperCase()})`
        : `${bot.sym} ${cfg.period}-Day Backtest (${cfg.gridType.toUpperCase()})`;

      return {
        title,
        badge,
        retPct: ret,
        winRate,
        maxDrawdown: maxDD,
        sharpe,
        sharpeValid,
        fills: fills.length,
        avgFillPrice,
        tokensAccum: held,
        profitFactor,
        profitFactorInfinite: profitFactor === 999,
        equity,
        trades: fills,
        usedRealData,
        tokenId: cfg.tokenId,
      };
    };

    if (realPriceData && realPriceData[cfg.tokenId]?.candles?.length > 10) {
      const slice = realPriceData[cfg.tokenId].candles.slice(-cfg.period);
      const candles = slice.map((c: any) => ({
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
      }));
      setBacktestResult(buildResult(candles, true, candles[0]?.open));
      return;
    }

    const candles: { open: number; high: number; low: number; close: number }[] = [];
    let p = bot.price * 1.1;
    for (let i = 0; i < cfg.period; i += 1) {
      const o = p;
      const m = (Math.random() - 0.51) * p * (cfg.tokenId === "aero" ? 0.05 : 0.03);
      const c = Math.max(p + m, p * 0.01);
      const h2 = Math.max(o, c) * (1 + Math.random() * 0.02);
      const l2 = Math.min(o, c) * (1 - Math.random() * 0.02);
      candles.push({ open: o, high: h2, low: l2, close: c });
      p = c;
    }
    setBacktestResult(buildResult(candles, false));
  }, [backtestConfig, realPriceData]);

  const summary = useMemo(() => {
    const totalInvested = bots.phar.invested + bots.aero.invested;
    const pnl =
      bots.phar.held * bots.phar.price -
      bots.phar.invested +
      (bots.aero.held * bots.aero.price - bots.aero.invested);
    const fills = bots.phar.fills.size + bots.aero.fills.size;
    const totalBudget = bots.phar.budget + bots.aero.budget;
    const remaining = totalBudget - totalInvested;
    const totalValue =
      totalBudget -
      totalInvested +
      bots.phar.held * bots.phar.price +
      bots.aero.held * bots.aero.price;
    return {
      totalInvested,
      pnl,
      fills,
      totalBudget,
      remaining,
      totalValue,
    };
  }, [bots]);

  const portfolio = useMemo(() => {
    const totalBudget = bots.phar.budget + bots.aero.budget;
    const invested = bots.phar.invested + bots.aero.invested;
    const totalValue =
      totalBudget - invested +
      bots.phar.held * bots.phar.price +
      bots.aero.held * bots.aero.price;
    return {
      totalValue,
      returnPct: ((totalValue / totalBudget - 1) * 100) || 0,
      pharValue: bots.phar.held * bots.phar.price,
      aeroValue: bots.aero.held * bots.aero.price,
      usdcReservePct: Math.max(0, ((totalBudget - invested) / totalBudget) * 100),
    };
  }, [bots]);

  const connectWallet = useCallback(async (): Promise<WalletConnectResult> => {
    if (typeof (window as any).ethereum === "undefined") {
      return {
        success: false,
        reason: "metamask-missing",
        title: "MetaMask Not Detected",
        message:
          "MetaMask was not detected on this device. Please install the MetaMask app or browser extension, then try connecting your wallet again.",
      };
    }
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      const chainId = await (window as any).ethereum.request({
        method: "eth_chainId",
      });
      setWallet({
        connected: true,
        address: accounts[0],
        chainId,
        balances: {},
      });
      const shortAddress =
        accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
      appendLog(
        "info",
        `<strong>Wallet connected</strong> - ${shortAddress} on ${chainId}`,
      );
      return {
        success: true,
        address: accounts[0],
        chainId,
      };
    } catch (e: any) {
      if (e?.code === 4001) {
        appendLog("warn", "Wallet connection rejected by user");
        return {
          success: false,
          reason: "rejected",
        };
      }
      appendLog("warn", "Wallet connection failed. Please try again.");
      return {
        success: false,
        reason: "error",
        title: "Wallet Connection Failed",
        message:
          "We could not connect to MetaMask right now. Please confirm MetaMask is available on this device and try again.",
      };
    }
  }, [appendLog]);

  const disconnectWallet = useCallback(() => {
    setWallet({ connected: false, address: null, chainId: null, balances: {} });
    appendLog("info", "Wallet disconnected");
  }, [appendLog]);

  const refreshBalances = useCallback(
    async (
      walletSnapshot?: Pick<WalletState, "connected" | "address" | "chainId">,
    ) => {
      const currentWallet = walletSnapshot ?? wallet;
      if (!currentWallet.connected || !currentWallet.address) return;
      const addr = currentWallet.address;
      try {
        const bal = await (window as any).ethereum.request({
          method: "eth_getBalance",
          params: [addr, "latest"],
        });
        const native = parseInt(bal, 16) / 1e18;
        setWallet((prev) => ({
          ...prev,
          balances: { ...prev.balances, native },
        }));
      } catch {
        // ignore
      }

      const balOfSig =
        "0x70a08231" + "000000000000000000000000" + addr.slice(2).toLowerCase();
      const chainNet =
        currentWallet.chainId === "0xa86a"
          ? "avax"
          : currentWallet.chainId === "0x2105"
            ? "base"
            : null;
      if (!chainNet) return;

      const usdcAddr = (TOKENS as any).usdc[chainNet];
      const pharAddr = (TOKENS as any).phar[chainNet];
      const aeroAddr = (TOKENS as any).aero[chainNet];

      if (usdcAddr) {
        try {
          const r = await (window as any).ethereum.request({
            method: "eth_call",
            params: [{ to: usdcAddr, data: balOfSig }, "latest"],
          });
          const raw = parseInt(r, 16) / 1e6;
          setWallet((prev) => ({
            ...prev,
            balances: { ...prev.balances, usdc: raw },
          }));
        } catch {
          // ignore
        }
      }
      if (pharAddr && chainNet === "avax") {
        try {
          const r = await (window as any).ethereum.request({
            method: "eth_call",
            params: [{ to: pharAddr, data: balOfSig }, "latest"],
          });
          const raw = parseInt(r, 16) / 1e18;
          setWallet((prev) => ({
            ...prev,
            balances: { ...prev.balances, phar: raw },
          }));
        } catch {
          // ignore
        }
      }
      if (aeroAddr && chainNet === "base") {
        try {
          const r = await (window as any).ethereum.request({
            method: "eth_call",
            params: [{ to: aeroAddr, data: balOfSig }, "latest"],
          });
          const raw = parseInt(r, 16) / 1e18;
          setWallet((prev) => ({
            ...prev,
            balances: { ...prev.balances, aero: raw },
          }));
        } catch {
          // ignore
        }
      }
    },
    [wallet],
  );

  const switchNetwork = useCallback(async (net: "avax" | "base") => {
    if (!wallet.connected) return;
    const cfg: Record<string, any> = {
      avax: {
        chainId: "0xa86a",
        chainName: "Avalanche C-Chain",
        nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        blockExplorerUrls: ["https://snowtrace.io"],
      },
      base: {
        chainId: "0x2105",
        chainName: "Base",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"],
      },
    };
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: cfg[net].chainId }],
      });
    } catch (e: any) {
      if (e?.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [cfg[net]],
          });
        } catch {
          // ignore
        }
      }
    }
  }, [wallet.connected]);

  const syncWalletBalance = useCallback(
    (id: BotId) => {
      if (!wallet.connected) {
        appendLog("warn", "Connect your wallet first to sync balances");
        return;
      }
      const net = wallet.chainId;
      const isAvax = net === "0xa86a";
      const isBase = net === "0x2105";
      if (id === "phar" && !isAvax) {
        appendLog(
          "warn",
          "Switch to <strong>Avalanche</strong> in your wallet to sync PHAR balance",
        );
        return;
      }
      if (id === "aero" && !isBase) {
        appendLog(
          "warn",
          "Switch to <strong>Base</strong> in your wallet to sync AERO balance",
        );
        return;
      }
      const bal = wallet.balances[id];
      if (bal === undefined || bal === null) {
        appendLog("warn", `${botsRef.current[id].sym} balance not found - try refreshing wallet`);
        return;
      }
      updateBot(id, (bot) => {
        const oldHeld = bot.held;
        bot.held = parseFloat(String(bal));
        if (bot.fills.size > 0 && bot.held > 0) {
          const ratio = bot.held / Math.max(oldHeld, 0.0001);
          bot.invested = Math.max(0, bot.invested * Math.min(ratio, 1));
        }
      });
      appendLog(
        "info",
        `<strong>Wallet sync</strong> - ${botsRef.current[id].sym} holdings updated from wallet`,
      );
      playBeep(440, 0.1);
    },
    [appendLog, updateBot, wallet],
  );

  const shortAddr = useCallback((addr: string | null) => {
    return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "--";
  }, []);

  return {
    bots,
    logs,
    activeTab,
    priceSource,
    alertsEnabled,
    fillPanel,
    wallet,
    realPriceData,
    backtestConfig,
    setBacktestConfig,
    backtestResult,
    runBacktest,
    summary,
    portfolio,
    switchTab,
    cycleRSI,
    cycleDaily,
    cycleWeekly,
    cycleScalpPct,
    cycleScalpQty,
    cycleInterval,
    cycleBudget,
    cycleNLevels,
    cycleRange,
    toggleBot,
    setGridType,
    toggleFeature,
    toggleAlerts,
    copyLevels,
    openFillPanel,
    closeFillPanel,
    confirmManualFill,
    setFillUseLive,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    switchNetwork,
    syncWalletBalance,
    shortAddr,
    clearLogs,
  };
}
