"use client";

import { motion } from "framer-motion";

const opportunities = [
  {
    pool: "AVAX / USDC LP",
    protocol: "Trader Joe",
    apy: "18.5%",
    risk: "Medium",
    tvl: "$2.3M",
    fit: "Balanced carry with active liquidity demand.",
  },
  {
    pool: "ETH / USDC LP",
    protocol: "Aave",
    apy: "12.3%",
    risk: "Low",
    tvl: "$5.1M",
    fit: "Defensive yield with stronger capital depth.",
  },
  {
    pool: "AVAX Farming",
    protocol: "Pharaoh",
    apy: "24.7%",
    risk: "High",
    tvl: "$890K",
    fit: "Higher upside, higher emissions and volatility risk.",
  },
  {
    pool: "SOL / USDC LP",
    protocol: "Marinade",
    apy: "15.2%",
    risk: "Medium",
    tvl: "$1.2M",
    fit: "Useful for traders rotating into liquid majors.",
  },
  {
    pool: "SUI Staking",
    protocol: "Sui",
    apy: "9.1%",
    risk: "Low",
    tvl: "$3.4M",
    fit: "Clean exposure for lower-turnover positions.",
  },
  {
    pool: "BENQI Lending",
    protocol: "Benqi",
    apy: "7.8%",
    risk: "Low",
    tvl: "$4.2M",
    fit: "Income-focused base layer for conservative allocation.",
  },
];

const overviewStats = [
  {
    label: "Curated Set",
    value: "06",
    description: "High-signal opportunities refreshed from supported venues.",
  },
  {
    label: "Avg APY",
    value: "14.6%",
    description: "A blended snapshot across the current featured list.",
  },
  {
    label: "Low-Risk Share",
    value: "50%",
    description: "Half of the list leans toward capital preservation.",
  },
];

const riskTone = (risk: string) => {
  switch (risk) {
    case "Low":
      return "theme-pill-positive";
    case "Medium":
      return "theme-pill-warning";
    case "High":
      return "theme-pill-negative";
    default:
      return "theme-pill-neutral";
  }
};

export default function LiveMarketAnalyticsSection() {
  return (
    <section className="bg-[color:var(--theme-surface-contrast)] py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="theme-kicker">Yield Radar</span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold tracking-tight text-[var(--theme-primary)] md:text-5xl"
            >
              Top yield opportunities with cleaner signal hierarchy
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-lg leading-relaxed text-[var(--theme-text-muted)]"
            >
              Blue leads the section title and key navigation cues. Pool names,
              descriptions, and metadata stay darker so the page feels more
              professional and easier to scan.
            </motion.p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {overviewStats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="theme-card p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--theme-text-strong)]">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--theme-text-muted)]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="theme-table-shell"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead>
                <tr className="border-b border-[color:var(--theme-border-subtle)]">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    Pool
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    Protocol
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    APY
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    Risk
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    TVL
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    Fit
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp, index) => (
                  <motion.tr
                    key={opp.pool}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-[color:var(--theme-border-subtle)] transition-colors hover:bg-[color:var(--theme-primary-faint)]"
                  >
                    <td className="px-5 py-5">
                      <div>
                        <p className="text-sm font-semibold text-[var(--theme-text-strong)]">
                          {opp.pool}
                        </p>
                        <p className="mt-1 text-xs text-[var(--theme-text-soft)]">
                          Live opportunity snapshot
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-sm text-[var(--theme-text-muted)]">
                      {opp.protocol}
                    </td>
                    <td className="px-5 py-5 text-right">
                      <span className="theme-pill-positive font-mono">
                        {opp.apy}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <span className={riskTone(opp.risk)}>{opp.risk}</span>
                    </td>
                    <td className="px-5 py-5 text-right text-sm font-medium text-[var(--theme-text-strong)]">
                      {opp.tvl}
                    </td>
                    <td className="px-5 py-5 text-sm leading-relaxed text-[var(--theme-text-muted)]">
                      {opp.fit}
                    </td>
                    <td className="px-5 py-5 text-center">
                      <button
                        type="button"
                        className="theme-button-secondary px-4 py-2 text-xs"
                      >
                        View setup
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-accent-soft)] px-5 py-4 text-sm leading-relaxed text-[var(--theme-text-muted)]"
        >
          <strong className="text-[var(--theme-text-strong)]">Risk note:</strong>{" "}
          APY changes quickly, and each venue carries smart contract, liquidity,
          and emissions risk. The table is styled to feel premium, but the
          diligence still matters.
        </motion.div>
      </div>
    </section>
  );
}
