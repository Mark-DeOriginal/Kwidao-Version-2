import type { Metadata } from "next";
import "./kwizerana.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Market Analyzer | Kwidao Tools",
  description:
    "Kwizerana market analyzer with multi-chain scanning, pair ranking, and chart views.",
};

export default function KwizeranaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
