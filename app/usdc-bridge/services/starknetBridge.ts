"use client";

import { RpcProvider, Contract } from "starknet";
import { STARKNET_RPC_URL, type BridgeChain } from "./cctpBridge";

export type StarknetWindowObject = {
  isConnected: boolean;
  account: string;
  chainId: string;
  enable: (opts?: { showModal?: boolean }) => Promise<string[]>;
  request: (call: { type: string; params: unknown }) => Promise<unknown>;
};

declare global {
  interface Window {
    starknet?: StarknetWindowObject;
  }
}

const provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });
const abiCache = new Map<string, any>();

async function getAbi(address: string): Promise<any> {
  if (abiCache.has(address)) return abiCache.get(address);
  const { abi } = await provider.getClassAt(address);
  if (!abi) throw new Error(`No ABI found for Starknet contract ${address}`);
  abiCache.set(address, abi);
  return abi;
}

export function hasStarknetWallet(): boolean {
  return typeof window !== "undefined" && !!window.starknet;
}

export async function connectStarknetWallet(): Promise<string> {
  if (!window.starknet) throw new Error("Starknet wallet not found. Install Argent X or Braavos.");
  await window.starknet.enable({ showModal: true });
  if (!window.starknet.isConnected || !window.starknet.account) {
    throw new Error("Failed to connect Starknet wallet.");
  }
  return window.starknet.account;
}

export async function disconnectStarknetWallet(): Promise<void> {
  if (!window.starknet) return;
}

export async function getStarknetBalance(chain: BridgeChain, address: string): Promise<bigint> {
  const call = {
    contractAddress: chain.usdc,
    entrypoint: "balanceOf",
    calldata: [address],
  };

  const result = await fetch(`${STARKNET_RPC_URL}/v0_7/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(call),
  });

  if (!result.ok) return BigInt(0);
  const json = await result.json();
  if (!json?.result) return BigInt(0);
  const raw = Array.isArray(json.result) ? json.result[0] : json.result;
  return BigInt(raw);
}

function splitU256(value: bigint): [string, string] {
  const mask = (BigInt(1) << BigInt(128)) - BigInt(1);
  return [`0x${(value & mask).toString(16)}`, `0x${(value >> BigInt(128)).toString(16)}`];
}

export async function depositForBurnStarknet(
  chain: BridgeChain,
  destinationDomain: number,
  amount: bigint,
  recipientBytes32: string,
): Promise<string> {
  if (!window.starknet?.account) throw new Error("Starknet wallet not connected.");

  const abi = await getAbi(chain.tokenMessenger);
  const contract = new Contract(abi, chain.tokenMessenger, provider);

  const [amountLow, amountHigh] = splitU256(amount);
  const destDomainHex = `0x${destinationDomain.toString(16)}`;

  const call = (contract as any).populateTransaction("deposit_for_burn", [
    { low: amountLow, high: amountHigh },
    destDomainHex,
    recipientBytes32,
    chain.usdc,
    "0x0",
    { low: "0x0", high: "0x0" },
    "0x7d0",
  ]);

  const result = await window.starknet.request({
    type: "INVOKE_FUNCTION",
    params: call,
  });

  const txHash = (result as { transaction_hash?: string }).transaction_hash;
  if (!txHash) throw new Error("Starknet depositForBurn failed: no transaction hash returned");
  return txHash;
}

export async function receiveMessageStarknet(
  chain: BridgeChain,
  attestation: { message: string; attestation: string },
): Promise<string> {
  if (!window.starknet?.account) throw new Error("Starknet wallet not connected.");

  const abi = await getAbi(chain.messageTransmitter);
  const contract = new Contract(abi, chain.messageTransmitter, provider);

  const call = (contract as any).populateTransaction("receive_message", [
    attestation.message,
    attestation.attestation,
  ]);

  const result = await window.starknet.request({
    type: "INVOKE_FUNCTION",
    params: call,
  });

  const txHash = (result as { transaction_hash?: string }).transaction_hash;
  if (!txHash) throw new Error("Starknet receiveMessage failed: no transaction hash returned");
  return txHash;
}
