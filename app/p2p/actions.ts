"use server";

import { DisputeStatus, MessageType, ModeratorApplicationStatus, TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/p2p/auth";

function normalizeAddress(walletAddress: string): string {
  return walletAddress.trim().toLowerCase();
}

async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Please connect your wallet first.");
  }
  return user;
}

async function notifyUser(userId: string, title: string, body: string, type: "DISPUTE_ASSIGNED" | "DISPUTE_OPENED" | "TRADE_UPDATED" | "MODERATOR_APPLICATION") {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
    },
  });
}

export async function createTrade(formData: FormData) {
  const user = await requireUser();
  const sellerWallet = normalizeAddress(String(formData.get("sellerWallet") || ""));
  const assetSymbol = String(formData.get("assetSymbol") || "USDT").toUpperCase();
  const cryptoAmount = Number(formData.get("cryptoAmount") || 0);
  const fiatAmount = Number(formData.get("fiatAmount") || 0);
  const fiatCurrency = String(formData.get("fiatCurrency") || "USD").toUpperCase();

  if (!/^0x[a-f0-9]{40}$/.test(sellerWallet)) throw new Error("Seller wallet address is invalid.");
  if (sellerWallet === user.walletAddress) throw new Error("Buyer and seller cannot be the same wallet.");
  if (cryptoAmount <= 0 || fiatAmount <= 0) throw new Error("Amounts must be greater than zero.");

  const seller = await prisma.user.upsert({
    where: { walletAddress: sellerWallet },
    update: {},
    create: { walletAddress: sellerWallet },
  });

  const trade = await prisma.trade.create({
    data: {
      buyerId: user.id,
      sellerId: seller.id,
      assetSymbol,
      cryptoAmount,
      fiatAmount,
      fiatCurrency,
      messages: {
        create: {
          senderId: user.id,
          type: MessageType.SYSTEM,
          content: `Trade created for ${cryptoAmount} ${assetSymbol} against ${fiatAmount} ${fiatCurrency}.`,
        },
      },
    },
  });

  await notifyUser(
    seller.id,
    "New P2P trade created",
    `A buyer opened trade ${trade.id.slice(0, 8)} with your wallet.`,
    "TRADE_UPDATED",
  );

  revalidatePath("/p2p/dashboard");
  revalidatePath(`/p2p/trade/${trade.id}`);
}

export async function sendTradeMessage(formData: FormData) {
  const user = await requireUser();
  const tradeId = String(formData.get("tradeId") || "");
  const content = String(formData.get("content") || "").trim();
  const type = (String(formData.get("type") || "TEXT").toUpperCase() as MessageType);

  if (!tradeId || !content) {
    throw new Error("Message cannot be empty.");
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if (!trade || (trade.buyerId !== user.id && trade.sellerId !== user.id)) {
    throw new Error("You are not allowed to send messages in this trade.");
  }

  await prisma.tradeMessage.create({
    data: {
      tradeId,
      senderId: user.id,
      content,
      type,
    },
  });

  revalidatePath(`/p2p/trade/${tradeId}`);
}

export async function markPaymentSent(formData: FormData) {
  const user = await requireUser();
  const tradeId = String(formData.get("tradeId") || "");
  const receiptUrl = String(formData.get("receiptUrl") || "").trim();
  const note = String(formData.get("note") || "").trim();

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { buyer: true, seller: true },
  });
  if (!trade || trade.buyerId !== user.id) throw new Error("Only the buyer can mark payment sent.");
  if (trade.status !== TradeStatus.AWAITING_PAYMENT) throw new Error("Trade is not waiting for payment.");

  await prisma.trade.update({
    where: { id: tradeId },
    data: {
      status: TradeStatus.PAYMENT_SENT,
      receiptUrl: receiptUrl || null,
      messages: {
        create: [
          {
            senderId: user.id,
            type: MessageType.RECEIPT,
            content: receiptUrl || "Buyer marked payment sent.",
          },
          ...(note
            ? [
                {
                  senderId: user.id,
                  type: MessageType.TEXT,
                  content: note,
                },
              ]
            : []),
        ],
      },
    },
  });

  await notifyUser(
    trade.sellerId,
    "Buyer marked payment as sent",
    `Trade ${trade.id.slice(0, 8)} is ready for confirmation and crypto release.`,
    "TRADE_UPDATED",
  );

  revalidatePath(`/p2p/trade/${tradeId}`);
  revalidatePath("/p2p/dashboard");
}

export async function releaseCrypto(formData: FormData) {
  const user = await requireUser();
  const tradeId = String(formData.get("tradeId") || "");

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { buyer: true },
  });
  if (!trade || trade.sellerId !== user.id) {
    throw new Error("Only the seller can release crypto.");
  }
  if (trade.status !== TradeStatus.PAYMENT_SENT && trade.status !== TradeStatus.DISPUTED) {
    throw new Error("Trade must be payment-sent or disputed before release.");
  }

  await prisma.trade.update({
    where: { id: tradeId },
    data: {
      status: TradeStatus.RELEASED,
      messages: {
        create: {
          senderId: user.id,
          type: MessageType.SYSTEM,
          content: "Seller released crypto to buyer wallet.",
        },
      },
    },
  });

  await notifyUser(
    trade.buyerId,
    "Crypto released",
    `Trade ${trade.id.slice(0, 8)} was completed and released by seller.`,
    "TRADE_UPDATED",
  );

  revalidatePath(`/p2p/trade/${tradeId}`);
  revalidatePath("/p2p/dashboard");
}

export async function openDispute(formData: FormData) {
  const user = await requireUser();
  const tradeId = String(formData.get("tradeId") || "");
  const reason = String(formData.get("reason") || "").trim();

  if (!reason) throw new Error("Please provide a dispute reason.");

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade || (trade.buyerId !== user.id && trade.sellerId !== user.id)) {
    throw new Error("You cannot dispute this trade.");
  }

  const moderators = await prisma.user.findMany({
    where: { role: UserRole.MODERATOR },
    orderBy: { createdAt: "asc" },
    take: 5,
  });
  const assignedModerator = moderators[0] || null;

  await prisma.dispute.upsert({
    where: { tradeId },
    update: {
      reason,
      assignedModeratorId: assignedModerator?.id,
      status: DisputeStatus.OPEN,
      resolutionNote: null,
      resolvedAt: null,
    },
    create: {
      tradeId,
      openedByUserId: user.id,
      reason,
      assignedModeratorId: assignedModerator?.id,
    },
  });

  await prisma.trade.update({
    where: { id: tradeId },
    data: {
      status: TradeStatus.DISPUTED,
      messages: {
        create: {
          senderId: user.id,
          type: MessageType.SYSTEM,
          content: `Dispute opened: ${reason}`,
        },
      },
    },
  });

  if (assignedModerator) {
    await notifyUser(
      assignedModerator.id,
      "New dispute assigned",
      `Trade ${tradeId.slice(0, 8)} needs moderator attention.`,
      "DISPUTE_ASSIGNED",
    );
  }

  revalidatePath(`/p2p/trade/${tradeId}`);
  revalidatePath("/p2p/moderator/dashboard");
  revalidatePath("/p2p/admin/dashboard");
}

export async function applyForModerator(formData: FormData) {
  const user = await requireUser();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const idType = String(formData.get("idType") || "").trim();
  const idNumber = String(formData.get("idNumber") || "").trim();
  const experience = String(formData.get("experience") || "").trim();

  if (!fullName || !email || !country || !idType || !idNumber || !experience) {
    throw new Error("Please complete all moderator application fields.");
  }

  await prisma.moderatorApplication.upsert({
    where: { userId: user.id },
    update: {
      fullName,
      email,
      country,
      idType,
      idNumber,
      experience,
      status: ModeratorApplicationStatus.PENDING,
      reviewedAt: null,
      reviewedByUserId: null,
    },
    create: {
      userId: user.id,
      fullName,
      email,
      country,
      idType,
      idNumber,
      experience,
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      notifyUser(
        admin.id,
        "Moderator application submitted",
        `${fullName} submitted a new moderator application.`,
        "MODERATOR_APPLICATION",
      ),
    ),
  );

  revalidatePath("/p2p/moderator/apply");
  revalidatePath("/p2p/admin/dashboard");
}

export async function approveModeratorApplication(formData: FormData) {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) throw new Error("Only admins can approve moderators.");

  const applicationId = String(formData.get("applicationId") || "");

  const application = await prisma.moderatorApplication.update({
    where: { id: applicationId },
    data: {
      status: ModeratorApplicationStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedByUserId: user.id,
      user: {
        update: {
          role: UserRole.MODERATOR,
        },
      },
    },
    include: { user: true },
  });

  await notifyUser(
    application.userId,
    "Moderator application approved",
    "You now have moderator access to resolve disputes.",
    "MODERATOR_APPLICATION",
  );

  revalidatePath("/p2p/admin/dashboard");
  revalidatePath("/p2p/moderator/dashboard");
}

export async function rejectModeratorApplication(formData: FormData) {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) throw new Error("Only admins can reject moderators.");

  const applicationId = String(formData.get("applicationId") || "");
  const reason = String(formData.get("reason") || "Please update details and apply again.");

  const application = await prisma.moderatorApplication.update({
    where: { id: applicationId },
    data: {
      status: ModeratorApplicationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedByUserId: user.id,
    },
  });

  await notifyUser(
    application.userId,
    "Moderator application rejected",
    reason,
    "MODERATOR_APPLICATION",
  );

  revalidatePath("/p2p/admin/dashboard");
}

export async function claimDispute(formData: FormData) {
  const user = await requireUser();
  if (user.role !== UserRole.MODERATOR && user.role !== UserRole.ADMIN) {
    throw new Error("Only moderators can claim disputes.");
  }

  const disputeId = String(formData.get("disputeId") || "");
  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      assignedModeratorId: user.id,
      status: DisputeStatus.OPEN,
    },
  });

  revalidatePath("/p2p/moderator/dashboard");
  revalidatePath("/p2p/admin/dashboard");
}

export async function resolveDispute(formData: FormData) {
  const user = await requireUser();
  if (user.role !== UserRole.MODERATOR && user.role !== UserRole.ADMIN) {
    throw new Error("Only moderators can resolve disputes.");
  }

  const disputeId = String(formData.get("disputeId") || "");
  const resolutionNote = String(formData.get("resolutionNote") || "").trim();
  const releaseToBuyer = String(formData.get("releaseToBuyer") || "false") === "true";
  if (!resolutionNote) throw new Error("Resolution note is required.");

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { trade: true },
  });
  if (!dispute) throw new Error("Dispute not found.");

  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: DisputeStatus.RESOLVED,
      resolvedAt: new Date(),
      resolutionNote,
      assignedModeratorId: user.id,
    },
  });

  const nextStatus = releaseToBuyer ? TradeStatus.RELEASED : TradeStatus.CANCELLED;
  await prisma.trade.update({
    where: { id: dispute.tradeId },
    data: {
      status: nextStatus,
      messages: {
        create: {
          senderId: user.id,
          type: MessageType.SYSTEM,
          content: `Moderator resolution: ${resolutionNote}`,
        },
      },
    },
  });

  const trade = dispute.trade;
  await notifyUser(
    trade.buyerId,
    "Dispute resolved",
    `Dispute on trade ${trade.id.slice(0, 8)} was resolved by moderator.`,
    "TRADE_UPDATED",
  );
  await notifyUser(
    trade.sellerId,
    "Dispute resolved",
    `Dispute on trade ${trade.id.slice(0, 8)} was resolved by moderator.`,
    "TRADE_UPDATED",
  );

  revalidatePath("/p2p/moderator/dashboard");
  revalidatePath("/p2p/admin/dashboard");
  revalidatePath(`/p2p/trade/${trade.id}`);
}

export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  const notificationId = String(formData.get("notificationId") || "");
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.id,
    },
    data: {
      readAt: new Date(),
    },
  });
  revalidatePath("/p2p/dashboard");
  revalidatePath("/p2p/moderator/dashboard");
  revalidatePath("/p2p/admin/dashboard");
}

