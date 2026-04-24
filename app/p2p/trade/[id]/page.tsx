import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TradeStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/p2p/auth";
import { markPaymentSent, openDispute, releaseCrypto, sendTradeMessage } from "../../actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(input: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(input);
}

export default async function TradeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/p2p");

  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      buyer: true,
      seller: true,
      messages: {
        include: { sender: true },
        orderBy: { createdAt: "asc" },
      },
      dispute: true,
    },
  });

  if (!trade) notFound();
  if (trade.buyerId !== user.id && trade.sellerId !== user.id && user.role !== "ADMIN") {
    redirect("/p2p/dashboard");
  }

  const isBuyer = trade.buyerId === user.id;
  const isSeller = trade.sellerId === user.id;
  const canMarkPaid = isBuyer && trade.status === TradeStatus.AWAITING_PAYMENT;
  const canRelease = isSeller && (trade.status === TradeStatus.PAYMENT_SENT || trade.status === TradeStatus.DISPUTED);
  const canDispute =
    trade.status === TradeStatus.AWAITING_PAYMENT || trade.status === TradeStatus.PAYMENT_SENT;

  return (
    <main className="space-y-4">
      <section className="p2p-hero">
        <div className="p2p-row">
          <div>
            <p className="p2p-eyebrow">Trade Room</p>
            <h1 className="p2p-title">
              {trade.cryptoAmount.toString()} {trade.assetSymbol} for {trade.fiatAmount.toString()} {trade.fiatCurrency}
            </h1>
            <p className="p2p-subtitle">
              Status: {trade.status} | Buyer: {trade.buyer.walletAddress} | Seller: {trade.seller.walletAddress}
            </p>
          </div>
          <Link href="/p2p/dashboard" className="p2p-btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section className="p2p-grid-2">
        <article className="p2p-panel">
          <h2 className="p2p-section-title">Trade Actions</h2>

          {canMarkPaid && (
            <form action={markPaymentSent} className="mt-4 grid gap-3 p2p-card-compact">
              <input type="hidden" name="tradeId" value={trade.id} />
              <p className="text-sm font-medium">Mark fiat as sent</p>
              <input
                name="receiptUrl"
                placeholder="Receipt URL or payment reference"
                className="p2p-input"
              />
              <textarea
                name="note"
                rows={3}
                placeholder="Optional note for seller"
                className="p2p-textarea"
              />
              <button type="submit" className="p2p-btn-primary">
                I Sent the Fiat Payment
              </button>
            </form>
          )}

          {canRelease && (
            <form action={releaseCrypto} className="mt-4 p2p-card-compact">
              <input type="hidden" name="tradeId" value={trade.id} />
              <p className="text-sm font-medium">
                Seller confirmation
              </p>
              <p className="mt-1 text-sm p2p-muted">
                Confirm fiat receipt, then release crypto to buyer.
              </p>
              <button type="submit" className="p2p-btn-primary mt-3">
                Release Crypto
              </button>
            </form>
          )}

          {canDispute && (
            <form action={openDispute} className="mt-4 grid gap-3 p2p-card-compact">
              <input type="hidden" name="tradeId" value={trade.id} />
              <p className="text-sm font-medium">Open Dispute</p>
              <textarea
                name="reason"
                rows={3}
                required
                placeholder="Describe the problem so a moderator can help."
                className="p2p-textarea"
              />
              <button type="submit" className="p2p-btn-danger">
                Escalate to Moderator
              </button>
            </form>
          )}

          {trade.dispute && (
            <div className="mt-4 p2p-card-compact">
              <p className="text-sm font-medium">
                Dispute status: {trade.dispute.status}
              </p>
              <p className="text-sm p2p-muted">Reason: {trade.dispute.reason}</p>
              {trade.dispute.resolutionNote && (
                <p className="mt-1 text-sm p2p-muted">
                  Resolution: {trade.dispute.resolutionNote}
                </p>
              )}
            </div>
          )}
        </article>

        <article className="p2p-panel">
          <h2 className="p2p-section-title">Chat & Receipts</h2>
          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {trade.messages.map((message) => {
              const isMine = message.senderId === user.id;
              return (
                <div
                  key={message.id}
                  className={`rounded-xl border p-3 ${
                    isMine
                      ? "border-[#5fb4ad] bg-[#e4f4f2]"
                      : "border-[#c8d9e4] bg-[rgba(255,255,255,0.8)]"
                  }`}
                >
                  <p className="text-xs p2p-muted">
                    {message.type} | {message.sender.walletAddress.slice(0, 8)}...
                    {message.sender.walletAddress.slice(-4)} | {formatDate(message.createdAt)}
                  </p>
                  <p className="mt-1 text-sm break-words">{message.content}</p>
                </div>
              );
            })}
          </div>
          <form action={sendTradeMessage} className="mt-4 grid gap-3">
            <input type="hidden" name="tradeId" value={trade.id} />
            <select
              name="type"
              className="p2p-select"
              defaultValue="TEXT"
            >
              <option value="TEXT">Text Message</option>
              <option value="RECEIPT">Receipt</option>
            </select>
            <textarea
              name="content"
              rows={3}
              required
              placeholder="Send a message or payment confirmation detail..."
              className="p2p-textarea"
            />
            <button type="submit" className="p2p-btn-secondary">
              Send Message
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
