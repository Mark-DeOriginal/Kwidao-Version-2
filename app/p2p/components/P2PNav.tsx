import Link from "next/link";
import { UserRole } from "@prisma/client";

type Props = {
  role?: UserRole;
};

export default function P2PNav({ role }: Props) {
  return (
    <nav className="flex flex-wrap items-center gap-3 text-sm">
      <Link href="/p2p" className="rounded-lg border border-[color:var(--theme-border-subtle)] px-3 py-1.5 hover:bg-[var(--theme-surface-soft)]">
        P2P Home
      </Link>
      <Link href="/p2p/dashboard" className="rounded-lg border border-[color:var(--theme-border-subtle)] px-3 py-1.5 hover:bg-[var(--theme-surface-soft)]">
        User Dashboard
      </Link>
      <Link href="/p2p/moderator/apply" className="rounded-lg border border-[color:var(--theme-border-subtle)] px-3 py-1.5 hover:bg-[var(--theme-surface-soft)]">
        Become Moderator
      </Link>
      {(role === "MODERATOR" || role === "ADMIN") && (
        <Link href="/p2p/moderator/dashboard" className="rounded-lg border border-[color:var(--theme-border-subtle)] px-3 py-1.5 hover:bg-[var(--theme-surface-soft)]">
          Moderator Dashboard
        </Link>
      )}
      {role === "ADMIN" && (
        <Link href="/p2p/admin/dashboard" className="rounded-lg border border-[color:var(--theme-border-subtle)] px-3 py-1.5 hover:bg-[var(--theme-surface-soft)]">
          Admin Dashboard
        </Link>
      )}
    </nav>
  );
}

