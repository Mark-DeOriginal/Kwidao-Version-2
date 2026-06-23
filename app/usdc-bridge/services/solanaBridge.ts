"use client";

import { SOLANA_RPC_URL, type BridgeChain } from "./cctpBridge";

export type SolanaWallet = {
  publicKey: { toBase58(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58(): string } }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (tx: Uint8Array | Buffer) => Promise<{ signature: string }>;
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

async function getSolanaConnection() {
  const { Connection } = await import("@solana/web3.js");
  return new Connection(SOLANA_RPC_URL, "confirmed");
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
  const connection = await getSolanaConnection();
  const { PublicKey } = await import("@solana/web3.js");
  const mintPubkey = new PublicKey(chain.usdc);
  const ownerPubkey = new PublicKey(address);

  const { getAssociatedTokenAddress } = await import("@solana/spl-token");
  const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
  try {
    const account = await connection.getTokenAccountBalance(ata);
    return BigInt(account.value.amount);
  } catch {
    return BigInt(0);
  }
}

async function getDepositForBurnPdas(
  programId: string,
  usdcMint: string,
  destinationDomain: number,
) {
  const { PublicKey } = await import("@solana/web3.js");
  const progId = new PublicKey(programId);
  const usdc = new PublicKey(usdcMint);

  return {
    senderAuthorityPda: PublicKey.findProgramAddressSync(
      [Buffer.from("sender_authority")],
      progId,
    )[0],
    messageTransmitterPda: PublicKey.findProgramAddressSync(
      [Buffer.from("message_transmitter")],
      progId,
    )[0],
    tokenMessengerPda: PublicKey.findProgramAddressSync(
      [Buffer.from("token_messenger")],
      progId,
    )[0],
    remoteTokenMessengerPda: PublicKey.findProgramAddressSync(
      [Buffer.from("remote_token_messenger"), Buffer.from(destinationDomain.toString())],
      progId,
    )[0],
    tokenMinterPda: PublicKey.findProgramAddressSync(
      [Buffer.from("token_minter")],
      progId,
    )[0],
    localTokenPda: PublicKey.findProgramAddressSync(
      [Buffer.from("local_token"), usdc.toBuffer()],
      progId,
    )[0],
    eventAuthorityPda: PublicKey.findProgramAddressSync(
      [Buffer.from("__event_authority")],
      progId,
    )[0],
  };
}

export async function depositForBurnSolana(
  chain: BridgeChain,
  destinationDomain: number,
  amount: bigint,
  recipientBytes32: string,
): Promise<string> {
  const provider = getSolanaProvider();
  if (!provider?.publicKey) throw new Error("Solana wallet not connected.");

  const { PublicKey, Transaction, SystemProgram, Keypair } = await import("@solana/web3.js");
  const { getAssociatedTokenAddress, createApproveInstruction, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

  const connection = await getSolanaConnection();
  const programId = new PublicKey(chain.tokenMessenger);
  const usdcMint = new PublicKey(chain.usdc);
  const sender = new PublicKey(provider.publicKey.toBase58());
  const senderAta = await getAssociatedTokenAddress(usdcMint, sender);
  const { blockhash } = await connection.getLatestBlockhash();

  const pdas = await getDepositForBurnPdas(chain.tokenMessenger, chain.usdc, destinationDomain);

  const recipientBytes = Buffer.from(recipientBytes32.replace("0x", ""), "hex");
  const mintRecipient = new PublicKey(recipientBytes);

  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amount);
  const domainBuf = Buffer.alloc(4);
  domainBuf.writeUInt32LE(destinationDomain);
  const discriminator = Buffer.from("d73c3d2e723780b0", "hex");
  const instructionData = Buffer.concat([
    discriminator,
    amountBuf,
    domainBuf,
    mintRecipient.toBuffer(),
  ]);

  const messageSentEventAccount = Keypair.generate();

  const tx = new Transaction({ feePayer: sender, recentBlockhash: blockhash });

  const approveIx = createApproveInstruction(senderAta, pdas.senderAuthorityPda, sender, amount);
  tx.add(approveIx);

  const burnIx = {
    programId,
    keys: [
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: pdas.senderAuthorityPda, isSigner: false, isWritable: true },
      { pubkey: senderAta, isSigner: false, isWritable: true },
      { pubkey: pdas.messageTransmitterPda, isSigner: false, isWritable: false },
      { pubkey: pdas.tokenMessengerPda, isSigner: false, isWritable: false },
      { pubkey: pdas.remoteTokenMessengerPda, isSigner: false, isWritable: false },
      { pubkey: pdas.tokenMinterPda, isSigner: false, isWritable: true },
      { pubkey: pdas.localTokenPda, isSigner: false, isWritable: true },
      { pubkey: usdcMint, isSigner: false, isWritable: false },
      { pubkey: programId, isSigner: false, isWritable: false },
      { pubkey: programId, isSigner: false, isWritable: false },
      { pubkey: messageSentEventAccount.publicKey, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: pdas.eventAuthorityPda, isSigner: false, isWritable: false },
      { pubkey: programId, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  };
  tx.add(burnIx);

  tx.partialSign(messageSentEventAccount);
  const signed = await provider.signAndSendTransaction(tx.serialize());
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

  const connection = await getSolanaConnection();
  const sender = new PublicKey(provider.publicKey.toBase58());
  const { blockhash } = await connection.getLatestBlockhash();

  const programId = new PublicKey(chain.messageTransmitter);
  const tokenMessengerProgramId = new PublicKey(chain.tokenMessenger);
  const usdcMint = new PublicKey(chain.usdc);

  const messageBytes = Buffer.from(attestation.message.replace("0x", ""), "hex");
  const attestationBytes = Buffer.from(attestation.attestation.replace("0x", ""), "hex");
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

  const messageTransmitterPda = PublicKey.findProgramAddressSync(
    [Buffer.from("message_transmitter")],
    programId,
  )[0];

  const authorityPda = PublicKey.findProgramAddressSync(
    [Buffer.from("message_transmitter_authority"), tokenMessengerProgramId.toBuffer()],
    programId,
  )[0];

  const nonceBuf = Buffer.from(messageBytes.slice(12, 20)).reverse();
  const usedNoncesPda = PublicKey.findProgramAddressSync(
    [Buffer.from("used_nonces"), nonceBuf],
    programId,
  )[0];

  const senderAta = await getAssociatedTokenAddress(usdcMint, sender);

  const pdas = await getDepositForBurnPdas(chain.tokenMessenger, chain.usdc, 0);

  const tx = new Transaction({ feePayer: sender, recentBlockhash: blockhash });

  const remainingAccounts = [
    { pubkey: pdas.tokenMessengerPda, isSigner: false, isWritable: false },
    { pubkey: pdas.remoteTokenMessengerPda, isSigner: false, isWritable: false },
    { pubkey: pdas.tokenMinterPda, isSigner: false, isWritable: true },
    { pubkey: pdas.localTokenPda, isSigner: false, isWritable: true },
    { pubkey: usdcMint, isSigner: false, isWritable: false },
    { pubkey: senderAta, isSigner: false, isWritable: true },
    { pubkey: usdcMint, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: pdas.eventAuthorityPda, isSigner: false, isWritable: false },
    { pubkey: tokenMessengerProgramId, isSigner: false, isWritable: false },
  ];

  const receiveIx = {
    programId,
    keys: [
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: sender, isSigner: false, isWritable: false },
      { pubkey: authorityPda, isSigner: false, isWritable: false },
      { pubkey: messageTransmitterPda, isSigner: false, isWritable: false },
      { pubkey: usedNoncesPda, isSigner: false, isWritable: true },
      { pubkey: tokenMessengerProgramId, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ...remainingAccounts,
    ],
    data: instructionData,
  };
  tx.add(receiveIx);

  const signed = await provider.signAndSendTransaction(tx.serialize());
  return signed.signature;
}
