"use client";

import type { Config } from "wagmi";
import { getPublicClient, getTransactionCount, readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { type Address } from "viem";
import { CCTP_FORWARD_HOOK_DATA, ERC20_ABI, TOKEN_MESSENGER_V2_ABI, MESSAGE_TRANSMITTER_V2_ABI, addressToBytes32, getFinalityThreshold, ZERO_BYTES_32, type BridgeChain, type BridgeMode } from "./cctpBridge";

export type EvmBurnParams = {
  config: Config;
  account: Address;
  source: BridgeChain;
  destination: BridgeChain;
  amount: bigint;
  recipient: string;
  mode: BridgeMode;
  maxFee: bigint;
  useForwarder?: boolean;
};

export type EvmClaimParams = {
  account: Address;
  destination: BridgeChain;
  attestation: { message: string; attestation: string };
};

const GAS_LIMIT_BUFFER_PERCENT = BigInt(20);

async function estimateContractGasWithBuffer(
  config: Config,
  chainId: number,
  request: Record<string, unknown>,
) {
  const publicClient = getPublicClient(config, { chainId });
  if (!publicClient) throw new Error("No public RPC client is configured for the selected network.");
  const estimate = await publicClient.estimateContractGas(request as any);
  return estimate + (estimate * GAS_LIMIT_BUFFER_PERCENT) / BigInt(100);
}

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
  const nonce = await getTransactionCount(config, {
    address: account,
    chainId: chain.chainId,
    blockTag: "pending",
  });
  const request = {
    address: chain.usdc as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [chain.tokenMessenger as `0x${string}`, amount],
    chainId: chain.chainId,
    account,
    nonce,
  };
  const gas = await estimateContractGasWithBuffer(config, chain.chainId, request);
  const hash = await writeContract(config, { ...request, gas } as any);
  await waitForTransactionReceipt(config, { hash, chainId: chain.chainId });
}

export async function depositForBurnEvm(config: Config, params: EvmBurnParams) {
  const { account, source, destination, amount, recipient, mode, maxFee, useForwarder = false } = params;
  const mintRecipient = await addressToBytes32(recipient, destination.type);
  const nonce = await getTransactionCount(config, {
    address: account,
    chainId: source.chainId,
    blockTag: "pending",
  });
  const functionName = useForwarder ? "depositForBurnWithHook" : "depositForBurn";
  const args = useForwarder
    ? [
        amount,
        destination.domain,
        mintRecipient,
        source.usdc as `0x${string}`,
        ZERO_BYTES_32,
        maxFee,
        getFinalityThreshold(mode),
        CCTP_FORWARD_HOOK_DATA,
      ]
    : [
        amount,
        destination.domain,
        mintRecipient,
        source.usdc as `0x${string}`,
        ZERO_BYTES_32,
        maxFee,
        getFinalityThreshold(mode),
      ];
  const request = {
    address: source.tokenMessenger as `0x${string}`,
    abi: TOKEN_MESSENGER_V2_ABI,
    functionName,
    args,
    chainId: source.chainId,
    account,
    nonce,
  };
  const gas = await estimateContractGasWithBuffer(config, source.chainId, request);
  const hash = await writeContract(config, { ...request, gas } as any);
  await waitForTransactionReceipt(config, { hash, chainId: source.chainId });
  return hash;
}

export async function receiveMessageEvm(config: Config, params: EvmClaimParams) {
  const { account, destination, attestation } = params;
  const nonce = await getTransactionCount(config, {
    address: account,
    chainId: destination.chainId,
    blockTag: "pending",
  });
  const request = {
    address: destination.messageTransmitter as `0x${string}`,
    abi: MESSAGE_TRANSMITTER_V2_ABI,
    functionName: "receiveMessage",
    args: [attestation.message, attestation.attestation],
    chainId: destination.chainId,
    account,
    nonce,
  };
  const gas = await estimateContractGasWithBuffer(config, destination.chainId, request);
  const hash = await writeContract(config, { ...request, gas } as any);
  await waitForTransactionReceipt(config, { hash, chainId: destination.chainId });
  return hash;
}
