"use client";

import Link from "next/link";
import { useState } from "react";
import { ActivityLog } from "./components/ActivityLog";
import { BacktestPanel } from "./components/BacktestPanel";
import { BotCard } from "./components/BotCard";
import { FillPanel } from "./components/FillPanel";
import { PortfolioPanel } from "./components/PortfolioPanel";
import { StrategyPanel } from "./components/StrategyPanel";
import { WalletNoticeModal } from "./components/WalletNoticeModal";
import { WalletPanel } from "./components/WalletPanel";
import { fmtPrice } from "./lib/utils";
import { useGridBot } from "./hooks/useGridBot";

export function GridBotApp() {
  const {
    bots,
    logs,
    activeTab,
    priceSource,
    alertsEnabled,
    fillPanel,
    wallet,
    summary,
    portfolio,
    realPriceData,
    backtestConfig,
    setBacktestConfig,
    backtestResult,
    runBacktest,
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
  } = useGridBot();

  const [walletOpen, setWalletOpen] = useState(false);
  const [walletNotice, setWalletNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const totalBudget = summary.totalBudget;
  const pnl = summary.pnl;
  const pnlClass = pnl >= 0 ? "pos" : "neg";

  const showLiveBadge =
    realPriceData &&
    ((realPriceData?.phar?.candles?.length || 0) > 0 ||
      (realPriceData?.aero?.candles?.length || 0) > 0);

  const handleWalletClick = async () => {
    if (wallet.connected) {
      setWalletOpen(true);
      return;
    }
    const result = await connectWallet();
    if (result.success) {
      await refreshBalances({
        connected: true,
        address: result.address,
        chainId: result.chainId,
      });
      setWalletOpen(true);
      return;
    }
    if ("title" in result && "message" in result && result.title && result.message) {
      setWalletNotice({
        title: result.title,
        message: result.message,
      });
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "backtest", label: "Backtest" },
    { id: "strategy", label: "Strategy" },
    { id: "portfolio", label: "Portfolio" },
  ] as const;

  return (
    <div className="grid-bot-shell min-h-screen">
      <div id="hdr">
        <div className="hdr-top">
          <div className="hdr-brand">
            <div className="brand">
              <a className="block shrink-0" href="/">
                <img
                  src="/logo.svg"
                  alt="Kwidao Logo"
                  className="h-8 w-auto md:h-9"
                />
              </a>
            </div>
            <div className="hd hidden"></div>
          </div>
          <div className="hdr-actions">
            <Link href="/tools" className="dex-btn">
              Tools Hub
            </Link>
            <button
              id="hdr-wallet-btn"
              className={`wbtn ${wallet.connected ? "wbtn-connected" : "wbtn-connect"}`}
              onClick={handleWalletClick}
            >
              {wallet.connected ? shortAddr(wallet.address) : "Connect Wallet"}
            </button>
          </div>
        </div>
        <div className="hdr-meta">
          <div className="hdr-badges">
            <span
              className="pill"
              style={{
                background: "var(--theme-accent-soft)",
                border: "1px solid var(--theme-border-strong)",
                color: "var(--theme-accent)",
              }}
            >
              <span className="pulse" style={{ background: "var(--theme-accent)" }}></span>2
              Bots Active
            </span>
            <span
              className="pill"
              style={{
                background: "var(--theme-primary-soft)",
                border: "1px solid var(--theme-border)",
                color: "var(--theme-primary)",
              }}
            >
              Accumulation Mode
            </span>
            {showLiveBadge ? (
              <span
                className="pill"
                style={{
                  background: "var(--theme-accent-soft)",
                  border: "1px solid var(--theme-border-strong)",
                  color: "var(--theme-accent)",
                }}
              >
                Live Data
              </span>
            ) : null}
          </div>
          <div className="hdr-stats" style={{ display: "flex", gap: 20 }}>
            <div className="hstat">
              <div className="hstat-l">Budget</div>
              <div className="hstat-v" id="h-budget">
                ${totalBudget.toLocaleString()}
              </div>
            </div>
            <div className="hstat">
              <div className="hstat-l">Deployed</div>
              <div className="hstat-v pos" id="h-dep">
                ${summary.totalInvested.toFixed(2)}
              </div>
            </div>
            <div className="hstat">
              <div className="hstat-l">P&L</div>
              <div className={`hstat-v ${pnlClass}`} id="h-pnl">
                {(pnl >= 0 ? "+" : "-") + "$" + Math.abs(pnl).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => switchTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div id="page">
        {activeTab === "dashboard" ? (
          <div className="tab-view active" id="tv-dashboard">
            <div id="sumrow">
              <div className="scard">
                <div className="scard-l">Total Invested</div>
                <div className="scard-v mono" id="s-inv">
                  ${summary.totalInvested.toFixed(2)}
                </div>
                <div className="scard-s" id="s-inv-s">
                  {summary.fills} orders filled
                </div>
              </div>
              <div className="scard">
                <div className="scard-l">PHAR Held</div>
                <div className="scard-v mono pos" id="s-phar">
                  {bots.phar.held.toFixed(3)}
                </div>
                <div className="scard-s" id="s-phar-s">
                  {bots.phar.held > 0
                    ? `Avg: ${fmtPrice(bots.phar, bots.phar.invested / bots.phar.held)}`
                    : "No fills yet"}
                </div>
              </div>
              <div className="scard">
                <div className="scard-l">AERO Held</div>
                <div className="scard-v mono pos" id="s-aero">
                  {bots.aero.held.toFixed(1)}
                </div>
                <div className="scard-s" id="s-aero-s">
                  {bots.aero.held > 0
                    ? `Avg: ${fmtPrice(bots.aero, bots.aero.invested / bots.aero.held)}`
                    : "No fills yet"}
                </div>
              </div>
              <div className="scard">
                <div className="scard-l">Unrealized P&L</div>
                <div className={`scard-v mono ${pnlClass}`} id="s-pnl">
                  {(pnl >= 0 ? "+" : "-") + "$" + Math.abs(pnl).toFixed(2)}
                </div>
                <div className="scard-s" id="s-pnl-s">
                  on deployed capital
                </div>
              </div>
              <div className="scard">
                <div className="scard-l">Budget Used</div>
                <div className="scard-v mono amb" id="s-rem">
                  ${summary.remaining.toFixed(2)}
                </div>
                <div className="pb-outer" style={{ marginTop: 8 }}>
                  <div
                    className="pb-inner"
                    id="s-prog"
                    style={{
                      width: `${Math.min(
                        (summary.totalInvested / summary.totalBudget) * 100,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="vbanner">
              {[bots.phar, bots.aero].map((bot) => {
                let level = "High";
                let color = "#ef4444";
                let rec = "Wide grids recommended";
                if (bot.atr < 3) {
                  level = "Low";
                  color = "#10b981";
                  rec = "Tight grids recommended";
                } else if (bot.atr < 7) {
                  level = "Moderate";
                  color = "#f59e0b";
                  rec = "Medium spacing recommended";
                }
                return (
                  <div key={bot.id} className="vcell">
                    <div
                      className="volt-icon"
                      style={{
                        background:
                          bot.id === "phar"
                            ? "rgba(232, 65, 66, 0.15)"
                            : "var(--theme-primary-soft)",
                      }}
                      id={`${bot.id}-volt-icon`}
                    >
                      VOL
                    </div>
                    <div className="volt-info">
                      <div className="volt-title">
                        <span
                          style={{
                            color: bot.id === "phar" ? "#e84142" : "var(--theme-accent)",
                            fontWeight: 700,
                          }}
                        >
                          {bot.sym} Volatility
                        </span>
                        <span
                          className="volt-rec"
                          id={`${bot.id}-volt-rec`}
                          style={{
                            background:
                              color === "#10b981"
                                ? "rgba(16,185,129,.15)"
                                : color === "#f59e0b"
                                  ? "rgba(245,158,11,.15)"
                                  : "rgba(239,68,68,.15)",
                            color,
                          }}
                        >
                          {level}
                        </span>
                      </div>
                      <div className="volt-bar-outer">
                        <div
                          className="volt-bar-inner"
                          id={`${bot.id}-volt-bar`}
                          style={{
                            width: `${Math.min((bot.atr / 12) * 100, 100)}%`,
                            background: color,
                          }}
                        ></div>
                      </div>
                      <div className="volt-label">
                        <span id={`${bot.id}-volt-pct`}>
                          ATR: {bot.atr.toFixed(1)}%
                        </span>
                        <span id={`${bot.id}-volt-rec2`}>{rec}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div id="botgrid">
              <BotCard
                bot={bots.phar}
                priceSource={priceSource.phar}
                alertsEnabled={alertsEnabled.phar}
                onToggleBot={toggleBot}
                onSetGridType={setGridType}
                onToggleFeature={toggleFeature}
                onCopyLevels={copyLevels}
                onToggleAlerts={toggleAlerts}
                onCycleDaily={cycleDaily}
                onCycleInterval={cycleInterval}
                onCycleRSI={cycleRSI}
                onCycleScalpPct={cycleScalpPct}
                onCycleScalpQty={cycleScalpQty}
                onCycleBudget={cycleBudget}
                onCycleNLevels={cycleNLevels}
                onCycleRange={cycleRange}
                onCycleWeekly={cycleWeekly}
                onOpenFill={openFillPanel}
              />
              <BotCard
                bot={bots.aero}
                priceSource={priceSource.aero}
                alertsEnabled={alertsEnabled.aero}
                onToggleBot={toggleBot}
                onSetGridType={setGridType}
                onToggleFeature={toggleFeature}
                onCopyLevels={copyLevels}
                onToggleAlerts={toggleAlerts}
                onCycleDaily={cycleDaily}
                onCycleInterval={cycleInterval}
                onCycleRSI={cycleRSI}
                onCycleScalpPct={cycleScalpPct}
                onCycleScalpQty={cycleScalpQty}
                onCycleBudget={cycleBudget}
                onCycleNLevels={cycleNLevels}
                onCycleRange={cycleRange}
                onCycleWeekly={cycleWeekly}
                onOpenFill={openFillPanel}
              />
            </div>

            <ActivityLog
              logs={logs}
              onClear={clearLogs}
              onOpenFill={openFillPanel}
            />
          </div>
        ) : null}

        {activeTab === "backtest" ? (
          <BacktestPanel
            config={backtestConfig}
            setConfig={setBacktestConfig}
            result={backtestResult}
            onRun={runBacktest}
            bots={bots}
          />
        ) : null}

        {activeTab === "strategy" ? <StrategyPanel /> : null}

        {activeTab === "portfolio" ? (
          <PortfolioPanel
            bots={bots}
            totalBudget={summary.totalBudget}
            totalInvested={summary.totalInvested}
            totalValue={portfolio.totalValue}
            returnPct={portfolio.returnPct}
          />
        ) : null}
      </div>

      <FillPanel
        bot={fillPanel.botId ? bots[fillPanel.botId] : null}
        levelIdx={fillPanel.levelIdx}
        isOpen={!!fillPanel.botId}
        useLive={fillPanel.useLive}
        priceSource={fillPanel.botId ? priceSource[fillPanel.botId] : "sim"}
        onToggleUseLive={setFillUseLive}
        onConfirm={confirmManualFill}
        onClose={closeFillPanel}
      />

      <WalletPanel
        wallet={wallet}
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        onRefresh={refreshBalances}
        onSwitchNetwork={switchNetwork}
        onDisconnect={() => {
          disconnectWallet();
          setWalletOpen(false);
        }}
        onSync={syncWalletBalance}
      />

      <WalletNoticeModal
        isOpen={!!walletNotice}
        title={walletNotice?.title ?? ""}
        message={walletNotice?.message ?? ""}
        onClose={() => setWalletNotice(null)}
      />
    </div>
  );
}
