"use client";

import { motion } from "framer-motion";

export default function TrustPartnersStrip() {
  const ecosystems = [
    { name: "Avalanche", logo: "⛓️" },
    { name: "Ethereum", logo: "♦️" },
    { name: "Solana", logo: "◎" },
    { name: "Sui", logo: "⬢" },
    { name: "Polygon", logo: "▲" },
  ];

  const protocols = [
    "Trader Joe",
    "Pharaoh",
    "Benqi",
    "GMX",
    "Aave",
    "Uniswap",
  ];

  return (
    <section className="py-12 px-4 md:px-8 bg-gradient-to-r from-[#363523]/50 via-[#2a2820]/30 to-[#363523]/50 border-y border-[#fff2b0]/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[#c1c0bc] text-sm uppercase tracking-widest font-semibold">
            Built for the Avalanche Ecosystem • Expanding Multichain
          </p>
        </div>

        <div className="space-y-8">
          {/* Ecosystems */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold mb-4">
              Supported Blockchains
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              {ecosystems.map((eco, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[#fff2b0]/20 bg-[#363523]/50"
                >
                  <span className="text-xl">{eco.logo}</span>
                  <span className="text-[#c1c0bc] font-medium">{eco.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Protocols */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold mb-4">
              Integrated Protocols
            </p>
            <div className="flex flex-wrap gap-2">
              {protocols.map((protocol, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1 rounded-full bg-[#fff2b0]/10 text-[#fff2b0] text-sm font-medium border border-[#fff2b0]/20"
                >
                  {protocol}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
