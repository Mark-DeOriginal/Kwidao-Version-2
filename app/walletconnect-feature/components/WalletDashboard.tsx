"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import type { WalletDetailsResponse } from "../types/walletTypes";
import { formatCurrencyUsd, formatDisplayAmount, shortenAddress } from "../services/format";
import styles from "./WalletDashboard.module.css";

async function fetchWalletDetails(address: string, chainId?: number) {
  const query = new URLSearchParams({ address });
  if (chainId) query.set("chainId", String(chainId));

  const response = await fetch(`/api/walletconnect/details?${query.toString()}`, {
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Could not fetch wallet details.");
  }
  return payload as WalletDetailsResponse;
}

export default function WalletDashboard() {
  const connection = useAccount();
  const disconnect = useDisconnect();
  const [details, setDetails] = useState<WalletDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!connection.address || connection.status !== "connected") {
      setDetails(null);
      setError("");
      return () => {
        active = false;
      };
    }

    const run = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchWalletDetails(connection.address, connection.chainId);
        if (active) setDetails(data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load wallet dashboard.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [connection.address, connection.chainId, connection.status]);

  const walletMeta = useMemo(() => {
    if (!connection.address) return null;
    return {
      address: connection.address,
      chain: connection.chain?.name || "Unknown chain",
      chainId: connection.chainId ?? null,
      connector: connection.connector?.name || "Unknown wallet",
    };
  }, [connection.address, connection.chain, connection.chainId, connection.connector]);

  if (connection.status !== "connected" || !walletMeta) {
    return (
      <section className={styles.emptyState}>
        <h2>Wallet Dashboard</h2>
        <p>Connect a wallet from the header to view address, balances, and DeFi-ready account data.</p>
      </section>
    );
  }

  return (
    <section className={styles.dashboard}>
      <div className={styles.heroCard}>
        <div>
          <p className={styles.kicker}>Connected Wallet</p>
          <h2 className={styles.title}>{shortenAddress(walletMeta.address, 10, 6)}</h2>
          <p className={styles.meta}>
            {walletMeta.chain}
          </p>
        </div>
        <button
          type="button"
          className={styles.disconnectButton}
          onClick={() => disconnect.disconnect()}
        >
          Disconnect
        </button>
      </div>

      {isLoading ? <p className={styles.info}>Loading wallet details...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {details ? (
        <>
          <div className={styles.grid}>
            <article className={styles.card}>
              <p className={styles.cardLabel}>Estimated Portfolio Value</p>
              <p className={styles.cardValue}>{formatCurrencyUsd(details.valuation.totalUsd)}</p>
              <p className={styles.cardHint}>
                Priced assets: {details.valuation.pricedAssets} • Unpriced assets:{" "}
                {details.valuation.unpricedAssets}
              </p>
            </article>
            <article className={styles.card}>
              <p className={styles.cardLabel}>Wallet Address</p>
              <p className={styles.cardValueSmall}>{details.wallet.address}</p>
              <p className={styles.cardHint}>Updated {new Date(details.updatedAt).toLocaleString()}</p>
            </article>
            <article className={styles.card}>
              <p className={styles.cardLabel}>Simple DeFi Actions</p>
              <div className={styles.actionRow}>
                <button type="button" className={styles.actionButton}>
                  Swap (stub)
                </button>
                <button type="button" className={styles.actionButton}>
                  Bridge (stub)
                </button>
                <button type="button" className={styles.actionButton}>
                  Stake (stub)
                </button>
              </div>
            </article>
          </div>

          <article className={styles.tableCard}>
            <h3>Asset Balances</h3>
            <div className={styles.table}>
              <div className={styles.tableHead}>Asset</div>
              <div className={styles.tableHead}>Balance</div>
              <div className={styles.tableHead}>Price</div>
              <div className={styles.tableHead}>Value</div>

              {details.assets.map((asset) => (
                <div key={asset.symbol} className={styles.tableRow}>
                  <div>{asset.symbol}</div>
                  <div>{formatDisplayAmount(asset.balance, 8)}</div>
                  <div>
                    {asset.priceUsd !== null ? formatCurrencyUsd(asset.priceUsd) : "Unavailable"}
                  </div>
                  <div>
                    {asset.valueUsd !== null ? formatCurrencyUsd(asset.valueUsd) : "Unavailable"}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
