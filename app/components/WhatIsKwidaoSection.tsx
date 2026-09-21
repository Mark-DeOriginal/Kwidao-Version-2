"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    title: "Bridge Across Networks",
    description: "Move USDC between supported chains through one guided flow, without juggling separate bridge interfaces.",
    icon: "/icons/bridge-duotone.svg",
  },
  {
    title: "Read Markets Clearly",
    description: "Follow live prices, scan onchain opportunities, and use focused research to see where markets are moving.",
    icon: "/icons/chart-line-up-duotone.svg",
  },
  {
    title: "Act With Better Context",
    description: "Size positions, compare yield scenarios, and test strategies with practical tools built into the same workspace.",
    icon: "/icons/sliders-horizontal-duotone.svg",
  },
];

export default function WhatIsKwidaoSection() {
  return (
    <section className="home-content-section relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Why Kwidao</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">
            Move, understand, and put your capital to work.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">
            Kwidao brings cross-chain USDC transfers, live market data, DeFi research, and
            practical strategy tools into one workspace—so you can spend less time switching
            between platforms and make your next move with better context.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-14">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, amount: 0.35 }}
                  className="group flex flex-col items-center px-4 text-center md:px-7 lg:px-10"
                >
                  <img src={pillar.icon} alt="" aria-hidden="true" className="h-14 w-14" />
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#30283B]">{pillar.title}</h3>
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#6A6272] md:text-[15px]">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
