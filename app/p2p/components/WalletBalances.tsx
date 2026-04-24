"use client";

import { useEffect, useState } from "react";

type WalletAsset = {
  symbol: string;
  balance: string;
};

type WalletSnapshot = {
  address: string;
  assets: WalletAsset[];
};

type Props = {
  walletAddress: string;
};

export default function WalletBalances({ walletAddress }: Props) {
  const [data, setData] = useState<WalletSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/p2p/wallet?address=${walletAddress}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not fetch wallet balances.");
        if (active) setData(payload as WalletSnapshot);
      } catch (snapshotError) {
        if (active) {
          setError(
            snapshotError instanceof Error
              ? snapshotError.message
              : "Could not fetch wallet balances.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [walletAddress]);

  if (loading) {
    return <p className="text-sm p2p-muted">Loading wallet balances...</p>;
  }

  if (error) {
    return <p className="text-sm text-[#c74444]">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm p2p-muted">No wallet data available.</p>;
  }

  return (
    <div className="p2p-grid-3">
      {data.assets.map((asset) => (
        <div key={asset.symbol} className="p2p-card-compact">
          <p className="text-xs uppercase tracking-wider p2p-muted">{asset.symbol}</p>
          <p className="mt-1 text-xl font-semibold">{asset.balance}</p>
        </div>
      ))}
    </div>
  );
}
