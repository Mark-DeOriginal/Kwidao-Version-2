"use client";

import { formatUnits, isAddress, pad, parseUnits } from "viem";
import { arbitrum, avalanche, base, mainnet, optimism, polygon } from "wagmi/chains";

export type BridgeMode = "fast" | "standard";

export type BridgeChain = {
  chainId: number;
  domain: number;
  name: string;
  shortName: string;
  accent: string;
  explorer: string;
  usdc: `0x${string}`;
  tokenMessenger: `0x${string}`;
  messageTransmitter: `0x${string}`;
};

export const TOKEN_MESSENGER_V2 = "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d";
export const MESSAGE_TRANSMITTER_V2 = "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64";
export const ZERO_BYTES_32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const BRIDGE_CHAINS: BridgeChain[] = [
  {
    chainId: mainnet.id,
    domain: 0,
    name: "Ethereum",
    shortName: "ETH",
    accent: "#627eea",
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
    explorer: "https://polygonscan.com/tx/",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    tokenMessenger: TOKEN_MESSENGER_V2,
    messageTransmitter: MESSAGE_TRANSMITTER_V2,
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
  return Number(row?.minimumFee ?? 0);
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
