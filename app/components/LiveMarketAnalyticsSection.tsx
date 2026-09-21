"use client";

import { motion } from "framer-motion";

const opportunities = [
  { pool: "AVAX / USDC LP", protocol: "Trader Joe", apy: "18.5%", risk: "Medium", tvl: "$2.3M", fit: "Balanced carry with active liquidity demand." },
  { pool: "ETH / USDC LP", protocol: "Aave", apy: "12.3%", risk: "Low", tvl: "$5.1M", fit: "Defensive yield with stronger capital depth." },
  { pool: "AVAX Farming", protocol: "Pharaoh", apy: "24.7%", risk: "High", tvl: "$890K", fit: "Higher upside with greater emissions and volatility risk." },
  { pool: "SOL / USDC LP", protocol: "Marinade", apy: "15.2%", risk: "Medium", tvl: "$1.2M", fit: "Useful for traders rotating into liquid majors." },
  { pool: "SUI Staking", protocol: "Sui", apy: "9.1%", risk: "Low", tvl: "$3.4M", fit: "Clean exposure for lower-turnover positions." },
  { pool: "BENQI Lending", protocol: "Benqi", apy: "7.8%", risk: "Low", tvl: "$4.2M", fit: "Income-focused base layer for conservative allocation." },
];

const overviewStats = [
  { label: "Curated opportunities", value: "06" },
  { label: "Average displayed APY", value: "14.6%" },
  { label: "Lower-risk opportunities", value: "50%" },
];

const riskClass = (risk: string) => {
  if (risk === "Low") return "text-emerald-700 bg-emerald-50";
  if (risk === "High") return "text-rose-700 bg-rose-50";
  return "text-amber-700 bg-amber-50";
};

export default function LiveMarketAnalyticsSection() {
  return (
    <section className="home-content-section bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Yield Radar</p>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">
            Compare opportunities before you commit capital.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">
            Review indicative yields, liquidity, and risk side by side to build a stronger shortlist for further research.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 text-center sm:grid-cols-3 md:mt-20">
          {overviewStats.map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
              <p className="text-4xl font-semibold tracking-[-0.04em] text-[#662E91] md:text-5xl">{item.value}</p>
              <p className="mt-2 text-sm text-[#6A6272]">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-14 overflow-x-auto md:mt-16">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="border-b border-[#CFC5D6] text-left">
                {['Pool', 'Protocol', 'APY', 'Risk', 'TVL', 'Best fit'].map((heading) => (
                  <th key={heading} className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#796E81]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity, index) => (
                <motion.tr key={opportunity.pool} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.035 }} className="border-b border-[#E9E3ED] transition-colors hover:bg-[#F8F5FA]">
                  <td className="px-4 py-5 font-semibold text-[#30283B]">{opportunity.pool}</td>
                  <td className="px-4 py-5 text-sm text-[#625A6A]">{opportunity.protocol}</td>
                  <td className="px-4 py-5 font-mono font-semibold text-[#662E91]">{opportunity.apy}</td>
                  <td className="px-4 py-5"><span className={`inline-flex px-2.5 py-1 text-xs font-semibold ${riskClass(opportunity.risk)}`}>{opportunity.risk}</span></td>
                  <td className="px-4 py-5 text-sm font-medium text-[#30283B]">{opportunity.tvl}</td>
                  <td className="max-w-[280px] px-4 py-5 text-sm leading-6 text-[#6A6272]">{opportunity.fit}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 max-w-4xl text-sm leading-6 text-[#796E81]">
          <strong className="font-semibold text-[#30283B]">Risk note:</strong> Displayed APYs can change quickly. Always review smart-contract, liquidity, token, and emissions risk before entering a position.
        </motion.p>
      </div>
    </section>
  );
}
