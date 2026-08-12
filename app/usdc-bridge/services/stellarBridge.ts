"use client";

import { STELLAR_RPC_URL, STELLAR_NETWORK_PASSPHRASE, STELLAR_USDC_ASSET_CODE, type BridgeChain } from "./cctpBridge";

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean }>;
      getPublicKey: () => Promise<string>;
      signTransaction: (tx: string, opts?: { networkPassphrase?: string }) => Promise<{ signedTxXdr: string }>;
    };
  }
}

const HORIZON_URL = "https://horizon.stellar.org";

export function hasStellarWallet(): boolean {
  return typeof window !== "undefined" && !!window.freighter;
}

export async function connectStellarWallet(): Promise<string> {
  if (!window.freighter) throw new Error("Stellar wallet not found. Install Freighter.");
  const pubKey = await window.freighter.getPublicKey();
  return pubKey;
}

export async function disconnectStellarWallet(): Promise<void> {
}

async function getStellarAccount(address: string) {
  const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!response.ok) throw new Error(`Failed to fetch Stellar account ${address}: ${response.status}`);
  return response.json();
}

async function submitSorobanTransaction(signedXdr: string): Promise<string> {
  const response = await fetch(`${STELLAR_RPC_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: signedXdr }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Soroban transaction submission failed (${response.status}): ${errorBody}`);
  }
  const result = await response.json();
  const hash = (result as { hash?: string }).hash;
  if (!hash) throw new Error("Soroban transaction submission returned no hash");
  return hash;
}

export async function getStellarBalance(chain: BridgeChain, address: string): Promise<bigint> {
  try {
    const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
    if (!response.ok) return BigInt(0);
    const data = await response.json();
    const usdcBalance = data.balances?.find(
      (b: { asset_type: string; asset_code?: string; asset_issuer?: string }) =>
        b.asset_type === "credit_alphanum4" && b.asset_code === STELLAR_USDC_ASSET_CODE && b.asset_issuer === chain.usdc,
    );
    if (!usdcBalance) return BigInt(0);
    const [whole, fraction = ""] = usdcBalance.balance.split(".");
    const padded = fraction.padEnd(chain.decimals, "0").slice(0, chain.decimals);
    return BigInt(`${whole}${padded}`);
  } catch {
    return BigInt(0);
  }
}

export async function depositForBurnStellar(
  chain: BridgeChain,
  destinationDomain: number,
  amount: bigint,
  recipientBytes32: string,
): Promise<string> {
  if (!window.freighter) throw new Error("Stellar wallet not found.");

  const { TransactionBuilder, Networks, xdr, Operation, Account } = await import("@stellar/stellar-sdk");
  const sourcePubKey = await window.freighter.getPublicKey();

  const accountData = await getStellarAccount(sourcePubKey);
  const account = new Account(sourcePubKey, accountData.sequence);

  const tx = new TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(Operation.invokeContractFunction({
      contract: chain.tokenMessenger,
      function: "deposit_for_burn",
      args: [
        xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: new xdr.Int64(0), lo: new xdr.Uint64(amount) })),
        xdr.ScVal.scvU32(destinationDomain),
        xdr.ScVal.scvBytes(Buffer.from(recipientBytes32.replace("0x", ""), "hex")),
        xdr.ScVal.scvSymbol(chain.usdc),
      ],
    }))
    .setTimeout(30)
    .build();

  const envelope = tx.toEnvelope().toXDR("base64");
  const { signedTxXdr } = await window.freighter.signTransaction(envelope, {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  });

  return submitSorobanTransaction(signedTxXdr);
}

export async function receiveMessageStellar(
  chain: BridgeChain,
  attestation: { message: string; attestation: string },
): Promise<string> {
  if (!window.freighter) throw new Error("Stellar wallet not found.");

  const { TransactionBuilder, Networks, xdr, Operation, Account } = await import("@stellar/stellar-sdk");
  const sourcePubKey = await window.freighter.getPublicKey();

  const accountData = await getStellarAccount(sourcePubKey);
  const account = new Account(sourcePubKey, accountData.sequence);

  const tx = new TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(Operation.invokeContractFunction({
      contract: chain.messageTransmitter,
      function: "receive_message",
      args: [
        xdr.ScVal.scvBytes(Buffer.from(attestation.message.replace("0x", ""), "hex")),
        xdr.ScVal.scvBytes(Buffer.from(attestation.attestation.replace("0x", ""), "hex")),
      ],
    }))
    .setTimeout(30)
    .build();

  const envelope = tx.toEnvelope().toXDR("base64");
  const { signedTxXdr } = await window.freighter.signTransaction(envelope, {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  });

  return submitSorobanTransaction(signedTxXdr);
}
