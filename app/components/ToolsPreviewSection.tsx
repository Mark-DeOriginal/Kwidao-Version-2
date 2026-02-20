"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  status: "coming-soon" | "active";
  link?: string;
}

function ToolCard({ icon, title, description, status, link }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <Link href={link || "#"}>
        <div className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-xl p-8 hover:border-[#fff2b0]/30 transition-all hover:shadow-lg hover:shadow-[#fff2b0]/10 cursor-pointer h-full flex flex-col">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-lg font-bold text-[#fff2b0] mb-2">{title}</h3>
          <p className="text-sm text-[#c1c0bc] mb-4 flex-grow">{description}</p>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                status === "coming-soon" ? "text-orange-400" : "text-green-400"
              }`}
            >
              {status === "coming-soon" ? "🔄 Coming Soon" : "✓ Live"}
            </span>
            {status === "active" && (
              <svg
                className="w-4 h-4 text-[#fff2b0]"
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
      icon: "🧮",
      title: "Yield Calculator",
      description:
        "Calculate potential returns across different yield strategies and timeframes.",
      status: "coming-soon" as const,
    },
    {
      icon: "📏",
      title: "Position Sizer",
      description:
        "Determine optimal position sizes based on risk tolerance and capital.",
      status: "coming-soon" as const,
    },
    {
      icon: "📈",
      title: "Portfolio Tracker",
      description:
        "Real-time monitoring of all your DeFi positions across chains.",
      status: "coming-soon" as const,
    },
    {
      icon: "⭐",
      title: "Rewards Dashboard",
      description: "Track earned points and eligibility for future airdrops.",
      status: "coming-soon" as const,
    },
    {
      icon: "🚀",
      title: "Alpha Hub",
      description:
        "Latest opportunities, research insights, and strategy guides.",
      status: "coming-soon" as const,
    },
    {
      icon: "🔐",
      title: "Risk Analyzer",
      description: "Smart contract and liquidity pool risk assessment tools.",
      status: "coming-soon" as const,
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-[#fff2b0] mb-4"
          >
            Powerful Tools & Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c1c0bc] text-lg max-w-2xl mx-auto"
          >
            Everything you need for DeFi success
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <ToolCard key={i} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
