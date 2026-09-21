"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRightIcon } from "./icons/ArrowIcons";

const tools = [
  { title: "USDC Bridge", description: "Move native USDC between supported networks through a guided cross-chain transfer flow.", link: "/usdc-bridge" },
  { title: "Market Analyzer", description: "Scan multiple chains, rank market signals, and inspect trending pairs with focused chart views.", link: "/tools/market-analyzer" },
  { title: "Grid Bot", description: "Model adaptive accumulation strategies with live prices, backtests, and wallet-aware monitoring.", link: "/tools/grid-bot" },
  { title: "Position Sizer", description: "Calculate position sizes around your available capital, entry, invalidation point, and risk tolerance.", link: "/tools/position-sizer" },
  { title: "Yield Calculator", description: "Estimate returns and compare yield scenarios before allocating funds to a strategy.", link: "/tools/yield-calculator" },
  { title: "Alpha Hub", description: "Read practical explainers, market research, and strategy notes built for clearer decisions.", link: "/tools/alpha-hub" },
];

export default function ToolsPreviewSection() {
  return (
    <section className="home-content-section bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Kwidao Tools</p>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">Practical tools for better-informed decisions.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">Move from market discovery to position planning with tools designed to reduce guesswork and keep essential context close.</p>
        </motion.div>

        <div className="mt-16 grid md:mt-20 md:grid-cols-2 md:gap-x-14">
          {tools.map((tool, index) => (
            <motion.div key={tool.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <Link href={tool.link} className="group flex min-h-[176px] items-start justify-between gap-8 border-t border-[#DCD3E2] py-7 transition-colors hover:border-[#662E91]">
                <div>
                  <p className="text-xs font-semibold tabular-nums text-[#A993BC]">0{index + 1}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#30283B] transition-colors group-hover:text-[#662E91]">{tool.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-[#6A6272] md:text-[15px]">{tool.description}</p>
                </div>
                <ArrowUpRightIcon className="mt-7 h-6 w-6 shrink-0 text-[#662E91] transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
