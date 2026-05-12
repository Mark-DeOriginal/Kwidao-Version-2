import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import SiteShell from "./components/SiteShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Kwizerana DAO",
  description:
    "Kwizerana DAO is a DeFi platform for secure yield opportunities, portfolio intelligence, and cross-chain USDC flows.",
  openGraph: {
    title: "Kwizerana DAO",
    description:
      "Kwizerana DAO is a DeFi platform for secure yield opportunities, portfolio intelligence, and cross-chain USDC flows.",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 1200,
        alt: "Kwizerana DAO Open Graph Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kwizerana DAO",
    description:
      "Kwizerana DAO is a DeFi platform for secure yield opportunities, portfolio intelligence, and cross-chain USDC flows.",
    images: ["/opengraph-twitter.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Optional runtime script for analytics or integrations */}
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>
          <SiteShell>{children}</SiteShell>
        </ClientBody>
      </body>
    </html>
  );
}
