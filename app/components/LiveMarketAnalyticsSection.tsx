"use client";

import { motion } from "framer-motion";

export default function LiveMarketAnalyticsSection() {
  const opportunities = [
    {
      pool: "AVAX/USDC LP",
      protocol: "Trader Joe",
      apy: "18.5%",
      risk: "Medium",
      tvl: "$2.3M",
      status: "active",
    },
    {
      pool: "ETH/USDC LP",
      protocol: "Aave",
      apy: "12.3%",
      risk: "Low",
      tvl: "$5.1M",
      status: "active",
    },
    {
      pool: "AVAX Farming",
      protocol: "Pharaoh",
      apy: "24.7%",
      risk: "High",
      tvl: "$890K",
      status: "active",
    },
    {
      pool: "SOL/USDC LP",
      protocol: "Marinade",
      apy: "15.2%",
      risk: "Medium",
      tvl: "$1.2M",
      status: "active",
    },
    {
      pool: "SUI Staking",
      protocol: "Sui",
      apy: "9.1%",
      risk: "Low",
      tvl: "$3.4M",
      status: "active",
    },
    {
      pool: "BENQI Lending",
      protocol: "Benqi",
      apy: "7.8%",
      risk: "Low",
      tvl: "$4.2M",
      status: "active",
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "High":
        return "text-red-400";
      default:
        return "text-[#c1c0bc]";
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-[#2a2820]/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-[#fff2b0] mb-4"
          >
            Top Yield Opportunities
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#c1c0bc] text-lg"
          >
            Real-time opportunities across supported protocols. Scroll for more.
          </motion.p>
        </div>

        {/* Table / Grid View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-y-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fff2b0]/10">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold">
                  Pool
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold">
                  Protocol
                </th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold">
                  APY
                </th>
                <th className="px-4 py-3 text-center text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold">
                  Risk
                </th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold">
                  TVL
                </th>
                <th className="px-4 py-3 text-center text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#fff2b0]/5 hover:bg-[#363523]/50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm font-semibold text-[#fff2b0]">
                    {opp.pool}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#c1c0bc]">
                    {opp.protocol}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-right">
                    <span className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full font-mono">
                      {opp.apy}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className={`font-semibold ${getRiskColor(opp.risk)}`}>
                      {opp.risk}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-[#c1c0bc] font-mono">
                    {opp.tvl}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="text-[#fff2b0] hover:text-[#fff2b0]/80 text-xs font-bold uppercase tracking-wider transition-colors">
                      View →
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-lg bg-[#363523]/50 border border-[#fff2b0]/10 text-sm text-[#c1c0bc]"
        >
          <strong className="text-[#fff2b0]">Disclaimer:</strong> APY rates are
          subject to change and carry smart contract risk. Always perform your
          own research and risk assessment before depositing.
        </motion.div>
      </div>
    </section>
  );
}
