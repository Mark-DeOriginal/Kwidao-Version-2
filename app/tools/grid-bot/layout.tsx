import type { Metadata } from "next";

import "./grid-bot.css";

export const metadata: Metadata = {
  title: "Grid Bot | Kwidao Tools",
  description:
    "Adaptive grid automation dashboard with live price feeds, backtesting, and wallet sync.",
};

export default function GridBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
