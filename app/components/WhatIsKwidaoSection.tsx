"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    title: "Discover Yields",
    description: "Surface higher-quality opportunities across chains without manually piecing together every signal.",
    tone: "cool" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <circle cx="11" cy="11" r="5.5" />
        <path d="m15.5 15.5 4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Optimize Strategies",
    description: "Bring planning, sizing, and research into one flow so each decision has more context behind it.",
    tone: "warm" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M12 4v5M12 15v5M4 12h5M15 12h5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
  },
  {
    title: "Earn Rewards",
    description: "Stay aligned with points, governance, and launch opportunities while keeping the interface clear.",
    tone: "cool" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="m12 4 2.3 4.6 5.1.7-3.7 3.6.9 5.1L12 15.6 7.4 18l.9-5.1-3.7-3.6 5.1-.7L12 4Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function WhatIsKwidaoSection() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="theme-panel overflow-hidden p-4 md:p-6">
              <div className="aspect-square overflow-hidden rounded-[1.4rem]">
                <img
                  src="/yield-image.webp"
                  alt="People engaging with decentralized finance tools"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <div className="theme-kicker w-fit">Why Kwidao</div>
              <h2 className="mb-4 mt-4 text-4xl md:text-5xl font-bold text-[var(--theme-primary)]">
                Research, tools, and execution in one place.
              </h2>
              <p className="text-lg leading-relaxed text-[var(--theme-text-soft)]">
                Kwidao is a DeFi workspace built to help you discover, analyze, and act with more
                structure. The visual system stays light and professional while the most important
                actions keep a cooler brand emphasis.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="theme-card p-4"
                >
                  <div className="flex gap-4">
                    <div className={pillar.tone === "warm" ? "theme-icon-badge-warm" : "theme-icon-badge"}>
                      {pillar.icon}
                    </div>
                    <div>
                      <h4 className="mb-1 font-bold text-[var(--theme-text-strong)]">{pillar.title}</h4>
                      <p className="text-sm leading-6 text-[var(--theme-text-soft)]">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
