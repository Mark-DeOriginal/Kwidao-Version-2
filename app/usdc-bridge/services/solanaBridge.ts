"use client";

import type { Connection, Transaction } from "@solana/web3.js";
import { SOLANA_RPC_URL, type BridgeChain } from "./cctpBridge";

export type SolanaWallet = {
  publicKey: { toBase58(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58(): string } }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (tx: Transaction | Uint8Array | Buffer) => Promise<{ signature: string }>;
  signMessage: (msg: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

declare global {
  interface Window {
    solana?: SolanaWallet;
  }
}

function getSolanaProvider(): SolanaWallet | null {
  if (typeof window === "undefined") return null;
  if (window.solana) return window.solana;
  return null;
}

const SOLANA_RPC_URLS = [SOLANA_RPC_URL, "https://solana-rpc.publicnode.com"];

let preferredSolanaRpcUrl: string | null = null;

async function withSolanaRpc<T>(
  operation: (connection: Connection) => Promise<T>,
): Promise<T> {
  const { Connection } = await import("@solana/web3.js");
  const candidates = preferredSolanaRpcUrl
    ? [preferredSolanaRpcUrl, ...SOLANA_RPC_URLS.filter((url) => url !== preferredSolanaRpcUrl)]
    : SOLANA_RPC_URLS;
  let lastError: unknown;
  for (const url of candidates) {
    try {
      const connection = new Connection(url, "confirmed");
      const result = await operation(connection);
      preferredSolanaRpcUrl = url;
      return result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("All Solana RPC endpoints are unreachable.");
}

export function hasSolanaWallet(): boolean {
  return typeof window !== "undefined" && !!window.solana;
}

export async function connectSolanaWallet(): Promise<string> {
  const provider = getSolanaProvider();
  if (!provider) throw new Error("Solana wallet not found. Install Phantom or Backpack.");
  const resp = await provider.connect();
  return resp.publicKey.toBase58();
}

export async function disconnectSolanaWallet(): Promise<void> {
  const provider = getSolanaProvider();
  if (provider) await provider.disconnect();
}

export async function getSolanaBalance(chain: BridgeChain, address: string): Promise<bigint> {
  return withSolanaRpc(async (connection) => {
    const { PublicKey } = await import("@solana/web3.js");
    const mintPubkey = new PublicKey(chain.usdc);
    const ownerPubkey = new PublicKey(address);

    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
    try {
      const account = await connection.getTokenAccountBalance(ata);
      return BigInt(account.value.amount);
    } catch (error) {
      if (error instanceof Error && /could not find account/i.test(error.message)) {
        return BigInt(0);
      }
      throw error;
    }
  });
}

export async function resolveSolanaRecipientTokenAccount(
  address: string,
  usdcMintAddress: string,
): Promise<string> {
  return withSolanaRpc(async (connection) => {
    const { PublicKey } = await import("@solana/web3.js");
    const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
    const pubkey = new PublicKey(address);
    const info = await connection.getAccountInfo(pubkey);
    if (info && info.owner.equals(TOKEN_PROGRAM_ID)) return address;
    const mint = new PublicKey(usdcMintAddress);
    const ata = await getAssociatedTokenAddress(mint, pubkey);
    return ata.toBase58();
  });
}

export async function depositForBurnSolana(
  chain: BridgeChain,
  destinationDomain: number,
  amount: bigint,
  recipientBytes32: string,
  maxFee: bigint,
  minFinalityThreshold: number,
): Promise<string> {
  const provider = getSolanaProvider();
  if (!provider?.publicKey) throw new Error("Solana wallet not connected.");

  const { PublicKey, Transaction, SystemProgram, Keypair } = await import("@solana/web3.js");
  const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

  const owner = new PublicKey(provider.publicKey.toBase58());
  const tokenMessengerProgram = new PublicKey(chain.tokenMessenger);
  const messageTransmitterProgram = new PublicKey(chain.messageTransmitter);
  const usdcMint = new PublicKey(chain.usdc);
  const ownerAta = await getAssociatedTokenAddress(usdcMint, owner);

  const messageTransmitterPda = PublicKey.findProgramAddressSync(
    [Buffer.from("message_transmitter")],
    messageTransmitterProgram,
  )[0];
  const senderAuthorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("sender_authority")],
    tokenMessengerProgram,
  )[0];
  const denylistPda = PublicKey.findProgramAddressSync(
    [Buffer.from("denylist_account"), owner.toBuffer()],
    tokenMessengerProgram,
  )[0];
  const tokenMessengerPda = PublicKey.findProgramAddressSync(
    [Buffer.from("token_messenger")],
    tokenMessengerProgram,
  )[0];
  const remoteTokenMessengerPda = PublicKey.findProgramAddressSync(
    [Buffer.from("remote_token_messenger"), Buffer.from(destinationDomain.toString())],
    tokenMessengerProgram,
  )[0];
  const tokenMinterPda = PublicKey.findProgramAddressSync(
    [Buffer.from("token_minter")],
    tokenMessengerProgram,
  )[0];
  const localTokenPda = PublicKey.findProgramAddressSync(
    [Buffer.from("local_token"), usdcMint.toBuffer()],
    tokenMessengerProgram,
  )[0];

  const recipientBytes = Buffer.from(recipientBytes32.replace("0x", ""), "hex");
  const mintRecipient = new PublicKey(recipientBytes);
  const destinationCaller = Buffer.alloc(32, 0);

  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amount);
  const domainBuf = Buffer.alloc(4);
  domainBuf.writeUInt32LE(destinationDomain);
  const maxFeeBuf = Buffer.alloc(8);
  maxFeeBuf.writeBigUInt64LE(maxFee);
  const finalityBuf = Buffer.alloc(4);
  finalityBuf.writeUInt32LE(minFinalityThreshold);
  const discriminator = Buffer.from("d73c3d2e723780b0", "hex");
  const instructionData = Buffer.concat([
    discriminator,
    amountBuf,
    domainBuf,
    mintRecipient.toBuffer(),
    destinationCaller,
    maxFeeBuf,
    finalityBuf,
  ]);

  const eventAuthorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    tokenMessengerProgram,
  )[0];
  const messageSentEventAccount = Keypair.generate();
  const { blockhash } = await withSolanaRpc((connection) => connection.getLatestBlockhash());
  const tx = new Transaction({ feePayer: owner, recentBlockhash: blockhash });

  const burnIx = {
    programId: tokenMessengerProgram,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: false },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: senderAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: ownerAta, isSigner: false, isWritable: true },
      { pubkey: denylistPda, isSigner: false, isWritable: false },
      { pubkey: messageTransmitterPda, isSigner: false, isWritable: true },
      { pubkey: tokenMessengerPda, isSigner: false, isWritable: false },
      { pubkey: remoteTokenMessengerPda, isSigner: false, isWritable: false },
      { pubkey: tokenMinterPda, isSigner: false, isWritable: false },
      { pubkey: localTokenPda, isSigner: false, isWritable: true },
      { pubkey: usdcMint, isSigner: false, isWritable: true },
      { pubkey: messageSentEventAccount.publicKey, isSigner: true, isWritable: true },
      { pubkey: messageTransmitterProgram, isSigner: false, isWritable: false },
      { pubkey: tokenMessengerProgram, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: eventAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: tokenMessengerProgram, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  };
  tx.add(burnIx);
  tx.partialSign(messageSentEventAccount);

  const signed = await provider.signAndSendTransaction(tx);
  return signed.signature;
}

export async function receiveMessageSolana(
  chain: BridgeChain,
  attestation: { message: string; attestation: string },
): Promise<string> {
  const provider = getSolanaProvider();
  if (!provider?.publicKey) throw new Error("Solana wallet not connected.");

  const { PublicKey, Transaction, SystemProgram } = await import("@solana/web3.js");
  const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

  const payer = new PublicKey(provider.publicKey.toBase58());
  const messageTransmitterProgram = new PublicKey(chain.messageTransmitter);
  const tokenMessengerProgram = new PublicKey(chain.tokenMessenger);
  const usdcMint = new PublicKey(chain.usdc);

  const messageBytes = Buffer.from(attestation.message.replace("0x", ""), "hex");
  const attestationBytes = Buffer.from(attestation.attestation.replace("0x", ""), "hex");

  const sourceDomain = messageBytes.readUInt32BE(4);
  const sourceDomainSeed = Buffer.from(sourceDomain.toString());
  const nonce = messageBytes.subarray(12, 44);
  const burnToken = messageBytes.subarray(152, 184);
  const mintRecipientBytes = messageBytes.subarray(184, 216);
  const mintRecipient = new PublicKey(mintRecipientBytes);

  const messageTransmitterPda = PublicKey.findProgramAddressSync(
    [Buffer.from("message_transmitter")],
    messageTransmitterProgram,
  )[0];
  const authorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("message_transmitter_authority"), tokenMessengerProgram.toBuffer()],
    messageTransmitterProgram,
  )[0];
  const usedNoncePda = PublicKey.findProgramAddressSync(
    [Buffer.from("used_nonce"), nonce],
    messageTransmitterProgram,
  )[0];
  const tokenMessengerPda = PublicKey.findProgramAddressSync(
    [Buffer.from("token_messenger")],
    tokenMessengerProgram,
  )[0];
  const remoteTokenMessengerPda = PublicKey.findProgramAddressSync(
    [Buffer.from("remote_token_messenger"), sourceDomainSeed],
    tokenMessengerProgram,
  )[0];
  const tokenMinterPda = PublicKey.findProgramAddressSync(
    [Buffer.from("token_minter")],
    tokenMessengerProgram,
  )[0];
  const localTokenPda = PublicKey.findProgramAddressSync(
    [Buffer.from("local_token"), usdcMint.toBuffer()],
    tokenMessengerProgram,
  )[0];
  const tokenPairPda = PublicKey.findProgramAddressSync(
    [Buffer.from("token_pair"), sourceDomainSeed, burnToken],
    tokenMessengerProgram,
  )[0];
  const custodyPda = PublicKey.findProgramAddressSync(
    [Buffer.from("custody"), usdcMint.toBuffer()],
    tokenMessengerProgram,
  )[0];

  const { tokenMessengerAccount, blockhash } = await withSolanaRpc(async (connection) => ({
    tokenMessengerAccount: await connection.getAccountInfo(tokenMessengerPda),
    blockhash: (await connection.getLatestBlockhash()).blockhash,
  }));
  if (!tokenMessengerAccount) throw new Error("Circle TokenMessenger not found on Solana.");
  const feeRecipient = new PublicKey(tokenMessengerAccount.data.subarray(109, 141));
  const feeRecipientAta = await getAssociatedTokenAddress(usdcMint, feeRecipient);
  const recipientTokenAccount = mintRecipient;

  const messageTransmitterEventAuthorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    messageTransmitterProgram,
  )[0];
  const tokenMessengerEventAuthorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    tokenMessengerProgram,
  )[0];

  const messageLenBuf = Buffer.alloc(4);
  messageLenBuf.writeUInt32LE(messageBytes.length);
  const attLenBuf = Buffer.alloc(4);
  attLenBuf.writeUInt32LE(attestationBytes.length);
  const discriminator = Buffer.from("26907fe11fe1ee19", "hex");
  const instructionData = Buffer.concat([
    discriminator,
    messageLenBuf,
    messageBytes,
    attLenBuf,
    attestationBytes,
  ]);

  const tx = new Transaction({ feePayer: payer, recentBlockhash: blockhash });
  const receiveIx = {
    programId: messageTransmitterProgram,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false },
      { pubkey: authorityPda, isSigner: false, isWritable: false },
      { pubkey: messageTransmitterPda, isSigner: false, isWritable: false },
      { pubkey: usedNoncePda, isSigner: false, isWritable: true },
      { pubkey: tokenMessengerProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: messageTransmitterEventAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: messageTransmitterProgram, isSigner: false, isWritable: false },
      { pubkey: tokenMessengerPda, isSigner: false, isWritable: false },
      { pubkey: remoteTokenMessengerPda, isSigner: false, isWritable: false },
      { pubkey: tokenMinterPda, isSigner: false, isWritable: false },
      { pubkey: localTokenPda, isSigner: false, isWritable: true },
      { pubkey: tokenPairPda, isSigner: false, isWritable: false },
      { pubkey: feeRecipientAta, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: custodyPda, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: tokenMessengerEventAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: tokenMessengerProgram, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  };
  tx.add(receiveIx);

  const signed = await provider.signAndSendTransaction(tx);
  return signed.signature;
}
