"use client";

import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  walletConnectChains,
  walletConnectProjectId,
  walletConnectWagmiConfig,
} from "./wagmiConfig";

type Props = {
  children: React.ReactNode;
};

export default function WalletConnectProvider({ children }: Props) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={walletConnectWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions
          initialChain={walletConnectChains[0]}
          locale="en-US"
          theme={lightTheme({
            accentColor: "var(--wc-brand-primary)",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
          appInfo={{
            appName: "Kwidao USDC Bridge",
            learnMoreUrl: "/usdc-bridge",
          }}
        >
         
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

