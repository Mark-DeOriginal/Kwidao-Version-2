import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/p2p/auth";
import { applyForModerator } from "../../actions";

export default async function ModeratorApplyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/p2p");

  const existing = await prisma.moderatorApplication.findUnique({
    where: { userId: user.id },
  });

  return (
    <main className="space-y-4">
      <section className="p2p-hero">
        <p className="p2p-eyebrow">Moderator onboarding</p>
        <h1 className="p2p-title">Apply To Resolve P2P Disputes</h1>
        <p className="p2p-subtitle">
          Submit verification and moderation experience details. Admin review is required before dispute
          access is granted.
        </p>
      </section>

      {existing && (
        <section className="p2p-panel">
          <p className="text-sm p2p-muted">
            Current application status:{" "}
            <span className="font-semibold text-[#112433]">{existing.status}</span>
          </p>
        </section>
      )}

      <section className="p2p-panel">
        <form action={applyForModerator} className="grid gap-3">
          <input
            name="fullName"
            required
            defaultValue={existing?.fullName || ""}
            placeholder="Full legal name"
            className="p2p-input"
          />
          <input
            name="email"
            type="email"
            required
            defaultValue={existing?.email || ""}
            placeholder="Email for moderator communication"
            className="p2p-input"
          />
          <input
            name="country"
            required
            defaultValue={existing?.country || ""}
            placeholder="Country of residence"
            className="p2p-input"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="idType"
              required
              defaultValue={existing?.idType || ""}
              placeholder="ID type (Passport, National ID...)"
              className="p2p-input"
            />
            <input
              name="idNumber"
              required
              defaultValue={existing?.idNumber || ""}
              placeholder="ID number"
              className="p2p-input"
            />
          </div>
          <textarea
            name="experience"
            rows={5}
            required
            defaultValue={existing?.experience || ""}
            placeholder="Describe your moderation / customer support / P2P dispute experience"
            className="p2p-textarea"
          />
          <button type="submit" className="p2p-btn-primary">
            Submit Application
          </button>
        </form>
      </section>
    </main>
  );
}
