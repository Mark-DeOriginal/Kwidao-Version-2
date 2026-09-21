"use client";

import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Connect", description: "Link your wallet while keeping your keys and every final approval under your control." },
  { number: "02", title: "Explore", description: "Review live markets, research opportunities, and compare the tools relevant to your goal." },
  { number: "03", title: "Plan", description: "Evaluate risk, size positions, and compare potential outcomes before committing funds." },
  { number: "04", title: "Execute", description: "Bridge supported assets or put your strategy into action through a clear, guided workflow." },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[#F2EDFF] px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">How It Works</p>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">From insight to action, without the usual friction.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">A straightforward workflow helps you understand the opportunity, prepare the move, and remain in control at every step.</p>
        </motion.div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.article key={step.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.09, duration: 0.55 }} className="text-center lg:text-left">
              <p className="text-5xl font-light tracking-[-0.06em] text-[#A993BC]">{step.number}</p>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#30283B]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6A6272] md:text-[15px]">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
