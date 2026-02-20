"use client";

import { motion } from "framer-motion";

export default function SecuritySafetySection() {
  const features = [
    {
      icon: "🔐",
      title: "Non-Custodial",
      description: "Your wallet, your keys, your assets. We never hold funds.",
    },
    {
      icon: "✓",
      title: "Smart Contract Transparency",
      description: "All code audited and publicly verified on chain.",
    },
    {
      icon: "📚",
      title: "Risk Education",
      description: "Learn to identify and manage DeFi risks effectively.",
    },
    {
      icon: "🛡️",
      title: "Best Practices",
      description: "Follow security guidelines to protect your assets.",
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
            Security & Safety First
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c1c0bc] text-lg max-w-2xl mx-auto"
          >
            Trust is earned. We're committed to transparency and security.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-lg p-6 text-center hover:border-[#fff2b0]/30 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-[#fff2b0] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#c1c0bc]">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Security Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#363523]/80 to-[#2a2820]/80 border border-[#fff2b0]/20 rounded-xl p-8"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#fff2b0] mb-3">
                Audits
              </h4>
              <p className="text-[#c1c0bc]">
                Smart contract audits and security assessments coming soon.
                Transparency reports available.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#fff2b0] mb-3">
                Documentation
              </h4>
              <p className="text-[#c1c0bc]">
                Comprehensive technical documentation and API guides available
                in our docs portal.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#fff2b0] mb-3">
                Risk Disclaimer
              </h4>
              <p className="text-[#c1c0bc]">
                DeFi involves risk. Always do your own research and only invest
                what you can afford to lose.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
