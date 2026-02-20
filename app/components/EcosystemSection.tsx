"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link?: string;
}

function FeatureCard({ icon, title, description, link }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-xl p-6 hover:border-[#fff2b0]/30 transition-all hover:shadow-lg hover:shadow-[#fff2b0]/10"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-[#fff2b0] mb-2">{title}</h3>
      <p className="text-sm text-[#c1c0bc] mb-4 leading-relaxed">
        {description}
      </p>
      {link && (
        <Link
          href={link}
          className="inline-flex items-center gap-2 text-[#fff2b0] hover:text-[#fff2b0] text-xs font-semibold uppercase tracking-wider group"
        >
          Learn More
          <svg
            className="w-3 h-3 group-hover:translate-x-1 transition-transform"
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
      icon: "🤖",
      title: "Kwizerana AI",
      description:
        "AI analyzes liquidity flow and farming performance to identify optimal yield strategies across multiple chains.",
      link: "#",
    },
    {
      icon: "💰",
      title: "Yield Vaults",
      description:
        "Optimized liquidity pools and farming strategies you can deposit into with single-click transactions.",
      link: "#",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "Portfolio tracking, risk metrics, and real-time performance monitoring across all your positions.",
      link: "#",
    },
    {
      icon: "⭐",
      title: "Points & Rewards",
      description:
        "Earn points for activity → future airdrops, governance participation, and TGE eligibility.",
      link: "#",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-[#2a2820]/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-bold text-[#fff2b0] mb-4"
          >
            The Kwidao Ecosystem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c1c0bc] text-lg max-w-2xl mx-auto"
          >
            Comprehensive tools and strategies to maximize your DeFi returns
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
