"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link?: string;
  tone?: "cool" | "warm";
}

function FeatureCard({ icon, title, description, link, tone = "cool" }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="theme-card p-6"
    >
      <div className={tone === "warm" ? "theme-icon-badge-warm" : "theme-icon-badge"}>{icon}</div>
      <h3 className="mt-5 text-lg font-bold text-[var(--theme-text-strong)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--theme-text-soft)]">{description}</p>
      {link && (
        <Link
          href={link}
          className="theme-inline-link group mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Learn More
          <svg
            className="h-3 w-3 transition-transform group-hover:translate-x-1"
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
        </Link>
      )}
    </motion.div>
  );
}

export default function EcosystemSection() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path d="M12 4v4M7 7l2.5 2.5M17 7 14.5 9.5M5 12h4M15 12h4M8 16.5A5.5 5.5 0 0 0 12 18a5.5 5.5 0 0 0 4-1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      title: "Kwizerana AI",
      description:
        "AI-assisted insights help surface cleaner yield routes, market context, and faster decisions across chains.",
      link: "#",
      tone: "cool" as const,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path d="M4 9.5 12 5l8 4.5M4 9.5V15L12 19l8-4V9.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 5v14" strokeLinecap="round" />
        </svg>
      ),
      title: "Yield Vaults",
      description:
        "Access curated vault ideas and cleaner allocation paths without piecing together every move manually.",
      link: "#",
      tone: "warm" as const,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path d="M4 18h16M6 15V9M10 15V6M14 15v-3M18 15V8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Analytics Dashboard",
      description:
        "Track portfolio state, sentiment, and opportunity signals inside a visual language that stays readable.",
      link: "#",
      tone: "cool" as const,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path d="m12 4 2.3 4.6 5.1.7-3.7 3.6.9 5.1L12 15.6 7.4 18l.9-5.1-3.7-3.6 5.1-.7L12 4Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Points & Rewards",
      description:
        "Participation, learning, and product usage can ladder into future governance and reward moments.",
      link: "#",
      tone: "warm" as const,
    },
  ];

  return (
    <section className="bg-[color:var(--theme-surface-contrast)] px-4 py-20 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <div className="theme-kicker mx-auto w-fit">Ecosystem</div>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-4 text-3xl md:text-5xl font-bold text-[var(--theme-primary)] mb-4"
          >
            The Kwidao Ecosystem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-[var(--theme-text-soft)]"
          >
            Cooler headline tones, darker readable copy, and cleaner cards make the product feel
            more composed across every section.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
