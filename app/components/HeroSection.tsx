"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const heroHighlights = [
  {
    title: "Live market clarity",
    description:
      "Follow price action, opportunities, and signal changes without bouncing between tabs.",
    tone: "cool" as const,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
      >
        <path
          d="M4 18 10 12l4 4 6-8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 6h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Safer execution",
    description:
      "Use structured tools to plan risk, compare yield paths, and make cleaner decisions.",
    tone: "warm" as const,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
      >
        <path
          d="M12 3 5 6v5c0 4.5 2.9 8.4 7 9.8 4.1-1.4 7-5.3 7-9.8V6l-7-3Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m9.5 12 1.7 1.7 3.3-3.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Professional workflow",
    description:
      "Research, automation, and planning tools are designed to feel consistent across the app.",
    tone: "cool" as const,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
      >
        <rect x="4" y="5" width="16" height="14" rx="3" strokeLinecap="round" />
        <path d="M8 10h8M8 14h5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.16,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7 },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 68%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 68%, transparent 100%)",
        }}
      >
        {/* <div className="absolute left-[4%] top-[-2.5rem] h-72 w-72 rounded-full bg-[color:var(--theme-info-soft)] opacity-90 blur-[88px]" /> */}
        {/* <div className="absolute right-[2%] top-2 h-64 w-64 rounded-full bg-[color:var(--theme-spotlight-warm)] opacity-80 blur-[92px]" /> */}
        <div className="absolute left-1/2 top-20 h-52 w-[40rem] -translate-x-1/2 rounded-full bg-[color:var(--theme-spotlight-warm)] opacity-60 blur-[110px]" />
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="theme-kicker">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--theme-accent)]" />
            Built For Safer DeFi Decisions
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-bold leading-[0.92] tracking-[-0.04em] text-[var(--theme-primary)] md:text-7xl lg:text-[5.2rem]">
              Earn Better Yields
              <br />
              <span className="text-[var(--theme-text-strong)]">
                with More Clarity
              </span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--theme-text-soft)] md:text-xl">
              Kwidao brings research, live market context, and execution tools
              into one calmer workflow, so you can act with confidence instead
              of guessing through DeFi noise.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/waitlist"
              className="theme-button-primary px-6 py-3.5 text-sm md:text-base"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Join Waitlist
            </Link>
            <Link
              href="/tools"
              className="theme-button-secondary px-6 py-3.5 text-sm md:text-base"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M4 8h7M13 8h7M8 4v8M16 12v8M4 16h7M13 16h7"
                  strokeLinecap="round"
                />
              </svg>
              Explore Tools
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3 pt-2"
          >
            <span className="theme-chip px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              Live analytics
            </span>
            <span className="theme-chip px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              Risk planning
            </span>
            <span className="theme-chip-accent px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              Strategy workflows
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.28 }}
          className="relative"
        >
          <div className="theme-card overflow-hidden p-6 md:p-7">
            <div className="rounded-[1.4rem] border border-[color:var(--theme-border-subtle)] bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,255,255,0.48))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--theme-primary)]">
                Inside The Platform
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--theme-text-strong)]">
                A cleaner command center for research, markets, and execution.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--theme-text-soft)]">
                We combine cooler brand tones with stronger ink-based typography
                so the important actions stand out without the interface feeling
                loud.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {heroHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.35rem] border border-[color:var(--theme-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={
                        item.tone === "warm"
                          ? "theme-icon-badge-warm"
                          : "theme-icon-badge"
                      }
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[var(--theme-text-strong)]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-[var(--theme-text-soft)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
