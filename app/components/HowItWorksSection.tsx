"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Connect Wallet",
    description: "Link your wallet securely while keeping your keys and final approvals in your control.",
    tone: "cool" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M9 12a3 3 0 0 1 3-3h4" strokeLinecap="round" />
        <path d="M15 8h2a3 3 0 1 1 0 6h-2" strokeLinecap="round" />
        <path d="M9 8H7a3 3 0 1 0 0 6h2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Explore Strategies",
    description: "Scan opportunities, compare tools, and understand what matters before taking action.",
    tone: "cool" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <circle cx="11" cy="11" r="5.5" />
        <path d="m15.5 15.5 4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Deposit or Track",
    description: "Move into vaults or monitor positions from a single workflow instead of fragmented tabs.",
    tone: "warm" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "4",
    title: "Earn Rewards",
    description: "Grow yield while staying plugged into product updates, governance, and reward opportunities.",
    tone: "warm" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M12 4 7 7v5c0 3.6 2.3 6.8 5 8 2.7-1.2 5-4.4 5-8V7l-5-3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12.5 11.5 14 14.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[color:var(--theme-surface-contrast)] px-4 py-20 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <div className="theme-kicker mx-auto w-fit">How It Works</div>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-4 mt-4 text-4xl md:text-5xl font-bold text-[var(--theme-primary)]"
          >
            Clearer steps, calmer execution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-[var(--theme-text-soft)]"
          >
            The journey is simple on purpose: connect, understand, choose, and move with more
            confidence.
          </motion.p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-11 hidden h-px bg-gradient-to-r from-[color:var(--theme-primary-soft-strong)] via-[color:var(--theme-accent-fill)] to-[color:var(--theme-info-soft)] md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="relative"
            >
              <div className="theme-card h-full p-6">
                <div className="flex items-center justify-between">
                  <div className={step.tone === "warm" ? "theme-icon-badge-warm" : "theme-icon-badge"}>
                    {step.icon}
                  </div>
                  <div className="theme-chip-accent min-w-[2.4rem] justify-center rounded-full px-3 py-1 text-center text-xs font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="mt-5 text-xl font-bold text-[var(--theme-text-strong)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--theme-text-soft)]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
