"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const allocations = [
  { label: "Community", percent: 40, color: "#662E91", description: "Airdrops, ecosystem grants, and long-term community rewards." },
  { label: "Liquidity", percent: 20, color: "#4F6FD8", description: "Liquidity support designed to strengthen market depth." },
  { label: "Treasury", percent: 18, color: "#DD9B73", description: "Protocol runway, research, and strategic growth initiatives." },
  { label: "Team", percent: 12, color: "#CAC3E7", description: "Core contributors aligned through long-term vesting." },
  { label: "Advisors", percent: 10, color: "#3E1C58", description: "Strategic partnerships and ecosystem support." },
];

const benefits = [
  { title: "Governance voting", description: "Help shape roadmap priorities, incentives, and treasury direction." },
  { title: "Liquidity incentives", description: "Participate in reward programs connected to useful onchain activity." },
  { title: "Premium access", description: "Access early tools, deeper analytics, and advanced product features." },
  { title: "Ecosystem alignment", description: "Take part in the long-term growth of the Kwidao ecosystem." },
];

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
};

const describeArc = (startAngle: number, endAngle: number) => {
  const start = polarToCartesian(140, 140, 126, endAngle);
  const end = polarToCartesian(140, 140, 126, startAngle);
  return ["M", 140, 140, "L", start.x, start.y, "A", 126, 126, 0, endAngle - startAngle <= 180 ? 0 : 1, 0, end.x, end.y, "Z"].join(" ");
};

export default function DAOTokenSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const arcs = useMemo(() => {
    let current = 0;
    return allocations.map((allocation) => {
      const arc = { start: current, end: current + allocation.percent * 3.6 };
      current = arc.end;
      return arc;
    });
  }, []);
  const active = allocations[activeIndex];

  return (
    <section className="home-content-section bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Kwidao DAO</p>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">Designed for long-term participation.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">The proposed $KWI model aligns community participation, ecosystem liquidity, product development, and sustainable protocol growth.</p>
        </motion.div>

        <div className="mt-16 grid items-center gap-14 md:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative mx-auto flex w-full max-w-[420px] items-center justify-center">
            <svg className="h-auto w-full" viewBox="0 0 280 280" aria-label="$KWI proposed token allocation">
              {allocations.map((allocation, index) => (
                <path key={allocation.label} d={describeArc(arcs[index].start, arcs[index].end)} fill={allocation.color} opacity={index === activeIndex ? 1 : 0.62} stroke="white" strokeWidth="3" tabIndex={0} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} className="cursor-pointer transition-opacity" />
              ))}
            </svg>
            <div className="absolute flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white shadow-[0_14px_45px_rgba(56,31,70,0.13)]">
              <span className="text-4xl font-semibold tracking-[-0.04em] text-[#662E91]">{active.percent}%</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#796E81]">{active.label}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-end justify-between gap-6">
              <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#662E91]">Proposed allocation</p><h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#190B23]">1,000,000,000 $KWI</h3></div>
            </div>
            <div className="mt-7">
              {allocations.map((allocation, index) => (
                <motion.button key={allocation.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.045 }} type="button" onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className={`flex w-full items-start gap-4 border-t py-5 text-left transition-colors last:border-b ${index === activeIndex ? "border-[#662E91]" : "border-[#E4DDE9] hover:border-[#A993BC]"}`}>
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: allocation.color }} />
                  <span className="flex-1"><span className="font-semibold text-[#30283B]">{allocation.label}</span><span className="mt-1 block text-sm leading-6 text-[#6A6272]">{allocation.description}</span></span>
                  <span className="font-mono font-semibold text-[#662E91]">{allocation.percent}%</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div key={benefit.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <p className="text-xs font-semibold text-[#A993BC]">0{index + 1}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-[#30283B]">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6A6272]">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
