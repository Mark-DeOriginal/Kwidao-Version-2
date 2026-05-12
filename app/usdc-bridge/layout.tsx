import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import "../wallet-connect-btn/styles/walletconnect-theme.css";

export const metadata: Metadata = {
  title: "USDC Bridge | Kwizerana DAO",
  description:
    "Bridge native USDC across leading EVM chains with Circle CCTP, secure routing, and transparent fee visibility.",
  openGraph: {
    title: "USDC Bridge | Kwizerana DAO",
    description:
      "Bridge native USDC across leading EVM chains with Circle CCTP, secure routing, and transparent fee visibility.",
    type: "website",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 1200,
        alt: "Kwizerana DAO USDC Bridge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "USDC Bridge | Kwizerana DAO",
    description:
      "Bridge native USDC across leading EVM chains with Circle CCTP, secure routing, and transparent fee visibility.",
    images: ["/opengraph-twitter.jpg"],
  },
};

export default function UsdcBridgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
