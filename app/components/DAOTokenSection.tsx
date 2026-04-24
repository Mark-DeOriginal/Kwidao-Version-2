"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type Allocation = {
  label: string;
  percent: number;
  color: string;
  description: string;
};

type Benefit = {
  title: string;
  description: string;
  tone: "cool" | "warm";
};

const allocations: Allocation[] = [
  {
    label: "Community",
    percent: 40,
    color: "var(--theme-primary)",
    description: "Airdrops, ecosystem grants, and long-term community rewards.",
  },
  {
    label: "Liquidity",
    percent: 20,
    color: "var(--theme-info)",
    description: "Liquidity support to keep trading depth healthy and resilient.",
  },
  {
    label: "Treasury",
    percent: 18,
    color: "var(--theme-accent)",
    description: "Protocol runway, research, and strategic growth initiatives.",
  },
  {
    label: "Team",
    percent: 12,
    color: "var(--theme-soft-accent)",
    description: "Core contributors with long-term vesting alignment.",
  },
  {
    label: "Advisors",
    percent: 10,
    color: "var(--theme-primary-strong)",
    description: "Strategic advisors, partnerships, and ecosystem support.",
  },
];

const benefits: Benefit[] = [
  {
    title: "Governance voting",
    description: "Help shape roadmap priorities, incentives, and treasury direction.",
    tone: "cool",
  },
  {
    title: "Liquidity incentives",
    description: "Access reward programs tied to productive participation onchain.",
    tone: "warm",
  },
  {
    title: "Premium access",
    description: "Unlock early tools, deeper analytics, and advanced features.",
    tone: "cool",
  },
  {
    title: "Treasury alignment",
    description: "Stay connected to protocol growth rather than short-lived hype.",
    tone: "warm",
  },
];

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    cx,
    cy,
    "L",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
};

function BenefitIcon({ tone }: { tone: Benefit["tone"] }) {
  const className = tone === "warm" ? "theme-icon-badge-warm" : "theme-icon-badge";

  return (
    <div className={`${className} h-12 w-12 rounded-xl`}>
      {tone === "warm" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 4.5v15m-5-5 5 5 5-5M7.5 8.5 12 4l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M6.5 12.5 10 16l7.5-8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export default function DAOTokenSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const arcs = useMemo(() => {
    let currentAngle = 0;
    return allocations.map((item) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + item.percent * 3.6;
      currentAngle = endAngle;
      return { startAngle, endAngle };
    });
  }, []);

  const active = allocations[activeIndex];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="theme-panel p-8 md:p-10"
          >
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-4">
                <span className="theme-kicker">Tokenomics</span>
                <h2 className="text-3xl font-bold tracking-tight text-[var(--theme-primary)] md:text-4xl">
                  $KWI allocation
                </h2>
              </div>
              <div className="rounded-full border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface-soft)] px-4 py-2 text-sm text-[var(--theme-text-muted)]">
                Total supply: 1,000,000,000
              </div>
            </div>

            <div className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
              <div className="relative flex items-center justify-center">
                <svg width="280" height="280" viewBox="0 0 280 280" aria-label="$KWI allocation">
                  {allocations.map((item, index) => {
                    const { startAngle, endAngle } = arcs[index];
                    const isActive = index === activeIndex;

                    return (
                      <path
                        key={item.label}
                        d={describeArc(140, 140, 126, startAngle, endAngle)}
                        fill={item.color}
                        opacity={isActive ? 0.98 : 0.68}
                        stroke="var(--theme-canvas)"
                        strokeWidth={3}
                        className="cursor-pointer transition-opacity duration-200"
                        onMouseEnter={() => setActiveIndex(index)}
                        onFocus={() => setActiveIndex(index)}
                      />
                    );
                  })}
                </svg>

                <div className="absolute flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface)] shadow-[var(--theme-shadow-soft)]">
                  <span className="text-3xl font-semibold text-[var(--theme-text-strong)]">
                    {active.percent}%
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--theme-text-soft)]">
                    {active.label}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[var(--theme-text-muted)]">
                  The chart carries more color, while the supporting text stays
                  grounded in dark neutrals. That keeps the token section visual
                  without making every word compete with the graphic.
                </p>

                <div className="grid gap-3">
                  {allocations.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onFocus={() => setActiveIndex(index)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          isActive
                            ? "border-[color:var(--theme-border-strong)] bg-[color:var(--theme-primary-soft)] shadow-[var(--theme-shadow-soft)]"
                            : "border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-contrast)] hover:border-[color:var(--theme-border-strong)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-1 h-3.5 w-3.5 rounded-full border border-white/60"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-[var(--theme-text-strong)]">
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-[var(--theme-text-muted)]">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[var(--theme-primary-strong)]">
                            {item.percent}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <span className="theme-kicker">Holder Benefits</span>
              <h3 className="text-3xl font-bold tracking-tight text-[var(--theme-primary)] md:text-4xl">
                Why hold $KWI
              </h3>
              <p className="leading-relaxed text-[var(--theme-text-muted)]">
                $KWI is framed as long-term participation, not just decoration.
                The benefit cards use darker copy and clearer icon contrast so
                the section feels elevated and easy to read.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="theme-card p-5">
                  <div className="flex items-start gap-4">
                    <BenefitIcon tone={benefit.tone} />
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--theme-text-strong)]">
                        {benefit.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--theme-text-muted)]">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
