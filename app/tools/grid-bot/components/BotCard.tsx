"use client";

import { useMemo, useState } from "react";
import type { BotState, PriceSource } from "../lib/types";
import { fmtPrice, fmtTokens, getLevels, RANGE_PRESETS } from "../lib/utils";

const BOT_META = {
  phar: {
    name: "PHAR / USDC",
    chainBadge: "AVAX",
    chainName: "Pharaoh Exchange",
    gradient: "linear-gradient(135deg, #e84142, #ff6b6b)",
    badgeBg: "rgba(232, 65, 66, 0.15)",
    badgeColor: "#e84142",
    badgeBorder: "1px solid rgba(232, 65, 66, 0.3)",
    dexLink:
      "https://app.pharaoh.exchange/swap?inputCurrency=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E&outputCurrency=0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b",
  },
  aero: {
    name: "AERO / USDC",
    chainBadge: "BASE",
    chainName: "Aerodrome Finance",
    gradient: "linear-gradient(135deg, #0052ff, #4d8aff)",
    badgeBg: "rgba(0, 82, 255, 0.15)",
    badgeColor: "#4d8aff",
    badgeBorder: "1px solid rgba(0, 82, 255, 0.3)",
    dexLink:
      "https://aerodrome.finance/swap?from=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&to=0x940181a94A35A4569E4529a3CDfB74e38FD98631",
  },
} as const;

const liveLabelMap: Record<PriceSource, string> = {
  live: "LIVE",
  stale: "STALE",
  sim: "SIM",
};

const liveClassMap: Record<PriceSource, string> = {
  live: "live-pill",
  stale: "live-pill stale",
  sim: "live-pill err",
};

export function BotCard({
  bot,
  priceSource,
  alertsEnabled,
  onToggleBot,
  onSetGridType,
  onToggleFeature,
  onCopyLevels,
  onToggleAlerts,
  onCycleDaily,
  onCycleInterval,
  onCycleRSI,
  onCycleScalpPct,
  onCycleScalpQty,
  onCycleBudget,
  onCycleNLevels,
  onCycleRange,
  onCycleWeekly,
  onOpenFill,
}: {
  bot: BotState;
  priceSource: PriceSource;
  alertsEnabled: boolean;
  onToggleBot: (id: BotState["id"]) => void;
  onSetGridType: (id: BotState["id"], type: BotState["gridType"]) => void;
  onToggleFeature: (
    id: BotState["id"],
    feat: "trailing" | "expansion" | "zone" | "scalp",
  ) => void;
  onCopyLevels: (id: BotState["id"]) => void;
  onToggleAlerts: (id: BotState["id"]) => void;
  onCycleDaily: (id: BotState["id"]) => void;
  onCycleInterval: (id: BotState["id"]) => void;
  onCycleRSI: (id: BotState["id"]) => void;
  onCycleScalpPct: (id: BotState["id"]) => void;
  onCycleScalpQty: (id: BotState["id"]) => void;
  onCycleBudget: (id: BotState["id"]) => void;
  onCycleNLevels: (id: BotState["id"]) => void;
  onCycleRange: (id: BotState["id"]) => void;
  onCycleWeekly: (id: BotState["id"]) => void;
  onOpenFill: (id: BotState["id"], idx: number) => void;
}) {
  const meta = BOT_META[bot.id];
  const levels = useMemo(() => getLevels(bot), [bot]);
  const [copied, setCopied] = useState(false);

  const liveLabel = liveLabelMap[priceSource] || "SIM";
  const liveClass = liveClassMap[priceSource] || "live-pill err";
  const changeClass = bot.change >= 0 ? "pos" : "neg";
  const rangeLabel =
    RANGE_PRESETS[bot.rangeDepthIdx]?.label.split(" ")[1] || "custom";

  const dailyLabel =
    bot.dailyLimit > 0
      ? `$${bot.dailySpent.toFixed(0)}/$${bot.dailyLimit}`
      : "No limit";
  const dailyPct = bot.dailyLimit > 0 ? bot.dailySpent / bot.dailyLimit : 0;
  const dailyColor =
    bot.dailyLimit === 0
      ? "var(--text3)"
      : dailyPct >= 1
        ? "var(--red)"
        : dailyPct >= 0.7
          ? "var(--amber)"
          : "var(--green)";

  const rsiOk = bot.rsi <= bot.rsiThreshold;
  const maBelow = bot.ma20 > 0 && bot.price < bot.ma20;
  const scalpProfitColor =
    bot.scalpProfit > 0
      ? "var(--green)"
      : bot.scalpProfit < 0
        ? "var(--red)"
        : "var(--text3)";
  const activeScalpTargets = bot.scalpTargets.filter((t) => t.active).length;

  const range = bot.priceHi - bot.priceLo;
  const toY = (p: number) =>
    Math.max(2, Math.min(96, 100 - ((p - bot.priceLo) / range) * 100));

  const priceY = toY(bot.price);
  const filledYs = levels
    .filter((_, i) => bot.fills.has(i))
    .map((l) => toY(l));
  const fillPercent = filledYs.length ? 100 - Math.max(...filledYs) : 0;

  const handleCopy = async () => {
    await onCopyLevels(bot.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bc" id={`${bot.id}-card`}>
      <div className="bc-hdr">
        <div className="tok-icon" style={{ background: meta.gradient }}>
          {bot.sym[0]}
        </div>
        <div>
          <div className="tok-name">{meta.name}</div>
          <div className="tok-chain">
            <span
              className="cbadge"
              style={{
                background: meta.badgeBg,
                color: meta.badgeColor,
                border: meta.badgeBorder,
              }}
            >
              {meta.chainBadge}
            </span>
            {meta.chainName}
          </div>
        </div>
        <div className="bc-price" id={`${bot.id}-price-box`}>
          <div className="mono" id={`${bot.id}-p`}>
            {fmtPrice(bot, bot.price)}
            <span className={liveClass} id={`${bot.id}-live-pill`}>
              {liveLabel}
            </span>
          </div>
          <div className={`bc-chg ${changeClass}`} id={`${bot.id}-chg`}>
            {(bot.change >= 0 ? "+" : "") + bot.change.toFixed(2)}%
            <span
              id={`${bot.id}-24h`}
              style={{ fontSize: 9, color: "var(--text3)" }}
            >
              24h
            </span>
          </div>
        </div>
        <a
          className="dex-btn"
          id={`${bot.id}-dex-btn`}
          href={meta.dexLink}
          target="_blank"
          title="Open DEX"
          rel="noreferrer"
        >
          Trade
        </a>
        <button
          className={`stbtn ${bot.active ? "stbtn-on" : "stbtn-off"}`}
          id={`${bot.id}-tog`}
          onClick={() => onToggleBot(bot.id)}
        >
          <span
            className="pulse"
            style={{ background: bot.active ? "#10b981" : "#f59e0b" }}
          ></span>
          {bot.active ? "Active" : "Paused"}
        </button>
      </div>

      <div className="bc-ctrl">
        <div className="ctrl-group">
          <span className="ctrl-label">Grid Type</span>
          <div className="seg">
            {(["arith", "geo", "fib"] as const).map((type) => (
              <button
                key={type}
                className={`seg-btn ${bot.gridType === type ? "active" : ""}`}
                onClick={() => onSetGridType(bot.id, type)}
              >
                {type === "arith" ? "Arith" : type === "geo" ? "Geo" : "Fib"}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`tog ${bot.trailing ? "on" : "off"}`}
          id={`${bot.id}-trail-tog`}
          onClick={() => onToggleFeature(bot.id, "trailing")}
        >
          <span className="tog-dot"></span>
          <span className="tog-txt">Trailing Up</span>
        </div>
        <div
          className={`tog ${bot.expansion ? "on" : "off"}`}
          id={`${bot.id}-exp-tog`}
          onClick={() => onToggleFeature(bot.id, "expansion")}
        >
          <span className="tog-dot"></span>
          <span className="tog-txt">Expand Down</span>
        </div>
        <button
          className={`copy-btn ${copied ? "copied" : ""}`}
          id={`${bot.id}-copy-btn`}
          onClick={handleCopy}
          style={{ marginLeft: "auto" }}
          title="Copy all unfilled levels to clipboard"
        >
          {copied ? "Copied!" : "Copy Levels"}
        </button>
        <button
          className="copy-btn"
          onClick={() => onToggleAlerts(bot.id)}
          id={`${bot.id}-alert-btn`}
          title="Toggle proximity alerts"
        >
          {alertsEnabled ? "Alerts: On" : "Alerts: Off"}
        </button>
      </div>

      <div className="bc-ctrl" style={{ background: "rgba(0, 0, 0, 0.15)" }}>
        <div
          className={`tog ${bot.zoneFilter ? "on" : "off"}`}
          id={`${bot.id}-zone-tog`}
          onClick={() => onToggleFeature(bot.id, "zone")}
        >
          <span className="tog-dot"></span>
          <span className="tog-txt">Zone Filter</span>
        </div>
        <div
          className={`tog ${bot.scalping ? "on" : "off"}`}
          id={`${bot.id}-scalp-tog`}
          onClick={() => onToggleFeature(bot.id, "scalp")}
        >
          <span className="tog-dot"></span>
          <span className="tog-txt">Scalping</span>
        </div>
        <div className="ctrl-group" style={{ marginLeft: "auto", gap: 6 }}>
          <span className="ctrl-label">Daily</span>
          <span
            className="cyc fi-val fi-amb"
            id={`${bot.id}-daily-disp`}
            onClick={() => onCycleDaily(bot.id)}
            title="Click to change daily limit"
            style={{ color: dailyColor }}
          >
            {dailyLabel}
          </span>
        </div>
        <div className="ctrl-group" style={{ gap: 6 }}>
          <span className="ctrl-label">Interval</span>
          <span
            className="cyc fi-val"
            id={`${bot.id}-int-disp`}
            onClick={() => onCycleInterval(bot.id)}
            title="Click to change min fill interval"
            style={{ color: "var(--text3)" }}
          >
            {bot.minInterval > 0 ? `${bot.minInterval}min` : "Off"}
          </span>
        </div>
      </div>

      <div
        className="bc-filt"
        id={`${bot.id}-filt-bar`}
        style={{ opacity: bot.zoneFilter ? 1 : 0.4 }}
      >
        <div className="fi">
          <span className="fi-lbl">RSI</span>&nbsp;
          <span
            className={`fi-val cyc ${rsiOk ? "fi-ok" : "fi-blk"}`}
            id={`${bot.id}-rsi-disp`}
            onClick={() => onCycleRSI(bot.id)}
            title="Click to change RSI threshold"
          >
            {bot.rsi.toFixed(1)}
          </span>
          &nbsp;
          <span className="fi-val" id={`${bot.id}-rsi-status`}>
            threshold: {bot.rsiThreshold}
          </span>
        </div>
        <div className="fi-sep"></div>
        <div className="fi">
          <span className="fi-lbl">MA20</span>&nbsp;
          <span
            className={`fi-val ${maBelow ? "fi-ok" : "fi-amb"}`}
            id={`${bot.id}-ma-disp`}
            style={{ color: bot.ma20 > 0 ? undefined : "var(--text3)" }}
          >
            {bot.ma20 > 0 ? fmtPrice(bot, bot.ma20) : "--"}
          </span>
          &nbsp;
          <span
            id={`${bot.id}-ma-status`}
            style={{
              fontSize: 10,
              color:
                bot.zoneFilter && bot.maFilter
                  ? maBelow
                    ? "var(--green)"
                    : "var(--amber)"
                  : "var(--text3)",
            }}
          >
            {bot.zoneFilter && bot.maFilter
              ? maBelow
                ? "below MA"
                : "above MA"
              : "(filter off)"}
          </span>
        </div>
        <div className="fi-sep"></div>
        <div className="fi">
          <span className="fi-lbl">Scalp %</span>&nbsp;
          <span
            className="cyc fi-val"
            id={`${bot.id}-scalp-pct`}
            onClick={() => onCycleScalpPct(bot.id)}
            title="Click to change scalp target %"
            style={{ color: "var(--text2)" }}
          >
            {bot.scalpPct}%
          </span>
          &nbsp;<span className="fi-lbl">qty</span>&nbsp;
          <span
            className="cyc fi-val"
            id={`${bot.id}-scalp-qty`}
            onClick={() => onCycleScalpQty(bot.id)}
            title="Click to change scalp sell qty"
            style={{ color: "var(--text2)" }}
          >
            {bot.scalpQty}%
          </span>
        </div>
        <div className="fi" style={{ marginLeft: "auto" }}>
          <span className="fi-lbl">Scalp P&L</span>&nbsp;
          <span
            className="fi-val"
            id={`${bot.id}-scalp-pnl`}
            style={{ color: scalpProfitColor }}
          >
            {(bot.scalpProfit >= 0 ? "+" : "-") +
              "$" +
              Math.abs(bot.scalpProfit).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bc-viz">
        <div className="viz-row">
          <span>
            Price Map
            <span
              id={`${bot.id}-fc`}
              style={{ color: "var(--green)", marginLeft: 8 }}
            >
              {bot.fills.size}/{levels.length} filled
            </span>
          </span>
          <span
            id={`${bot.id}-range-label`}
            style={{ fontSize: 10, color: "var(--text3)" }}
          >
            {fmtPrice(bot, bot.low)} - {fmtPrice(bot, bot.high)}
          </span>
        </div>
        <div className="viz-area" id={`${bot.id}-viz`}>
          <div
            className="vfa"
            id={`${bot.id}-vfa`}
            style={{
              background: "linear-gradient(to top, #10b981, transparent)",
              height: `${fillPercent}%`,
            }}
          ></div>
          <div className="vpl" id={`${bot.id}-vpl`} style={{ top: `${priceY}%` }}>
            <span className="vpt" id={`${bot.id}-vpt`}>
              {fmtPrice(bot, bot.price)}
            </span>
          </div>
          {levels.map((lp, i) => {
            const y = toY(lp);
            const filled = bot.fills.has(i);
            const isNext = !filled && lp < bot.price;
            return (
              <div key={`${bot.id}-lvl-${i}`} className="vgl" style={{ top: `${y}%` }}>
                <span
                  className="vgl-lbl"
                  style={{
                    color: filled
                      ? "#10b981"
                      : isNext
                        ? "#f59e0b"
                        : "var(--text3)",
                  }}
                >
                  {fmtPrice(bot, lp)}
                </span>
                <div
                  className="vgl-line"
                  style={{
                    background: filled
                      ? "#10b981"
                      : isNext
                        ? "rgba(245,158,11,.4)"
                        : "rgba(255,255,255,.12)",
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bc-lvl">
        <div className="lvl-hdr">
          <div>#</div>
          <div>Buy Price</div>
          <div>Order $</div>
          <div>Tokens</div>
          <div style={{ textAlign: "center" }}>Status</div>
        </div>
        <div id={`${bot.id}-lvls`}>
          {levels.map((lp, i) => {
            const filled = bot.fills.has(i);
            const dist = (((lp - bot.price) / bot.price) * 100).toFixed(1);
            const tokens = bot.orderSize / lp;
            const isExtra = lp < bot.low || lp > bot.high;
            let badge = dist + "%";
            let badgeClass = "sbadge s-pend";
            if (filled) {
              badge = "FILLED";
              badgeClass = "sbadge s-fill";
            } else if (Math.abs(lp - bot.price) / bot.price < 0.015) {
              badge = "NEAR";
              badgeClass = "sbadge s-near";
            } else if (isExtra && lp > bot.high) {
              badge = "TRAIL";
              badgeClass = "sbadge s-trail";
            } else if (isExtra && lp < bot.low) {
              badge = "EXP";
              badgeClass = "sbadge s-trail";
            }
            const clickable = !filled && lp < bot.price * 1.15;
            return (
              <div
                key={`${bot.id}-row-${i}`}
                className={`lvl-row${clickable ? " lvl-row-open" : ""}`}
                onClick={() => clickable && onOpenFill(bot.id, i)}
                title={clickable ? "Click to mark as manually filled" : undefined}
              >
                <div className="ln">{i + 1}</div>
                <div
                  className="lp"
                  style={{
                    color: filled
                      ? "#10b981"
                      : lp < bot.price
                        ? "var(--theme-text-muted)"
                        : "var(--text)",
                  }}
                >
                  {fmtPrice(bot, lp)}
                </div>
                <div className="la">${bot.orderSize.toFixed(0)}</div>
                <div className="lt" style={{ color: filled ? "#10b981" : "var(--text2)" }}>
                  {fmtTokens(bot, tokens)} {bot.sym}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span className={badgeClass}>{badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bc-stats">
        <div className="bst">
          <div className="bst-l">{bot.sym} Held</div>
          <div className={`bst-v ${bot.held >= 0 ? "pos" : "neg"}`} id={`${bot.id}-held`}>
            {bot.id === "phar" ? bot.held.toFixed(3) : bot.held.toFixed(1)}
          </div>
        </div>
        <div className="bst">
          <div className="bst-l">Avg Cost</div>
          <div className="bst-v" id={`${bot.id}-avg`}>
            {bot.held > 0 ? fmtPrice(bot, bot.invested / bot.held) : "--"}
          </div>
        </div>
        <div className="bst">
          <div className="bst-l">Unrealized</div>
          <div className={`bst-v ${bot.held * bot.price - bot.invested >= 0 ? "pos" : "neg"}`} id={`${bot.id}-unr`}>
            {(bot.held * bot.price - bot.invested >= 0 ? "+" : "-") +
              "$" +
              Math.abs(bot.held * bot.price - bot.invested).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bc-set">
        <div className="set-row">
          <div className="si">
            <div className="si-l">Budget</div>
            <div
              className="si-v cyc"
              id={`${bot.id}-budget-disp`}
              onClick={() => onCycleBudget(bot.id)}
              title="Click to change allocation"
            >
              ${bot.budget.toLocaleString()}
            </div>
          </div>
          <div className="si">
            <div className="si-l">Levels</div>
            <div
              className="si-v cyc"
              id={`${bot.id}-nlvl`}
              onClick={() => onCycleNLevels(bot.id)}
              title="Click to change grid levels"
            >
              {bot.nLevels}
            </div>
          </div>
          <div className="si">
            <div className="si-l">Order/Level</div>
            <div className="si-v" id={`${bot.id}-order-size`}>
              ${bot.orderSize.toFixed(2)}
            </div>
          </div>
          <div className="si">
            <div className="si-l">Range</div>
            <div
              className="si-v cyc"
              id={`${bot.id}-range-disp`}
              onClick={() => onCycleRange(bot.id)}
              title="Click to change grid spread"
            >
              {rangeLabel}
            </div>
          </div>
        </div>
        <div className="set-row">
          <div className="si">
            <div className="si-l">Daily Limit</div>
            <div
              className="si-v cyc"
              id={`${bot.id}-dlimit`}
              onClick={() => onCycleDaily(bot.id)}
              title="Click to change"
            >
              {bot.dailyLimit > 0 ? `$${bot.dailyLimit}` : "Off"}
            </div>
          </div>
          <div className="si">
            <div className="si-l">Weekly Limit</div>
            <div
              className="si-v cyc"
              id={`${bot.id}-wlimit`}
              onClick={() => onCycleWeekly(bot.id)}
              title="Click to change"
            >
              {bot.weeklyLimit > 0 ? `$${bot.weeklyLimit}` : "Off"}
            </div>
          </div>
          <div className="si">
            <div className="si-l">Min Interval</div>
            <div
              className="si-v cyc"
              id={`${bot.id}-mint`}
              onClick={() => onCycleInterval(bot.id)}
              title="Click to change"
            >
              {bot.minInterval > 0 ? `${bot.minInterval} min` : "Off"}
            </div>
          </div>
          <div className="si">
            <div className="si-l">Scalp Targets</div>
            <div
              className="si-v"
              id={`${bot.id}-scalp-count`}
              style={{ color: activeScalpTargets > 0 ? "var(--amber)" : "var(--text3)" }}
            >
              {activeScalpTargets} active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
