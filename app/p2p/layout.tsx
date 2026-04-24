import Link from "next/link";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import ConnectWalletButton from "./components/ConnectWalletButton";
import { getSessionUser } from "@/lib/p2p/auth";
import "./p2p.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-p2p-ui",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-p2p-mono",
  subsets: ["latin"],
});

export default async function P2PLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <div className={`p2p-app ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <header className="p2p-topbar">
        <div className="p2p-topbar-inner">
          <Link href="/p2p" className="p2p-brand">
            <img src="/logo.svg" alt="Kwidao" className="p2p-brand-logo" />
            <span>Kwidao P2P</span>
          </Link>
          <nav className="p2p-nav-links">
            <Link href="/p2p/dashboard" className="p2p-nav-link">
              Dashboard
            </Link>
            <Link href="/p2p/moderator/apply" className="p2p-nav-link">
              Become Moderator
            </Link>
            {(user?.role === "MODERATOR" || user?.role === "ADMIN") && (
              <Link href="/p2p/moderator/dashboard" className="p2p-nav-link">
                Moderator
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/p2p/admin/dashboard" className="p2p-nav-link">
                Admin
              </Link>
            )}
          </nav>
          <div className="p2p-topbar-cta">
            <ConnectWalletButton walletAddress={user?.walletAddress} />
          </div>
        </div>
      </header>
      <div className="p2p-view">{children}</div>
    </div>
  );
}
