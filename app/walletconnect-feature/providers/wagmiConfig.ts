import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coreWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { arbitrum, avalanche, base, mainnet, optimism } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ||
  "MISSING_WALLETCONNECT_PROJECT_ID";

const appName = "Kwidao WalletConnect";
const avalancheRpcUrl = process.env.NEXT_PUBLIC_WALLETCONNECT_EVM_RPC_URL?.trim();
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();

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

export const walletConnectChains = [avalanche, mainnet, base, arbitrum, optimism] as const;

export const walletConnectWagmiConfig = createConfig({
  chains: walletConnectChains,
  connectors,
  transports: {
    [avalanche.id]: http(avalancheRpcUrl),
    [mainnet.id]: http(),
    [base.id]: http(baseRpcUrl),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
  ssr: true,
});

export { projectId as walletConnectProjectId };
