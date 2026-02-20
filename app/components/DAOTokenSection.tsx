"use client";

import { motion } from "framer-motion";

export default function DAOTokenSection() {
  const utilities = [
    {
      icon: "🗳️",
      title: "Governance Voting",
      description: "Vote on protocol decisions and feature prioritization",
    },
    {
      icon: "💧",
      title: "Liquidity Incentives",
      description: "Earn rewards for providing liquidity and participating",
    },
    {
      icon: "🔑",
      title: "Premium Access",
      description:
        "Unlock exclusive tools, early features, and advanced analytics",
    },
    {
      icon: "📊",
      title: "Treasury Growth",
      description: "Benefits from protocol revenue and sustainable growth",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Token Flywheel */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#363523] to-[#2a2820] rounded-2xl p-8 border border-[#fff2b0]/10">
              <div className="aspect-square bg-gradient-to-br from-[#fff2b0]/10 to-transparent rounded-xl flex items-center justify-center relative">
                {/* Flywheel Diagram */}
                <div className="relative w-64 h-64">
                  {/* Center circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fff2b0]/30 to-[#fff2b0]/10 flex items-center justify-center">
                      <span className="text-3xl">$KWI</span>
                    </div>
                  </div>

                  {/* Outer circles */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0"
                  >
                    {["Users", "Yield", "Growth", "Value"].map((label, i) => {
                      const angle = (i / 4) * Math.PI * 2;
                      const x = Math.cos(angle) * 80;
                      const y = Math.sin(angle) * 80;
                      return (
                        <div
                          key={i}
                          className="absolute w-14 h-14 rounded-full bg-[#fff2b0]/20 border border-[#fff2b0]/40 flex items-center justify-center text-xs font-bold text-[#fff2b0]"
                          style={{
                            left: `calc(50% + ${x}px - 28px)`,
                            top: `calc(50% + ${y}px - 28px)`,
                          }}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-[#c1c0bc] mt-4">
              Token Utility Flywheel
            </p>
          </motion.div>

          {/* Right: Description */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#fff2b0] mb-4">
                $KWI Token
              </h2>
              <p className="text-lg text-[#c1c0bc] leading-relaxed">
                The Kwidao ecosystem token that aligns incentives across users,
                governance, and protocol growth.
              </p>
            </div>

            {/* Key Utilities */}
            <div className="space-y-3">
              {utilities.map((util, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg border border-[#fff2b0]/10 bg-[#363523]/50 hover:border-[#fff2b0]/30 transition-colors"
                >
                  <div className="text-2xl flex-shrink-0">{util.icon}</div>
                  <div>
                    <h4 className="font-bold text-[#fff2b0]">{util.title}</h4>
                    <p className="text-sm text-[#c1c0bc]">{util.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="px-6 py-3 bg-[#fff2b0] text-[#363523] font-bold rounded-lg hover:bg-[#fff2b0]/90 transition-colors inline-flex items-center gap-2">
              <span>Join the DAO</span>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
