"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const featuredTools = [
  { href: "/usdc-bridge", category: "Cross-chain", title: "USDC Bridge", description: "Move native USDC between supported networks through a clear, guided transfer flow." },
  { href: "/tools/defi-intelligence", category: "Intelligence", title: "DeFi Intelligence", description: "Compare markets, read heatmaps, track signals, and examine perpetual DEX activity." },
  { href: "/tools/market-analyzer", category: "Markets", title: "Market Analyzer", description: "Scan multiple chains with ranking signals, trending views, and focused chart drilldowns." },
  { href: "/tools/grid-bot", category: "Automation", title: "Grid Bot", description: "Model adaptive grid strategies with backtesting, wallet sync, and live price feeds." },
  { href: "/tools/position-sizer", category: "Risk", title: "Position Sizer", description: "Plan risk, leverage, liquidation distance, and trade size before entering a position." },
  { href: "/tools/yield-calculator", category: "Yield", title: "Yield Calculator", description: "Estimate compounded returns and compare potential yield outcomes over time." },
  { href: "/tools/alpha-hub", category: "Research", title: "Alpha Hub", description: "Read practical explainers, strategy research, and risk-aware DeFi market context." },
];

export default function ToolsPage() {
  return (
    <main className="bg-white px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Kwidao Tools</p>
          <h1 className="mt-5 text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.065em] text-[#190B23]">A clearer workspace for every DeFi decision.</h1>
          <p className="mt-7 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">Bridge assets, study market activity, test strategies, manage risk, and build knowledge from one connected toolkit.</p>
        </motion.header>

        <div className="mt-16 grid md:mt-24 md:grid-cols-2 md:gap-x-16">
          {featuredTools.map((tool, index) => (
            <motion.div key={tool.href} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 2) * 0.06 }}>
              <Link href={tool.href} className="group flex min-h-[210px] items-start justify-between gap-8 border-t border-[#DCD3E2] py-8 transition-colors hover:border-[#662E91]">
                <div>
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em]"><span className="text-[#A993BC]">{String(index + 1).padStart(2, "0")}</span><span className="text-[#662E91]">{tool.category}</span></div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#30283B] transition-colors group-hover:text-[#662E91] md:text-3xl">{tool.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#6A6272] md:text-[15px]">{tool.description}</p>
                </div>
                <span aria-hidden="true" className="mt-10 text-2xl text-[#662E91] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">&#8599;</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
