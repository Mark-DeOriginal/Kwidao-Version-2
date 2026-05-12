import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coreWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arbitrum, avalanche, base, mainnet, optimism, polygon } from "wagmi/chains";
import type { Chain } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ||
  "MISSING_WALLETCONNECT_PROJECT_ID";

const appName = "Kwidao WalletConnect";
const avalancheRpcUrl = process.env.NEXT_PUBLIC_WALLETCONNECT_EVM_RPC_URL?.trim();
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
const injectiveRpcUrl = process.env.NEXT_PUBLIC_INJECTIVE_RPC_URL?.trim();

const injective: Chain = {
  id: 1776,
  name: "Injective EVM",
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [injectiveRpcUrl || "https://sentry.evm-rpc.injective.network/"],
    },
    public: {
      http: [injectiveRpcUrl || "https://sentry.evm-rpc.injective.network/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Injective Blockscout",
      url: "https://blockscout.injective.network",
    },
  },
};

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rabbyWallet, coreWallet, walletConnectWallet],
    },
  ],
  {
    appName,
    projectId,
  },
);

export const walletConnectChains = [avalanche, mainnet, base, arbitrum, optimism, polygon, injective] as const;

export const walletConnectWagmiConfig = createConfig({
  chains: walletConnectChains,
  connectors,
  transports: {
    [avalanche.id]: http(avalancheRpcUrl),
    [mainnet.id]: http(),
    [base.id]: http(baseRpcUrl),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [injective.id]: http(injectiveRpcUrl || "https://sentry.evm-rpc.injective.network/"),
  },
  ssr: true,
});

export { projectId as walletConnectProjectId };
