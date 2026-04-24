"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef } from "react";
import type { BacktestConfig, BacktestResult, BotState } from "../lib/types";
import { fmtPrice } from "../lib/utils";

export function BacktestPanel({
  config,
  setConfig,
  result,
  onRun,
  bots,
}: {
  config: BacktestConfig;
  setConfig: Dispatch<SetStateAction<BacktestConfig>>;
  result: BacktestResult | null;
  onRun: () => void;
  bots: Record<"phar" | "aero", BotState>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const deviceRatio = window.devicePixelRatio || 1;
    canvas.width = Math.max(canvas.offsetWidth, 400) * deviceRatio;
    canvas.height = 160 * deviceRatio;
    canvas.style.height = "160px";

    const W = canvas.width;
    const H = canvas.height;
    const vals = result.equity.map((e) => e.val);
    const vMin = Math.min(...vals) * 0.995;
    const vMax = Math.max(...vals) * 1.005;
    const xScale = (i: number) => (i / result.equity.length) * W;
    const yScale = (v: number) =>
      (1 - (v - vMin) / (vMax - vMin)) * H * 0.9 + H * 0.05;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      ctx.beginPath();
      const y = H * 0.05 + i * ((H * 0.9) / 4);
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,.2)";
    ctx.beginPath();
    const by = yScale(config.budget);
    ctx.moveTo(0, by);
    ctx.lineTo(W, by);
    ctx.stroke();
    ctx.setLineDash([]);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(
      0,
      result.retPct >= 0 ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.25)",
    );
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(result.equity[0].val));
    result.equity.forEach((e, i) => ctx.lineTo(xScale(i), yScale(e.val)));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = result.retPct >= 0 ? "#10b981" : "#ef4444";
    ctx.lineWidth = 2;
    result.equity.forEach((e, i) => {
      if (i === 0) ctx.moveTo(xScale(i), yScale(e.val));
      else ctx.lineTo(xScale(i), yScale(e.val));
    });
    ctx.stroke();

    result.trades.slice(0, 30).forEach((f) => {
      ctx.beginPath();
      ctx.arc(
        xScale(f.day),
        yScale(result.equity[Math.min(f.day, result.equity.length - 1)].val),
        3,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = f.close >= f.price ? "#10b981" : "#ef4444";
      ctx.fill();
    });
  }, [config.budget, result]);

  const tradesToShow = useMemo(() => {
    if (!result) return [];
    return result.trades.slice(0, 15);
  }, [result]);

  const overflowCount = result
    ? Math.max(0, result.trades.length - tradesToShow.length)
    : 0;

  return (
    <div className="tab-view active" id="tv-backtest">
      <div className="bt-layout">
        <div>
          <div className="bt-panel">
            <div className="bt-title">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--theme-accent)"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Backtest Configuration
            </div>
            <div className="fld">
              <div className="fld-l">Token</div>
              <select
                id="bt-token"
                value={config.tokenId}
                onChange={(e) =>
                  setConfig({ ...config, tokenId: e.target.value as "phar" | "aero" })
                }
              >
                <option value="phar">PHAR (Avalanche)</option>
                <option value="aero">AERO (Base)</option>
              </select>
            </div>
            <div className="fld">
              <div className="fld-l">Period</div>
              <select
                id="bt-period"
                value={String(config.period)}
                onChange={(e) =>
                  setConfig({ ...config, period: parseInt(e.target.value, 10) })
                }
              >
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
              </select>
            </div>
            <div className="fld">
              <div className="fld-l">Grid Type</div>
              <select
                id="bt-type"
                value={config.gridType}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    gridType: e.target.value as BacktestConfig["gridType"],
                  })
                }
              >
                <option value="arith">Arithmetic (even spacing)</option>
                <option value="geo">Geometric (wider as price falls)</option>
                <option value="fib">Fibonacci (support levels)</option>
              </select>
            </div>
            <div className="fld">
              <div className="fld-l">Grid Levels</div>
              <input
                id="bt-levels"
                type="number"
                value={config.levels}
                min={4}
                max={20}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    levels: Math.min(20, Math.max(4, Number(e.target.value || 0))),
                  })
                }
              />
            </div>
            <div className="fld">
              <div className="fld-l">Budget ($)</div>
              <input
                id="bt-budget"
                type="number"
                value={config.budget}
                min={100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    budget: Math.max(100, Number(e.target.value || 0)),
                  })
                }
              />
            </div>
            <div className="fld">
              <div className="fld-l">Trailing Up</div>
              <select
                id="bt-trail"
                value={config.trail ? "1" : "0"}
                onChange={(e) => setConfig({ ...config, trail: e.target.value === "1" })}
              >
                <option value="1">Enabled</option>
                <option value="0">Disabled</option>
              </select>
            </div>
            <div className="fld">
              <div className="fld-l">Expansion Down</div>
              <select
                id="bt-exp"
                value={config.expansion ? "1" : "0"}
                onChange={(e) =>
                  setConfig({ ...config, expansion: e.target.value === "1" })
                }
              >
                <option value="1">Enabled</option>
                <option value="0">Disabled</option>
              </select>
            </div>
            <button className="run-btn" onClick={onRun}>
              Run Backtest
            </button>
          </div>
        </div>
        <div>
          <div className="bt-results" id="bt-results">
            <div className="bt-res-hdr">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span
                style={{ fontSize: 13, fontWeight: 600, marginLeft: 4 }}
                id="bt-title"
              >
                {result?.title ?? "Backtest Results"}
              </span>
              <span
                id="bt-badge"
                style={{ marginLeft: 8, fontSize: 10, color: "var(--text3)" }}
              >
                {result ? (
                  <span
                    style={{
                      background: result.badge.background,
                      color: result.badge.color,
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 10,
                    }}
                  >
                    {result.badge.label}
                  </span>
                ) : (
                  "Configure and run a backtest"
                )}
              </span>
            </div>
            <div className="bt-metrics" id="bt-metrics">
              <div className="bm">
                <div className="bm-l">Total Return</div>
                <div
                  className="bm-v"
                  id="bm-ret"
                  dangerouslySetInnerHTML={{
                    __html: result
                      ? result.retPct >= 0
                        ? `<span class="pos">+${result.retPct.toFixed(1)}%</span>`
                        : `<span class="neg">${result.retPct.toFixed(1)}%</span>`
                      : "--",
                  }}
                />
                <div className="bm-s">on deployed capital</div>
              </div>
              <div className="bm">
                <div className="bm-l">Win Rate</div>
                <div
                  className="bm-v"
                  id="bm-wr"
                  dangerouslySetInnerHTML={{
                    __html: result
                      ? `<span class="${
                          result.winRate >= 55
                            ? "pos"
                            : result.winRate >= 45
                              ? "amb"
                              : "neg"
                        }">${result.winRate.toFixed(0)}%</span>`
                      : "--",
                  }}
                />
                <div className="bm-s">profitable fills</div>
              </div>
              <div className="bm">
                <div className="bm-l">Max Drawdown</div>
                <div
                  className="bm-v"
                  id="bm-dd"
                  dangerouslySetInnerHTML={{
                    __html: result
                      ? `<span class="neg">-${result.maxDrawdown.toFixed(1)}%</span>`
                      : "--",
                  }}
                />
                <div className="bm-s">peak-to-trough</div>
              </div>
              <div className="bm">
                <div className="bm-l">Sharpe Ratio</div>
                <div
                  className="bm-v"
                  id="bm-sh"
                  dangerouslySetInnerHTML={{
                    __html: result
                      ? `<span class="${
                          result.sharpe >= 1
                            ? "pos"
                            : result.sharpe >= 0
                              ? "amb"
                              : "neg"
                        }">${result.sharpeValid ? result.sharpe.toFixed(2) : "N/A"}</span>`
                      : "--",
                  }}
                />
                <div className="bm-s">risk-adjusted return</div>
              </div>
              <div className="bm">
                <div className="bm-l">Total Fills</div>
                <div
                  className="bm-v"
                  id="bm-fills"
                  dangerouslySetInnerHTML={{
                    __html: result
                      ? `<span class="pos">${result.fills}</span>`
                      : "--",
                  }}
                />
                <div className="bm-s">grid orders executed</div>
              </div>
              <div className="bm">
                <div className="bm-l">Avg Fill Price</div>
                <div className="bm-v" id="bm-avg">
                  {result && result.avgFillPrice > 0
                    ? fmtPrice(bots[result.tokenId], result.avgFillPrice)
                    : "--"}
                </div>
                <div className="bm-s">vs start price</div>
              </div>
              <div className="bm">
                <div className="bm-l">Tokens Acc.</div>
                <div className="bm-v" id="bm-tok">
                  {result
                    ? result.tokenId === "phar"
                      ? result.tokensAccum.toFixed(3)
                      : result.tokensAccum.toFixed(1)
                    : "--"}
                </div>
                <div className="bm-s">total accumulated</div>
              </div>
              <div className="bm">
                <div className="bm-l">Profit Factor</div>
                <div
                  className="bm-v"
                  id="bm-pf"
                  dangerouslySetInnerHTML={{
                    __html: result
                      ? `<span class="${
                          result.profitFactor >= 1.2
                            ? "pos"
                            : result.profitFactor >= 1
                              ? "amb"
                              : "neg"
                        }">${
                          result.profitFactorInfinite
                            ? "INF"
                            : result.profitFactor.toFixed(2)
                        }</span>`
                      : "--",
                  }}
                />
                <div className="bm-s">gross profit/loss</div>
              </div>
            </div>
            <div className="bt-chart">
              <div className="bt-chart-label">Portfolio Value Over Time</div>
              <canvas id="bt-canvas" ref={canvasRef} height={160}></canvas>
            </div>
            <div className="bt-trades" id="bt-trades-section">
              <div className="bt-trades-label">Recent Fills</div>
              <div className="trade-row trade-hdr">
                <div>Day</div>
                <div>Price</div>
                <div>Type</div>
                <div>Amount</div>
                <div>Tokens</div>
                <div>P&L</div>
              </div>
              <div id="bt-trade-list">
                {!result ? (
                  <div className="bt-empty">Run a backtest to see results</div>
                ) : (
                  <>
                    {tradesToShow.map((trade, idx) => {
                      const pnlPct = ((trade.close - trade.price) / trade.price) * 100;
                      return (
                        <div key={`${trade.day}-${idx}`} className="trade-row">
                          <div style={{ color: "var(--text3)", fontFamily: "var(--mono)" }}>
                            D{trade.day + 1}
                          </div>
                          <div style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                            {fmtPrice(bots[config.tokenId], trade.price)}
                          </div>
                          <div>
                            <span
                              style={{
                                background: "var(--theme-accent-soft)",
                                color: "var(--theme-accent)",
                                padding: "1px 5px",
                                borderRadius: 3,
                                fontSize: 9,
                                fontWeight: 700,
                              }}
                            >
                              BUY
                            </span>
                          </div>
                          <div style={{ fontFamily: "var(--mono)" }}>
                            ${trade.amount.toFixed(0)}
                          </div>
                          <div style={{ fontFamily: "var(--mono)" }}>
                            {config.tokenId === "phar"
                              ? trade.tokens.toFixed(3)
                              : trade.tokens.toFixed(1)}
                          </div>
                          <div
                            style={{ fontFamily: "var(--mono)" }}
                            className={pnlPct >= 0 ? "pos" : "neg"}
                          >
                            {(pnlPct >= 0 ? "+" : "") + pnlPct.toFixed(1) + "%"}
                          </div>
                        </div>
                      );
                    })}
                    {overflowCount > 0 ? (
                      <div style={{ padding: "8px 4px", color: "var(--text3)", fontSize: 11 }}>
                        + {overflowCount} more fills not shown
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
