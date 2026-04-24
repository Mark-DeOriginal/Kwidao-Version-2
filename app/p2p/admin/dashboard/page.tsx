import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/p2p/auth";
import { approveModeratorApplication, rejectModeratorApplication } from "../../actions";

function formatDate(input: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(input);
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/p2p");
  if (user.role !== "ADMIN") redirect("/p2p/dashboard");

  const [applications, moderators, openDisputes] = await Promise.all([
    prisma.moderatorApplication.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "MODERATOR" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dispute.findMany({
      where: { status: "OPEN" },
      include: { trade: true, openedBy: true, assignedModerator: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <main className="space-y-4">
      <section className="p2p-hero">
        <p className="p2p-eyebrow">Admin controls</p>
        <h1 className="p2p-title">Platform Governance Console</h1>
        <p className="p2p-subtitle">
          Review moderator candidates and monitor dispute throughput across all active trades.
        </p>
      </section>

      <section className="p2p-panel">
        <h2 className="p2p-section-title">Pending Moderator Applications</h2>
        <div className="mt-4 space-y-4">
          {applications.length === 0 ? (
            <p className="text-sm p2p-muted">No pending applications.</p>
          ) : (
            applications.map((application) => (
              <article
                key={application.id}
                className="p2p-card-compact"
              >
                <p className="text-sm font-medium">{application.fullName}</p>
                <p className="text-sm p2p-muted">
                  Wallet: {application.user.walletAddress} | Email: {application.email}
                </p>
                <p className="text-sm p2p-muted">
                  Country: {application.country} | ID: {application.idType} - {application.idNumber}
                </p>
                <p className="mt-2 text-sm p2p-muted">{application.experience}</p>
                <p className="mt-1 text-xs p2p-muted">
                  Submitted {formatDate(application.createdAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={approveModeratorApplication}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <button type="submit" className="p2p-btn-primary">
                      Approve
                    </button>
                  </form>
                  <form action={rejectModeratorApplication} className="flex flex-wrap gap-2">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <input
                      name="reason"
                      defaultValue="Application rejected. Please provide clearer verification details and reapply."
                      className="p2p-input"
                    />
                    <button type="submit" className="p2p-btn-danger">
                      Reject
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="p2p-grid-2">
        <article className="p2p-panel">
          <h2 className="p2p-section-title">Active Moderators</h2>
          <div className="mt-3 space-y-2">
            {moderators.length === 0 ? (
              <p className="text-sm p2p-muted">No approved moderators yet.</p>
            ) : (
              moderators.map((moderator) => (
                <p key={moderator.id} className="p2p-card-compact text-sm p2p-muted">
                  {moderator.walletAddress}
                </p>
              ))
            )}
          </div>
        </article>

        <article className="p2p-panel">
          <h2 className="p2p-section-title">Open Disputes Overview</h2>
          <div className="mt-3 space-y-2">
            {openDisputes.length === 0 ? (
              <p className="text-sm p2p-muted">No unresolved disputes.</p>
            ) : (
              openDisputes.map((dispute) => (
                <p key={dispute.id} className="p2p-card-compact text-sm p2p-muted">
                  Trade {dispute.tradeId.slice(0, 8)} opened by {dispute.openedBy.walletAddress.slice(0, 8)}...
                  {dispute.openedBy.walletAddress.slice(-4)} | Assigned:{" "}
                  {dispute.assignedModerator ? dispute.assignedModerator.walletAddress.slice(0, 8) : "none"}
                </p>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
