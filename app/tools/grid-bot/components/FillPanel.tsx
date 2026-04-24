"use client";

import type { BotState, PriceSource } from "../lib/types";
import { fmtPrice, getLevels } from "../lib/utils";

export function FillPanel({
  bot,
  levelIdx,
  isOpen,
  useLive,
  priceSource,
  onToggleUseLive,
  onConfirm,
  onClose,
}: {
  bot: BotState | null;
  levelIdx: number | null;
  isOpen: boolean;
  useLive: boolean;
  priceSource: PriceSource;
  onToggleUseLive: (value: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!bot || levelIdx === null) {
    return (
      <div id="fill-panel" className={isOpen ? "open" : ""}>
        <div className="fp-hdr">
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
            Mark as Filled
          </span>
          <button className="fp-close" onClick={onClose}>
            x
          </button>
        </div>
      </div>
    );
  }

  const lvls = getLevels(bot);
  const lp = lvls[levelIdx];
  const displayPrice =
    useLive && priceSource === "live" ? bot.price : lp ?? bot.price;
  const tokens = bot.orderSize / displayPrice;

  return (
    <div id="fill-panel" className={isOpen ? "open" : ""}>
      <div className="fp-hdr">
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
          Mark as Filled
        </span>
        <button className="fp-close" onClick={onClose}>
          x
        </button>
      </div>
      <div className="fp-row">
        <span className="fp-lbl">Token</span>
        <span className="fp-val">{bot.sym} / USDC</span>
      </div>
      <div className="fp-row">
        <span className="fp-lbl">Grid Level</span>
        <span className="fp-val">
          Level {levelIdx + 1} of {lvls.length}
        </span>
      </div>
      <div className="fp-row">
        <span className="fp-lbl">Buy Price</span>
        <span className="fp-val">
          {fmtPrice(bot, displayPrice)}
          {useLive && priceSource === "live" ? " (live)" : " (grid)"}
        </span>
      </div>
      <div className="fp-row">
        <span className="fp-lbl">Order Size</span>
        <span className="fp-val">${bot.orderSize.toFixed(2)}</span>
      </div>
      <div className="fp-row">
        <span className="fp-lbl">Tokens Received</span>
        <span className="fp-val pos">
          {bot.id === "phar" ? tokens.toFixed(4) : tokens.toFixed(2)} {bot.sym}
        </span>
      </div>
      <div className="fp-row">
        <span className="fp-lbl">Use live price?</span>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={useLive}
            onChange={(e) => onToggleUseLive(e.target.checked)}
            style={{ accentColor: "var(--green)" }}
          />
          Yes, fill at real price
        </label>
      </div>
      <div className="fp-note">
        This marks the level as filled in the tracker. Go to the DEX to place the
        actual buy order.
      </div>
      <div className="fp-actions">
        <button className="fp-confirm" onClick={onConfirm}>
          Confirm Fill
        </button>
        <button className="fp-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
