import type { Metadata } from "next";
import LiveMarketPageClient from "../components/LiveMarketPageClient";

export const metadata: Metadata = {
  title: "Live Market | Kwizerana DAO",
  description:
    "Track live crypto prices, movers, and market trends across major assets in one professional market view.",
};

export default function LiveMarketPage() {
  return <LiveMarketPageClient />;
}
