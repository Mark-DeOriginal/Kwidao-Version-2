"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ToolCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  status: "coming-soon" | "active";
  link: string;
}

function ToolCard({ icon, title, description, status, link }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <Link href={link}>
        <div className="theme-card h-full cursor-pointer p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center theme-icon-badge">
            {icon}
          </div>
          <h3 className="mb-2 text-lg font-bold text-[var(--theme-text-strong)]">{title}</h3>
          <p className="mb-5 flex-grow text-sm leading-6 text-[var(--theme-text-soft)]">{description}</p>
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                status === "coming-soon" ? "theme-chip-accent" : "theme-chip"
              }`}
            >
              {status === "coming-soon" ? "Coming Soon" : "Open"}
            </span>
            {status === "active" && (
              <svg
                className="h-4 w-4 text-[var(--theme-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ToolsPreviewSection() {
  const tools = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M4 8h12" />
          <path d="M14 5l4 3-4 3" />
          <path d="M20 16H8" />
          <path d="M10 13l-4 3 4 3" />
        </svg>
      ),
      title: "Market Analyzer",
      description:
        "Multi-chain scanner with ranking signals, trending pairs, and chart drilldowns.",
      status: "active" as const,
      link: "/tools/market-analyzer",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 3v18" />
          <path d="M6 7h12" />
          <path d="M6 17h12" />
          <path d="M8 7l-2 2 2 2" />
          <path d="M16 17l2-2-2-2" />
        </svg>
      ),
      title: "Grid Bot",
      description:
        "Adaptive accumulation dashboard with live prices, backtests, and wallet sync.",
      status: "active" as const,
      link: "/tools/grid-bot",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M4 5h12a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3V5z" />
          <path d="M7 5v14" />
          <path d="M10 9h6" />
          <path d="M10 13h6" />
        </svg>
      ),
      title: "Position Sizer",
      description:
        "Determine optimal position sizes based on risk tolerance and capital.",
      status: "active" as const,
      link: "/tools/position-sizer",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M4 19h16" />
          <path d="M6 16V9" />
          <path d="M10 16V5" />
          <path d="M14 16v-4" />
          <path d="M18 16V7" />
        </svg>
      ),
      title: "Yield Calculator",
      description:
        "Estimate outcomes across yield strategies and compare return scenarios.",
      status: "active" as const,
      link: "/tools/yield-calculator",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M4 5h12a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3V5z" />
          <path d="M7 5v14" />
          <path d="M10 9h6" />
          <path d="M10 13h6" />
        </svg>
      ),
      title: "Alpha Hub",
      description:
        "Latest opportunities, research insights, and strategy guides.",
      status: "active" as const,
      link: "/tools/alpha-hub",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="theme-kicker mx-auto w-fit">Tool Stack</div>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-4 text-4xl md:text-5xl font-bold text-[var(--theme-primary)] mb-4"
          >
            Powerful Tools & Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--theme-text-soft)] text-lg max-w-2xl mx-auto"
          >
            A professional toolkit for planning, monitoring, and acting with more confidence.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {tools.map((tool, i) => (
            <ToolCard key={i} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
