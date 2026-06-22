"use client";

import { formatUnits, isAddress, pad, parseUnits } from "viem";
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

export type BridgeMode = "fast" | "standard";

export type BridgeChain = {
  chainId: number;
  domain: number;
  name: string;
  shortName: string;
  accent: string;
  icon?: string;
  supportsFastTransfer: boolean;
  explorer: string;
  usdc: `0x${string}`;
  tokenMessenger: `0x${string}`;
  messageTransmitter: `0x${string}`;
};

export type BridgeChainOption = {
  name: string;
  shortName: string;
  accent: string;
  icon?: string;
  status: "active" | "planned";
  chainId?: number;
  domain: number;
};

export const TOKEN_MESSENGER_V2 = "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d";
export const MESSAGE_TRANSMITTER_V2 = "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64";
export const INJECTIVE_EVM_CHAIN_ID = 1776;
export const ZERO_BYTES_32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const BRIDGE_CHAINS: BridgeChain[] = [
  {
    chainId: mainnet.id,
    domain: 0,
    name: "Ethereum",
    shortName: "ETH",
    accent: "#627eea",
    supportsFastTransfer: true,
    explorer: "https://etherscan.io/tx/",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: avalanche.id,
    domain: 1,
    name: "Avalanche",
    shortName: "AVAX",
    accent: "#e84142",
    supportsFastTransfer: false,
    explorer: "https://snowtrace.io/tx/",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: optimism.id,
    domain: 2,
    name: "OP Mainnet",
    shortName: "OP",
    accent: "#ff0420",
    supportsFastTransfer: true,
    explorer: "https://optimistic.etherscan.io/tx/",
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: arbitrum.id,
    domain: 3,
    name: "Arbitrum",
    shortName: "ARB",
    accent: "#28a0f0",
    supportsFastTransfer: true,
    explorer: "https://arbiscan.io/tx/",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: base.id,
    domain: 6,
    name: "Base",
    shortName: "BASE",
    accent: "#0052ff",
    supportsFastTransfer: true,
    explorer: "https://basescan.org/tx/",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: polygon.id,
    domain: 7,
    name: "Polygon",
    shortName: "POLYGON",
    accent: "#8247e5",
    supportsFastTransfer: false,
    explorer: "https://polygonscan.com/tx/",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: unichain.id,
    domain: 10,
    name: "Unichain",
    shortName: "UNI",
    accent: "#fc72ff",
    icon: "/chains/unichain.svg",
    supportsFastTransfer: true,
    explorer: "https://uniscan.xyz/tx/",
    usdc: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: linea.id,
    domain: 11,
    name: "Linea",
    shortName: "LINEA",
    accent: "#61dfff",
    icon: "/chains/linea.svg",
    supportsFastTransfer: true,
    explorer: "https://lineascan.build/tx/",
    usdc: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: sonic.id,
    domain: 13,
    name: "Sonic",
    shortName: "S",
    accent: "#111111",
    icon: "/chains/sonic.svg",
    supportsFastTransfer: false,
    explorer: "https://sonicscan.org/tx/",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: worldchain.id,
    domain: 14,
    name: "World Chain",
    shortName: "WORLD",
    accent: "#000000",
    icon: "/chains/world.svg",
    supportsFastTransfer: true,
    explorer: "https://worldscan.org/tx/",
    usdc: "0x79A02482A880bCe3F13E09da970dC34dB4cD24D1",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: monad.id,
    domain: 15,
    name: "Monad",
    shortName: "MON",
    accent: "#836ef9",
    icon: "/chains/monad.svg",
    supportsFastTransfer: false,
    explorer: "https://monadvision.com/tx/",
    usdc: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: sei.id,
    domain: 16,
    name: "Sei",
    shortName: "SEI",
    accent: "#9b111e",
    icon: "/chains/sei.svg",
    supportsFastTransfer: false,
    explorer: "https://seiscan.io/tx/",
    usdc: "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: xdc.id,
    domain: 18,
    name: "XDC",
    shortName: "XDC",
    accent: "#2a5ada",
    icon: "/chains/xdc.svg",
    supportsFastTransfer: false,
    explorer: "https://xdcscan.com/tx/",
    usdc: "0xfA2958CB79b0491CC627c1557F441eF849Ca8eb1",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: hyperEvm.id,
    domain: 19,
    name: "HyperEVM",
    shortName: "HYPE",
    accent: "#00e6b0",
    icon: "/chains/hyperevm.svg",
    supportsFastTransfer: false,
    explorer: "https://hyperscan.com/tx/",
    usdc: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: ink.id,
    domain: 21,
    name: "Ink",
    shortName: "INK",
    accent: "#7132f5",
    icon: "/chains/ink.svg",
    supportsFastTransfer: true,
    explorer: "https://explorer.inkonchain.com/tx/",
    usdc: "0x2D270e6886d130D724215A266106e6832161EAEd",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: plumeMainnet.id,
    domain: 22,
    name: "Plume",
    shortName: "PLUME",
    accent: "#ff4f9a",
    icon: "/chains/plume.svg",
    supportsFastTransfer: true,
    explorer: "https://explorer.plume.org/tx/",
    usdc: "0x222365EF19F7947e5484218551B56bb3965Aa7aF",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: INJECTIVE_EVM_CHAIN_ID,
    domain: 29,
    name: "Injective",
    shortName: "INJ",
    accent: "#00D9FF",
    supportsFastTransfer: false,
    explorer: "https://blockscout.injective.network/tx/",
    usdc: "0xa00C59fF5a080D2b954d0c75e46E22a0c371235a",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
  {
    chainId: morph.id,
    domain: 30,
    name: "Morph",
    shortName: "MORPH",
    accent: "#00ff7f",
    icon: "/chains/morph.svg",
    supportsFastTransfer: true,
    explorer: "https://explorer.morph.network/tx/",
    usdc: "0xCfb1186F4e93D60E60a8bDd997427D1F33bc372B",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
  },
];

export const BRIDGE_CHAIN_OPTIONS: BridgeChainOption[] = [
  ...BRIDGE_CHAINS.map((chain) => ({
    chainId: chain.chainId,
    domain: chain.domain,
    name: chain.name,
    shortName: chain.shortName,
    accent: chain.accent,
    icon: chain.icon,
    status: "active" as const,
  })),
  {
    domain: 12,
    name: "Codex",
    shortName: "CODEX",
    accent: "#7c3aed",
    icon: "/chains/codex.svg",
    status: "planned",
  },
  {
    domain: 26,
    name: "Arc",
    shortName: "ARC",
    accent: "#0ea5e9",
    icon: "/chains/arc.svg",
    status: "planned",
  },
  {
    domain: 28,
    name: "EDGE",
    shortName: "EDGE",
    accent: "#111827",
    icon: "/chains/edge.svg",
    status: "planned",
  },
  {
    domain: 31,
    name: "Pharos",
    shortName: "PHAROS",
    accent: "#14b8a6",
    icon: "/chains/pharos.svg",
    status: "planned",
  },
  {
    domain: 5,
    name: "Solana",
    shortName: "SOL",
    accent: "#14f195",
    icon: "/chains/solana.svg",
    status: "planned",
  },
  {
    domain: 25,
    name: "Starknet",
    shortName: "STRK",
    accent: "#fc5b3f",
    icon: "/chains/starknet.svg",
    status: "planned",
  },
  {
    domain: 27,
    name: "Stellar",
    shortName: "XLM",
    accent: "#7d8cff",
    icon: "/chains/stellar.svg",
    status: "planned",
  },
];

export const ERC20_ABI = [
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const TOKEN_MESSENGER_V2_ABI = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "depositForBurn",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
    ],
    outputs: [],
  },
] as const;

export const MESSAGE_TRANSMITTER_V2_ABI = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "receiveMessage",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

export function getBridgeChain(chainId: number) {
  return BRIDGE_CHAINS.find((chain) => chain.chainId === chainId) ?? BRIDGE_CHAINS[0];
}

export function isEvmBridgeChain(chain: BridgeChain) {
  return BRIDGE_CHAINS.some((candidate) => candidate.chainId === chain.chainId);
}

export function parseUsdcAmount(value: string) {
  return parseUnits(value.trim(), 6);
}

export function formatUsdc(value: bigint) {
  const formatted = formatUnits(value, 6);
  const [whole, fraction = ""] = formatted.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedFraction = fraction.slice(0, 6).replace(/0+$/, "");
  return trimmedFraction ? `${withCommas}.${trimmedFraction}` : withCommas;
}

export function addressToBytes32(address: string) {
  return pad(address as `0x${string}`, { size: 32 });
}

export function isValidEvmRecipient(address: string) {
  return isAddress(address);
}

export function getFinalityThreshold(mode: BridgeMode) {
  return mode === "fast" ? 1000 : 2000;
}

export function supportsBridgeMode(chain: BridgeChain, mode: BridgeMode) {
  return mode === "standard" || chain.supportsFastTransfer;
}

export function getIrisApiBase() {
  return process.env.NEXT_PUBLIC_CIRCLE_IRIS_API_URL?.trim() || "https://iris-api.circle.com";
}

export function estimateMaxFee(amount: bigint, feeBps: number) {
  if (!Number.isFinite(feeBps) || feeBps <= 0) return BigInt(0);
  const fee = (amount * BigInt(Math.ceil(feeBps * 100))) / BigInt(1_000_000);
  return (fee * BigInt(120)) / BigInt(100) + BigInt(1);
}

export async function fetchRouteFee(sourceDomain: number, destinationDomain: number, mode: BridgeMode) {
  const response = await fetch(
    `${getIrisApiBase()}/v2/burn/USDC/fees/${sourceDomain}/${destinationDomain}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Unable to fetch current Circle bridge fee.");
  }
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : payload?.data;
  const finalityThreshold = getFinalityThreshold(mode);
  const row = rows?.find(
    (candidate: { finalityThreshold?: number }) =>
      candidate.finalityThreshold === finalityThreshold,
  );
  const minimumFee = Number(row?.minimumFee);

  if (!row || !Number.isFinite(minimumFee)) {
    throw new Error("Selected transfer speed is unavailable for this route.");
  }

  return minimumFee;
}

export async function fetchAttestation(sourceDomain: number, burnHash: `0x${string}`) {
  const response = await fetch(
    `${getIrisApiBase()}/v2/messages/${sourceDomain}?transactionHash=${burnHash}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Unable to fetch Circle attestation.");
  }
  const payload = await response.json();
  const message = payload?.messages?.[0] ?? payload?.data?.messages?.[0] ?? payload?.data?.[0];
  if (message?.status === "complete" && message?.message && message?.attestation) {
    return {
      message: message.message as `0x${string}`,
      attestation: message.attestation as `0x${string}`,
    };
  }
  return null;
}
