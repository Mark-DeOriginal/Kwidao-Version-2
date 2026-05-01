"use client";

import { usePathname } from "next/navigation";

import Footer from "./Footer";
import Header from "./Header";

const IMMERSIVE_TOOL_PREFIXES = [
  "/tools/grid-bot",
  "/tools/market-analyzer",
  "/p2p",
  "/usdc-bridge",
];

export default function SiteShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isImmersiveTool = IMMERSIVE_TOOL_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  if (isImmersiveTool) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
