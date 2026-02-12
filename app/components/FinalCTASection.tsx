'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-[#2a2820]/50 to-[#363523]/80 border-t border-[#fff2b0]/10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-[#fff2b0] leading-[1.1]">
            Start Your DeFi Journey<br />With Confidence
          </h2>

          {/* Subtext */}
          <p className="text-lg text-[#c1c0bc] max-w-2xl mx-auto">
            Whether you're a DeFi beginner or an experienced trader, Kwidao has the tools and guidance you need to maximize your yield safely.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
          >
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#fff2b0] text-[#363523] font-bold rounded-lg hover:bg-[#fff2b0]/90 transition-colors text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Wallet Now
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#fff2b0]/30 text-[#fff2b0] font-bold rounded-lg hover:border-[#fff2b0]/50 hover:bg-[#fff2b0]/5 transition-colors text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 01-5 0V12m0 0V9.5a2.5 2.5 0 015 0V12" />
              </svg>
              Join Whitelist
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-8 border-t border-[#fff2b0]/10 mt-8"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🔐</div>
                <p className="text-sm text-[#c1c0bc]">
                  <strong className="text-[#fff2b0]">Non-Custodial</strong><br />
                  Your keys, your funds
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm text-[#c1c0bc]">
                  <strong className="text-[#fff2b0]">Transparent</strong><br />
                  All code audited
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🌍</div>
                <p className="text-sm text-[#c1c0bc]">
                  <strong className="text-[#fff2b0]">Multichain</strong><br />
                  5+ blockchains
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
