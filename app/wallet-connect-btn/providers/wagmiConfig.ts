import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coreWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodWallet } from "./robinhoodWallet";
import { createConfig, http } from "wagmi";
import {
  arbitrum,
  avalanche,
  base,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";
import {
  hyperEvm,
  ink,
  linea,
  monad,
  morph,
  plumeMainnet,
  sei,
  sonic,
  unichain,
  worldchain,
  xdc,
} from "viem/chains";
import type { Chain } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ||
  "MISSING_WALLETCONNECT_PROJECT_ID";

const appName = "Kwidao WalletConnect";
const avalancheRpcUrl = process.env.NEXT_PUBLIC_WALLETCONNECT_EVM_RPC_URL?.trim();
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
const injectiveRpcUrl = process.env.NEXT_PUBLIC_INJECTIVE_RPC_URL?.trim();
const unichainRpcUrl = process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL?.trim();
const lineaRpcUrl = process.env.NEXT_PUBLIC_LINEA_RPC_URL?.trim();
const sonicRpcUrl = process.env.NEXT_PUBLIC_SONIC_RPC_URL?.trim();
const worldchainRpcUrl = process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC_URL?.trim();
const monadRpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL?.trim();
const seiRpcUrl = process.env.NEXT_PUBLIC_SEI_RPC_URL?.trim();
const xdcRpcUrl = process.env.NEXT_PUBLIC_XDC_RPC_URL?.trim();
const hyperEvmRpcUrl = process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL?.trim();
const inkRpcUrl = process.env.NEXT_PUBLIC_INK_RPC_URL?.trim();
const plumeRpcUrl = process.env.NEXT_PUBLIC_PLUME_RPC_URL?.trim();
const morphRpcUrl = process.env.NEXT_PUBLIC_MORPH_RPC_URL?.trim();

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
      wallets: [metaMaskWallet, rabbyWallet, coreWallet, robinhoodWallet, walletConnectWallet],
    },
  ],
  {
    appName,
    projectId,
  },
);

export const walletConnectChains = [
  avalanche,
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  unichain,
  linea,
  sonic,
  worldchain,
  monad,
  sei,
  xdc,
  hyperEvm,
  ink,
  plumeMainnet,
  injective,
  morph,
] as const;

export const walletConnectWagmiConfig = createConfig({
  chains: walletConnectChains,
  connectors,
  transports: {
    [avalanche.id]: http(avalancheRpcUrl),
    [mainnet.id]: http(),
    [base.id]: baseRpcUrl ? http(baseRpcUrl) : http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [unichain.id]: unichainRpcUrl ? http(unichainRpcUrl) : http(),
    [linea.id]: lineaRpcUrl ? http(lineaRpcUrl) : http(),
    [sonic.id]: sonicRpcUrl ? http(sonicRpcUrl) : http(),
    [worldchain.id]: worldchainRpcUrl ? http(worldchainRpcUrl) : http(),
    [monad.id]: monadRpcUrl ? http(monadRpcUrl) : http(),
    [sei.id]: seiRpcUrl ? http(seiRpcUrl) : http(),
    [xdc.id]: xdcRpcUrl ? http(xdcRpcUrl) : http(),
    [hyperEvm.id]: hyperEvmRpcUrl ? http(hyperEvmRpcUrl) : http(),
    [ink.id]: inkRpcUrl ? http(inkRpcUrl) : http(),
    [plumeMainnet.id]: plumeRpcUrl ? http(plumeRpcUrl) : http(),
    [injective.id]: injectiveRpcUrl ? http(injectiveRpcUrl) : http("https://sentry.evm-rpc.injective.network/"),
    [morph.id]: morphRpcUrl ? http(morphRpcUrl) : http(),
  },
  ssr: true,
});

export { projectId as walletConnectProjectId };
