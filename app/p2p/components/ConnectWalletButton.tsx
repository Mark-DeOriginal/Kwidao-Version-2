"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EIP1193RequestArgs = { method: string; params?: unknown[] };
type EIP1193Provider = {
  isMetaMask?: boolean;
  providers?: EIP1193Provider[];
  request: (args: EIP1193RequestArgs) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Props = {
  walletAddress?: string;
};

async function loginWallet(walletAddress: string) {
  const response = await fetch("/api/p2p/auth/wallet", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Could not authenticate wallet.");
  }
}

async function logoutWallet() {
  const response = await fetch("/api/p2p/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error("Could not logout.");
  }
}

function getInjectedProviders(): EIP1193Provider[] {
  if (!window.ethereum) return [];
  const walletPool = window.ethereum.providers || [window.ethereum];
  const uniqueProviders = Array.from(new Set(walletPool));
  return uniqueProviders as EIP1193Provider[];
}

function pickProvider(type: "metamask" | "evm"): EIP1193Provider | null {
  const providers = getInjectedProviders();
  if (providers.length === 0) return null;

  if (type === "metamask") {
    return providers.find((provider) => provider.isMetaMask) || null;
  }
  return providers[0];
}

async function ensureAvalancheChain(provider: EIP1193Provider) {
  await provider
    .request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa86a" }],
    })
    .catch(async () => {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xa86a",
            chainName: "Avalanche C-Chain",
            nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
            rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
            blockExplorerUrls: ["https://snowtrace.io/"],
          },
        ],
      });
    });
}

export default function ConnectWalletButton({ walletAddress }: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onConnect = async (walletType: "metamask" | "evm") => {
    setError("");
    setIsBusy(true);
    setShowOptions(false);
    try {
      const provider = pickProvider(walletType);
      if (!provider) {
        if (walletType === "metamask") {
          window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
          throw new Error("MetaMask not detected. Install MetaMask and try again.");
        }
        throw new Error("No EVM wallet detected. Install or unlock your wallet extension.");
      }

      await ensureAvalancheChain(provider);

      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const wallet = accounts?.[0];
      if (!wallet) {
        throw new Error("No wallet account was returned by provider.");
      }

      await loginWallet(wallet);
      router.refresh();
    } catch (connectError) {
      const message =
        connectError instanceof Error ? connectError.message : "Wallet connection failed.";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  const onLogout = async () => {
    setError("");
    setIsBusy(true);
    try {
      await logoutWallet();
      router.refresh();
    } catch (logoutError) {
      const message =
        logoutError instanceof Error ? logoutError.message : "Logout failed.";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative flex flex-col items-end gap-2">
      {walletAddress ? (
        <div className="flex items-center gap-2">
          <span className="p2p-kbd p2p-muted">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
          </span>
          <button
            type="button"
            onClick={onLogout}
            disabled={isBusy}
            className="p2p-btn-secondary"
          >
            {isBusy ? "Please wait..." : "Disconnect"}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowOptions((prev) => !prev)}
            disabled={isBusy}
            className="p2p-btn-primary"
          >
            {isBusy ? "Connecting..." : "Connect Wallet"}
          </button>
          {showOptions && (
            <div className="p2p-panel absolute top-[calc(100%+8px)] right-0 z-30 w-56">
              <div className="p2p-list">
                <button
                  type="button"
                  onClick={() => onConnect("metamask")}
                  className="p2p-btn-secondary w-full text-left"
                >
                  Connect with MetaMask
                </button>
                <button
                  type="button"
                  onClick={() => onConnect("evm")}
                  className="p2p-btn-secondary w-full text-left"
                >
                  Connect other EVM wallet
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {error ? (
        <p className="max-w-[280px] text-right text-xs text-[#c74444]">{error}</p>
      ) : null}
    </div>
  );
}
