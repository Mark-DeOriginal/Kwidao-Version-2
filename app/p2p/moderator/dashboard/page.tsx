import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/p2p/auth";
import { claimDispute, resolveDispute } from "../../actions";

function formatDate(input: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(input);
}

export default async function ModeratorDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/p2p");
  if (user.role !== "MODERATOR" && user.role !== "ADMIN") {
    redirect("/p2p/moderator/apply");
  }

  const disputes = await prisma.dispute.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      trade: {
        include: {
          buyer: true,
          seller: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="space-y-4">
      <section className="p2p-hero">
        <p className="p2p-eyebrow">Moderator control panel</p>
        <h1 className="p2p-title">Dispute Command Center</h1>
        <p className="p2p-subtitle">
          Claim pending conflicts, review evidence in trade rooms, and enforce final settlement outcomes.
        </p>
      </section>

      <section className="p2p-panel">
        <h2 className="p2p-section-title">Open Disputes</h2>
        <div className="mt-4 space-y-4">
          {disputes.length === 0 ? (
            <p className="text-sm p2p-muted">No pending disputes at the moment.</p>
          ) : (
            disputes.map((dispute) => {
              const assignedToMe = dispute.assignedModeratorId === user.id;
              return (
                <article
                  key={dispute.id}
                  className="p2p-card-compact"
                >
                  <div className="p2p-row">
                    <div>
                      <p className="text-sm font-medium">
                        Trade {dispute.trade.id.slice(0, 8)} | Buyer {dispute.trade.buyer.walletAddress.slice(0, 8)}...
                        {dispute.trade.buyer.walletAddress.slice(-4)} | Seller {dispute.trade.seller.walletAddress.slice(0, 8)}...
                        {dispute.trade.seller.walletAddress.slice(-4)}
                      </p>
                      <p className="text-sm p2p-muted">Reason: {dispute.reason}</p>
                      <p className="text-xs p2p-muted">
                        Opened {formatDate(dispute.createdAt)} | Assigned:{" "}
                        {dispute.assignedModeratorId
                          ? assignedToMe
                            ? "You"
                            : "Another moderator"
                          : "Unassigned"}
                      </p>
                    </div>
                    <Link
                      href={`/p2p/trade/${dispute.tradeId}`}
                      className="p2p-btn-secondary"
                    >
                      Open Trade
                    </Link>
                  </div>

                  {!assignedToMe && (
                    <form action={claimDispute} className="mt-3">
                      <input type="hidden" name="disputeId" value={dispute.id} />
                      <button type="submit" className="p2p-btn-secondary">
                        Claim Dispute
                      </button>
                    </form>
                  )}

                  {(assignedToMe || user.role === "ADMIN") && (
                    <form action={resolveDispute} className="mt-3 grid gap-3">
                      <input type="hidden" name="disputeId" value={dispute.id} />
                      <textarea
                        name="resolutionNote"
                        rows={3}
                        required
                        placeholder="Write your resolution decision and rationale."
                        className="p2p-textarea"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          name="releaseToBuyer"
                          value="true"
                          className="p2p-btn-primary"
                        >
                          Resolve and Release to Buyer
                        </button>
                        <button
                          type="submit"
                          name="releaseToBuyer"
                          value="false"
                          className="p2p-btn-secondary"
                        >
                          Resolve and Cancel Trade
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
