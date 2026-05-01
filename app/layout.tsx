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
    "Kwidao is a DeFi platform that helps you earn yields riskfree, safely and efficiently.",
  openGraph: {
    title: "Kwizerana DAO",
    description:
      "Kwidao is a DeFi platform that helps you earn yields riskfree, safely and efficiently.",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 1200,
        alt: "Kwidao Open Graph Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Kwidao is a DeFi platform that helps you earn yields riskfree, safely and efficiently.",
    description: "Kwizerana DAO",
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
        {/* Social preview meta tags */}
        <meta property="og:image" content="/opengraph.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:image:alt" content="Kwidao Open Graph Image" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/opengraph-twitter.jpg" />
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
