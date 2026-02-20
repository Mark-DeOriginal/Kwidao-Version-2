"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative py-24 px-4 md:px-8 overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#fff2b0]/30 bg-[#fff2b0]/5"
          >
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs tracking-wide text-[#fff2b0] font-medium">
              Powered by Kwizerana Finance
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#fff2b0] leading-[0.9] tracking-tight"
          >
            Earn Smarter Yield
            <br />
            Across Chains
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-[#c1c0bc] max-w-2xl leading-relaxed"
          >
            AI-powered tools, analytics, and strategies that help you safely
            discover, analyze, and earn yield in DeFi across multiple
            blockchains.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#fff2b0] text-[#363523] font-bold rounded-lg hover:bg-[#fff2b0]/90 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Connect Wallet
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#fff2b0]/30 text-[#fff2b0] font-bold rounded-lg hover:border-[#fff2b0]/50 hover:bg-[#fff2b0]/5 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              Explore Tools
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#fff2b0]/30 text-[#fff2b0] font-bold rounded-lg hover:border-[#fff2b0]/50 hover:bg-[#fff2b0]/5 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H6m0 0H0"
                />
              </svg>
              Join Whitelist
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
