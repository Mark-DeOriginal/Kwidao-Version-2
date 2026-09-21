"use client";

import { motion } from "framer-motion";

const ecosystemFeatures = [
  {
    title: "Cross-Chain USDC",
    description:
      "Move native USDC between supported networks through a focused bridge experience built into Kwidao.",
    icon: "/icons/bridge-duotone.svg",
  },
  {
    title: "Market Intelligence",
    description:
      "Follow live prices, scan onchain activity, and turn fragmented market signals into clearer research.",
    icon: "/icons/chart-line-up-duotone.svg",
  },
  {
    title: "Strategy Toolkit",
    description:
      "Plan position sizes, compare yield outcomes, analyze markets, and test ideas before committing capital.",
    icon: "/icons/sliders-horizontal-duotone.svg",
  },
  {
    title: "Community & Rewards",
    description:
      "Learn with the community and stay connected to participation, governance, and future reward opportunities.",
    icon: "/icons/medal-duotone.svg",
  },
];

export default function EcosystemSection() {
  return (
    <section className="bg-[#F2EDFF] px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">
            The Kwidao Ecosystem
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">
            One connected workspace for your DeFi journey.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">
            Bridge assets, understand market activity, evaluate strategies, and stay connected to
            the Kwidao community without stitching together a different platform for every step.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-x-12">
          {ecosystemFeatures.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true, amount: 0.35 }}
              className="flex flex-col items-center px-3 text-center"
            >
              <img src={feature.icon} alt="" aria-hidden="true" className="h-14 w-14" />
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-[#30283B]">
                {feature.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#6A6272] md:text-[15px]">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
