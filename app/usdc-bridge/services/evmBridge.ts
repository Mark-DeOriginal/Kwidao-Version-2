"use client";

import type { Config } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { type Address } from "viem";
import { ERC20_ABI, TOKEN_MESSENGER_V2_ABI, MESSAGE_TRANSMITTER_V2_ABI, addressToBytes32, getFinalityThreshold, ZERO_BYTES_32, type BridgeChain, type BridgeMode } from "./cctpBridge";

export type EvmBurnParams = {
  config: Config;
  account: Address;
  source: BridgeChain;
  destination: BridgeChain;
  amount: bigint;
  recipient: string;
  mode: BridgeMode;
  maxFee: bigint;
};

export type EvmClaimParams = {
  account: Address;
  destination: BridgeChain;
  attestation: { message: string; attestation: string };
};

export async function getEvmBalance(config: Config, chain: BridgeChain, address: Address) {
  return (await readContract(config, {
    address: chain.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    chainId: chain.chainId,
  } as any)) as bigint;
}

export async function getEvmAllowance(config: Config, chain: BridgeChain, owner: Address) {
  return (await readContract(config, {
    address: chain.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [owner, chain.tokenMessenger as `0x${string}`],
    chainId: chain.chainId,
  } as any)) as bigint;
}

export async function approveEvmUsdc(config: Config, chain: BridgeChain, account: Address, amount: bigint) {
  const hash = await writeContract(config, {
    address: chain.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [chain.tokenMessenger as `0x${string}`, amount],
    chainId: chain.chainId,
    account,
  } as any);
  await waitForTransactionReceipt(config, { hash, chainId: chain.chainId });
}

export async function depositForBurnEvm(config: Config, params: EvmBurnParams) {
  const { account, source, destination, amount, recipient, mode, maxFee } = params;
  const mintRecipient = await addressToBytes32(recipient, destination.type);
  const hash = await writeContract(config, {
    address: source.tokenMessenger as `0x${string}`,
    abi: TOKEN_MESSENGER_V2_ABI,
    functionName: "depositForBurn",
    args: [
      amount,
      destination.domain,
      mintRecipient,
      source.usdc as `0x${string}`,
      ZERO_BYTES_32,
      maxFee,
      getFinalityThreshold(mode),
    ],
    chainId: source.chainId,
    account,
  } as any);
  await waitForTransactionReceipt(config, { hash, chainId: source.chainId });
  return hash;
}

export async function receiveMessageEvm(config: Config, params: EvmClaimParams) {
  const { account, destination, attestation } = params;
  const hash = await writeContract(config, {
    address: destination.messageTransmitter as `0x${string}`,
    abi: MESSAGE_TRANSMITTER_V2_ABI,
    functionName: "receiveMessage",
    args: [attestation.message, attestation.attestation],
    chainId: destination.chainId,
    account,
  } as any);
  await waitForTransactionReceipt(config, { hash, chainId: destination.chainId });
  return hash;
}
