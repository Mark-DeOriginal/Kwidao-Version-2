"use client";

import type { WalletState } from "../lib/types";

const NETWORKS: Record<string, { name: string; color: string; chainIdDec: number }> = {
  "0xa86a": {
    name: "Avalanche C-Chain",
    color: "#e84142",
    chainIdDec: 43114,
  },
  "0x2105": {
    name: "Base",
    color: "#0052ff",
    chainIdDec: 8453,
  },
  "0x1": {
    name: "Ethereum",
    color: "#627eea",
    chainIdDec: 1,
  },
};

export function WalletPanel({
  wallet,
  isOpen,
  onClose,
  onRefresh,
  onSwitchNetwork,
  onDisconnect,
  onSync,
}: {
  wallet: WalletState;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onSwitchNetwork: (net: "avax" | "base") => void;
  onDisconnect: () => void;
  onSync: (id: "phar" | "aero") => void;
}) {
  const net = wallet.chainId ? NETWORKS[wallet.chainId] : null;

  return (
    <div id="wallet-panel" className={isOpen ? "open" : ""}>
      <div className="wp-hdr">
        <div className="wp-title">Wallet</div>
        <button className="wp-close" onClick={onClose}>
          x
        </button>
      </div>
      <div className="wp-net" id="wp-network">
        <div
          className="wp-net-dot"
          style={{ background: net ? net.color : "var(--theme-text-muted)" }}
        ></div>
        <div
          className="wp-net-name"
          style={{ color: net ? net.color : "var(--text3)" }}
        >
          {net ? net.name : "Not connected"}
        </div>
        {net ? <div className="wp-net-id">#{net.chainIdDec}</div> : null}
      </div>
      <div className="wp-section">
        <div className="wp-sl">Address</div>
        <div className="wp-addr-full" id="wp-addr">
          {wallet.address ?? "--"}
        </div>
      </div>
      <div className="wp-section">
        <div className="wp-sl">Balances</div>
        <div className="wp-bal-grid">
          <div className="wp-bal-item">
            <div className="wp-bal-lbl">ETH/AVAX</div>
            <div className="wp-bal-val" id="wp-native">
              {wallet.balances.native?.toFixed(4) ?? "--"}
            </div>
          </div>
          <div className="wp-bal-item">
            <div className="wp-bal-lbl">USDC</div>
            <div className="wp-bal-val" id="wp-usdc">
              {wallet.balances.usdc != null
                ? `$${wallet.balances.usdc.toFixed(2)}`
                : "--"}
            </div>
          </div>
          <div className="wp-bal-item">
            <div className="wp-bal-lbl">PHAR</div>
            <div className="wp-bal-val pos" id="wp-phar">
              {wallet.balances.phar != null
                ? wallet.balances.phar.toFixed(3)
                : "--"}
            </div>
          </div>
          <div className="wp-bal-item">
            <div className="wp-bal-lbl">AERO</div>
            <div className="wp-bal-val pos" id="wp-aero-bal">
              {wallet.balances.aero != null
                ? wallet.balances.aero.toFixed(2)
                : "--"}
            </div>
          </div>
        </div>
      </div>
      <div className="wp-section">
        <div className="wp-sl">Switch Network</div>
        <div className="chain-sw-row">
          <span style={{ fontSize: 12, color: "var(--text2)" }}>
            Avalanche C-Chain
          </span>
          <button
            className={`chain-sw-btn ${wallet.chainId === "0xa86a" ? "active-chain" : ""}`}
            id="sw-avax"
            onClick={() => onSwitchNetwork("avax")}
          >
            {wallet.chainId === "0xa86a" ? "Active" : "Switch"}
          </button>
        </div>
        <div className="chain-sw-row">
          <span style={{ fontSize: 12, color: "var(--text2)" }}>Base</span>
          <button
            className={`chain-sw-btn ${wallet.chainId === "0x2105" ? "active-chain" : ""}`}
            id="sw-base"
            onClick={() => onSwitchNetwork("base")}
          >
            {wallet.chainId === "0x2105" ? "Active" : "Switch"}
          </button>
        </div>
      </div>
      <div className="wp-action-row">
        <button className="wp-action" onClick={onRefresh}>
          Refresh
        </button>
        <button className="wp-action" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
      <div
        className="wp-action-row"
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: 6,
          paddingTop: 6,
        }}
      >
        <button className="wp-action" onClick={() => onSync("phar")}>Sync PHAR</button>
        <button className="wp-action" onClick={() => onSync("aero")}>Sync AERO</button>
      </div>
      <div className="wp-note">
        This dashboard is read-only. No transactions are sent without your
        explicit MetaMask approval.
      </div>
    </div>
  );
}
