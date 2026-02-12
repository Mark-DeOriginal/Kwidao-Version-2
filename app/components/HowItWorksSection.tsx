'use client';

import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Connect Wallet',
      description: 'Link your EVM-compatible wallet securely. Your private keys remain yours.',
      icon: '🔗',
    },
    {
      number: '2',
      title: 'Explore Strategies',
      description: 'Kwidao analyzes and recommends best yield opportunities for your profile.',
      icon: '🔍',
    },
    {
      number: '3',
      title: 'Deposit or Track',
      description: 'Deposit into vaults or monitor existing positions from your dashboard.',
      icon: '💼',
    },
    {
      number: '4',
      title: 'Earn Rewards',
      description: 'Earn yield on deposits + points toward airdrops and governance.',
      icon: '🏆',
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-[#2a2820]/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-[#fff2b0] mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c1c0bc] text-lg max-w-2xl mx-auto"
          >
            Get started in 4 simple steps
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection lines (desktop only) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#fff2b0]/20 via-[#fff2b0]/5 to-transparent"></div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-xl p-6 text-center h-full hover:border-[#fff2b0]/30 transition-colors">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gradient-to-br from-[#fff2b0] to-[#fff2b0]/70 flex items-center justify-center font-bold text-[#363523] text-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-[#fff2b0] mb-3">{step.title}</h3>
                <p className="text-sm text-[#c1c0bc] leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
