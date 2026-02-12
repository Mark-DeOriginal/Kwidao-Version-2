'use client';

import { motion } from 'framer-motion';

export default function WhatIsKwidaoSection() {
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#363523] to-[#2a2820] rounded-2xl p-8 border border-[#fff2b0]/10">
              <div className="aspect-square bg-gradient-to-br from-[#fff2b0]/20 to-[#fff2b0]/5 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl">📊</div>
                  <div className="text-3xl">🤖</div>
                  <div className="text-6xl">💰</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#fff2b0] mb-4">
                What is Kwidao?
              </h2>
              <p className="text-lg text-[#c1c0bc] leading-relaxed">
                Kwidao is a decentralized platform that finds, analyzes, and optimizes yield opportunities across multiple blockchains. Using AI models and on-chain data, Kwidao helps users farm, track, and manage DeFi positions from one dashboard instead of navigating multiple protocols.
              </p>
            </div>

            {/* Three Pillars */}
            <div className="space-y-4 pt-4">
              {[
                {
                  icon: '🔍',
                  title: 'Discover Yields',
                  desc: 'Real-time scanning of protocols across chains for optimal opportunities',
                },
                {
                  icon: '⚙️',
                  title: 'Optimize Strategies',
                  desc: 'AI-powered recommendations tailored to your risk profile',
                },
                {
                  icon: '🎁',
                  title: 'Earn Rewards',
                  desc: 'Points toward airdrops and governance participation',
                },
              ].map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg border border-[#fff2b0]/10 bg-[#363523]/50 hover:border-[#fff2b0]/30 transition-colors"
                >
                  <div className="text-2xl flex-shrink-0">{pillar.icon}</div>
                  <div>
                    <h4 className="font-bold text-[#fff2b0] mb-1">{pillar.title}</h4>
                    <p className="text-sm text-[#c1c0bc]">{pillar.desc}</p>
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
