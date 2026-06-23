"use client";

import { createContext, useContext, useCallback, useState, useMemo, type ReactNode } from "react";
import {
  type ChainType,
} from "./cctpBridge";
import {
  connectSolanaWallet,
  disconnectSolanaWallet,
  hasSolanaWallet,
} from "./solanaBridge";
import {
  connectStarknetWallet,
  disconnectStarknetWallet,
  hasStarknetWallet,
} from "./starknetBridge";
import {
  connectStellarWallet,
  disconnectStellarWallet,
  hasStellarWallet,
} from "./stellarBridge";

export type WalletConnection = {
  address: string | null;
  chainType: ChainType | null;
  isConnected: boolean;
  connecting: boolean;
};

type BridgeContextValue = {
  wallet: WalletConnection;
  connectWallet: (chainType: ChainType) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  hasWalletForChain: (chainType: ChainType) => boolean;
};

const BridgeContext = createContext<BridgeContextValue | null>(null);

export function useBridgeWallet() {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useBridgeWallet must be used within BridgeProvider");
  return ctx;
}

export function BridgeProvider({ children }: { children: ReactNode }) {
  const [nonEvmWallet, setNonEvmWallet] = useState<{
    address: string;
    chainType: ChainType;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);

  const wallet = useMemo<WalletConnection>(() => {
    if (nonEvmWallet) {
      return {
        address: nonEvmWallet.address,
        chainType: nonEvmWallet.chainType,
        isConnected: true,
        connecting: false,
      };
    }
    return { address: null, chainType: null, isConnected: false, connecting };
  }, [nonEvmWallet, connecting]);

  const connectWallet = useCallback(async (chainType: ChainType) => {
    setConnecting(true);
    try {
      if (chainType === "solana") {
        const address = await connectSolanaWallet();
        setNonEvmWallet({ address, chainType: "solana" });
        return;
      }
      if (chainType === "starknet") {
        const address = await connectStarknetWallet();
        setNonEvmWallet({ address, chainType: "starknet" });
        return;
      }
      if (chainType === "stellar") {
        const address = await connectStellarWallet();
        setNonEvmWallet({ address, chainType: "stellar" });
        return;
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    if (nonEvmWallet) {
      if (nonEvmWallet.chainType === "solana") await disconnectSolanaWallet();
      if (nonEvmWallet.chainType === "starknet") await disconnectStarknetWallet();
      if (nonEvmWallet.chainType === "stellar") await disconnectStellarWallet();
      setNonEvmWallet(null);
    }
  }, [nonEvmWallet]);

  const hasWalletForChain = useCallback((chainType: ChainType): boolean => {
    switch (chainType) {
      case "evm": return true;
      case "solana": return hasSolanaWallet();
      case "starknet": return hasStarknetWallet();
      case "stellar": return hasStellarWallet();
    }
  }, []);

  const value = useMemo(() => ({
    wallet,
    connectWallet,
    disconnectWallet,
    hasWalletForChain,
  }), [wallet, connectWallet, disconnectWallet, hasWalletForChain]);

  return (
    <BridgeContext.Provider value={value}>
      {children}
    </BridgeContext.Provider>
  );
}
