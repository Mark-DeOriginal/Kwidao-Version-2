import crypto from "crypto";
import { cookies } from "next/headers";
import { User, UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { P2P_SESSION_COOKIE } from "./constants";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function normalizeWallet(walletAddress: string): string {
  return walletAddress.trim().toLowerCase();
}

export function isValidWalletAddress(walletAddress: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim());
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function isAdminWallet(walletAddress: string): boolean {
  const adminWallets = (process.env.P2P_ADMIN_WALLETS || "")
    .split(",")
    .map((wallet) => wallet.trim().toLowerCase())
    .filter(Boolean);
  return adminWallets.includes(walletAddress.toLowerCase());
}

export async function createOrLoginWalletUser(walletAddress: string): Promise<User> {
  const normalized = normalizeWallet(walletAddress);
  const role: UserRole = isAdminWallet(normalized) ? "ADMIN" : "USER";

  return prisma.user.upsert({
    where: { walletAddress: normalized },
    update: { role: role === "ADMIN" ? "ADMIN" : undefined },
    create: {
      walletAddress: normalized,
      role,
    },
  });
}

export async function createSessionForUser(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return sessionToken;
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(P2P_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(sessionToken) },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }

  return session.user;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(P2P_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return;
  }

  await prisma.session
    .delete({
      where: {
        tokenHash: hashToken(sessionToken),
      },
    })
    .catch(() => null);
}

