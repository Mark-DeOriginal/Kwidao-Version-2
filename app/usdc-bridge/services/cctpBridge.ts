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

export type ChainType = "evm" | "solana" | "starknet" | "stellar";

export type BridgeChain = {
  chainId: number;
  domain: number;
  name: string;
  shortName: string;
  accent: string;
  icon?: string;
  supportsFastTransfer: boolean;
  explorer: string;
  type: ChainType;
  decimals: number;
  usdc: string;
  tokenMessenger: string;
  messageTransmitter: string;
};

export type BridgeChainOption = {
  name: string;
  shortName: string;
  accent: string;
  icon?: string;
  status: "active" | "planned";
  chainId?: number;
  domain: number;
  type: ChainType;
};

function evmChain(
  id: number,
  domain: number,
  name: string,
  shortName: string,
  accent: string,
  icon: string | undefined,
  fast: boolean,
  explorer: string,
  usdc: `0x${string}`,
  tokenMessenger: `0x${string}`,
  messageTransmitter: `0x${string}`,
): BridgeChain {
  return { chainId: id, domain, name, shortName, accent, icon, supportsFastTransfer: fast, explorer, type: "evm", decimals: 6, usdc, tokenMessenger, messageTransmitter };
}

function solanaChain(
  chainId: number,
  domain: number,
  name: string,
  shortName: string,
  accent: string,
  icon: string | undefined,
  fast: boolean,
  explorer: string,
  usdcMint: string,
  programId: string,
  messageTransmitterProgramId: string,
): BridgeChain {
  return { chainId, domain, name, shortName, accent, icon, supportsFastTransfer: fast, explorer, type: "solana", decimals: 6, usdc: usdcMint, tokenMessenger: programId, messageTransmitter: messageTransmitterProgramId };
}

function starknetChain(
  chainId: number,
  domain: number,
  name: string,
  shortName: string,
  accent: string,
  icon: string | undefined,
  fast: boolean,
  explorer: string,
  usdc: string,
  tokenMessenger: string,
  messageTransmitter: string,
): BridgeChain {
  return { chainId, domain, name, shortName, accent, icon, supportsFastTransfer: fast, explorer, type: "starknet", decimals: 6, usdc, tokenMessenger, messageTransmitter };
}

function stellarChain(
  chainId: number,
  domain: number,
  name: string,
  shortName: string,
  accent: string,
  icon: string | undefined,
  fast: boolean,
  explorer: string,
  usdc: string,
  tokenMessenger: string,
  messageTransmitter: string,
): BridgeChain {
  return { chainId, domain, name, shortName, accent, icon, supportsFastTransfer: fast, explorer, type: "stellar", decimals: 7, usdc, tokenMessenger, messageTransmitter };
}

export const TOKEN_MESSENGER_V2 = "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d";
export const MESSAGE_TRANSMITTER_V2 = "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64";
export const INJECTIVE_EVM_CHAIN_ID = 1776;
export const ZERO_BYTES_32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const SOLANA_CCTP_PROGRAM_ID = "CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe";
export const SOLANA_MESSAGE_TRANSMITTER_PROGRAM_ID =
  "CCTPV2Sm4AdWt5296sk4P66VBZ7bEhcARwFaaS9YPbeC";
export const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

export const STARKNET_TOKEN_MESSENGER = "0x07d421B9cA8aA32DF259965cDA8ACb93F7599F69209A41872AE84638B2A20F2a";
export const STARKNET_MESSAGE_TRANSMITTER = "0x02EBB5777B6dD8B26ea11D68Fdf1D2c85cD2099335328Be845a28c77A8AEf183";
export const STARKNET_USDC = "0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb";
export const STARKNET_RPC_URL = "https://starknet-mainnet.public.blastapi.io";

export const STELLAR_TOKEN_MESSENGER = "CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL";
export const STELLAR_MESSAGE_TRANSMITTER = "CACMENFFJPJMSDAJQLX4R7K3SFZIW2LJSE3R2UMLGSWHFHS353FVXAZV";
export const STELLAR_USDC_CONTRACT = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
export const STELLAR_USDC_ASSET_CODE = "USDC";
export const STELLAR_RPC_URL = "https://soroban.stellar.org";
export const STELLAR_NETWORK_PASSPHRASE = "Public Global Stellar Network ; September 2015";

export const BRIDGE_CHAINS: BridgeChain[] = [
  evmChain(mainnet.id, 0, "Ethereum", "ETH", "#627eea", undefined, true, "https://etherscan.io/tx/", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(avalanche.id, 1, "Avalanche", "AVAX", "#e84142", undefined, false, "https://snowtrace.io/tx/", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(optimism.id, 2, "OP Mainnet", "OP", "#ff0420", "/chains/optimism.svg", true, "https://optimistic.etherscan.io/tx/", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(arbitrum.id, 3, "Arbitrum", "ARB", "#28a0f0", undefined, true, "https://arbiscan.io/tx/", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(base.id, 6, "Base", "BASE", "#0052ff", undefined, true, "https://basescan.org/tx/", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(polygon.id, 7, "Polygon", "POLYGON", "#8247e5", "/chains/polygon.svg", false, "https://polygonscan.com/tx/", "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(unichain.id, 10, "Unichain", "UNI", "#fc72ff", "/chains/unichain.svg", true, "https://uniscan.xyz/tx/", "0x078D782b760474a361dDA0AF3839290b0EF57AD6", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(linea.id, 11, "Linea", "LINEA", "#61dfff", "/chains/linea.svg", true, "https://lineascan.build/tx/", "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(sonic.id, 13, "Sonic", "S", "#111111", "/chains/sonic.svg", false, "https://sonicscan.org/tx/", "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(worldchain.id, 14, "World Chain", "WORLD", "#000000", "/chains/world.svg", true, "https://worldscan.org/tx/", "0x79A02482A880bCe3F13E09da970dC34dB4cD24D1", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(monad.id, 15, "Monad", "MON", "#836ef9", "/chains/monad.svg", false, "https://monadvision.com/tx/", "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(sei.id, 16, "Sei", "SEI", "#9b111e", "/chains/sei.svg", false, "https://seiscan.io/tx/", "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(xdc.id, 18, "XDC", "XDC", "#2a5ada", "/chains/xdc.svg", false, "https://xdcscan.com/tx/", "0xfA2958CB79b0491CC627c1557F441eF849Ca8eb1", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(hyperEvm.id, 19, "HyperEVM", "HYPE", "#00e6b0", "/chains/hyperevm.svg", false, "https://hyperscan.com/tx/", "0xb88339CB7199b77E23DB6E890353E22632Ba630f", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(ink.id, 21, "Ink", "INK", "#7132f5", "/chains/ink.svg", true, "https://explorer.inkonchain.com/tx/", "0x2D270e6886d130D724215A266106e6832161EAEd", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(plumeMainnet.id, 22, "Plume", "PLUME", "#ff4f9a", "/chains/plume.svg", true, "https://explorer.plume.org/tx/", "0x222365EF19F7947e5484218551B56bb3965Aa7aF", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(INJECTIVE_EVM_CHAIN_ID, 29, "Injective", "INJ", "#00D9FF", undefined, false, "https://blockscout.injective.network/tx/", "0xa00C59fF5a080D2b954d0c75e46E22a0c371235a", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  evmChain(morph.id, 30, "Morph", "MORPH", "#00ff7f", "/chains/morph.svg", true, "https://explorer.morph.network/tx/", "0xCfb1186F4e93D60E60a8bDd997427D1F33bc372B", TOKEN_MESSENGER_V2, MESSAGE_TRANSMITTER_V2),
  solanaChain(5, 5, "Solana", "SOL", "#14f195", "/chains/solana.svg", false, "https://solscan.io/tx/", SOLANA_USDC_MINT, SOLANA_CCTP_PROGRAM_ID, SOLANA_MESSAGE_TRANSMITTER_PROGRAM_ID),
  starknetChain(25, 25, "Starknet", "STRK", "#fc5b3f", "/chains/starknet.svg", false, "https://starkscan.co/tx/", STARKNET_USDC, STARKNET_TOKEN_MESSENGER, STARKNET_MESSAGE_TRANSMITTER),
  stellarChain(27, 27, "Stellar", "XLM", "#7d8cff", "/chains/stellar.svg", false, "https://stellar.expert/explorer/public/tx/", STELLAR_USDC_CONTRACT, STELLAR_TOKEN_MESSENGER, STELLAR_MESSAGE_TRANSMITTER),
];

export const BRIDGE_CHAIN_OPTIONS: BridgeChainOption[] = [
  ...BRIDGE_CHAINS.map((chain) => ({
    chainId: chain.chainId,
    domain: chain.domain,
    name: chain.name,
    shortName: chain.shortName,
    accent: chain.accent,
    icon: chain.icon,
    type: chain.type,
    status: "active" as const,
  })),
  {
    domain: 12, name: "Codex", shortName: "CODEX", accent: "#7c3aed", icon: "/chains/codex.svg", type: "evm" as const, status: "planned",
  },
  {
    domain: 26, name: "Arc", shortName: "ARC", accent: "#0ea5e9", icon: "/chains/arc.svg", type: "evm" as const, status: "planned",
  },
  {
    domain: 28, name: "EDGE", shortName: "EDGE", accent: "#111827", icon: "/chains/edge.svg", type: "evm" as const, status: "planned",
  },
  {
    domain: 31, name: "Pharos", shortName: "PHAROS", accent: "#14b8a6", icon: "/chains/pharos.svg", type: "evm" as const, status: "planned",
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
  return chain.type === "evm";
}

export function getChainType(chain: BridgeChain): ChainType {
  return chain.type;
}

export function isValidRecipient(chain: BridgeChain, address: string): boolean {
  switch (chain.type) {
    case "evm":
      return isAddress(address);
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    case "starknet":
      return /^0x[0-9a-fA-F]{63,66}$/.test(address);
    case "stellar":
      return /^G[0-9A-Z]{55}$/.test(address);
  }
}

export function parseUsdcAmount(value: string, decimals = 6) {
  return parseUnits(value.trim(), decimals);
}

export function formatUsdc(value: bigint, decimals = 6) {
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedFraction = fraction.slice(0, 6).replace(/0+$/, "");
  return trimmedFraction ? `${withCommas}.${trimmedFraction}` : withCommas;
}

export async function addressToBytes32(address: string, destinationType?: ChainType): Promise<`0x${string}`> {
  if (destinationType === "solana") {
    const { PublicKey } = await import("@solana/web3.js");
    return ("0x" + Buffer.from(new PublicKey(address).toBytes()).toString("hex")) as `0x${string}`;
  }
  if (destinationType === "stellar") {
    const { Keypair } = await import("@stellar/stellar-sdk");
    return ("0x" + Buffer.from(Keypair.fromPublicKey(address).rawPublicKey()).toString("hex")) as `0x${string}`;
  }
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

export async function fetchAttestation(sourceDomain: number, burnHash: string) {
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
      message: message.message as string,
      attestation: message.attestation as string,
    };
  }
  return null;
}

export type AttestationStatus = "complete" | "pending" | "not_found";

export async function fetchAttestationStatus(
  sourceDomain: number,
  burnHash: string,
): Promise<AttestationStatus> {
  const response = await fetch(
    `${getIrisApiBase()}/v2/messages/${sourceDomain}?transactionHash=${burnHash}`,
    { cache: "no-store" },
  );
  if (!response.ok) return "not_found";
  const payload = await response.json();
  const message = payload?.messages?.[0] ?? payload?.data?.messages?.[0] ?? payload?.data?.[0];
  if (!message) return "not_found";
  if (message?.status === "complete" && message?.message && message?.attestation) {
    return "complete";
  }
  return "pending";
}
