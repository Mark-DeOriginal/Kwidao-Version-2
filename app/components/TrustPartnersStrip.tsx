"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TrustPartnersStrip() {
  const blockchainNames = ["Avalanche", "Ethereum", "Solana", "Sui", "Polygon"];
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const response = await fetch(
          `/api/blockchain-logos?blockchains=avalanche-2,ethereum,solana,sui,matic-network`,
          {
            method: "GET",
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setLogos(result.data);
        }
      } catch (error) {
        console.error("Failed to load blockchain logos:", error);
      } finally {
        setIsLoadingLogos(false);
      }
    };

    loadLogos();
  }, []);

  const ecosystems = blockchainNames.map((name) => ({
    name,
    logo: logos[name],
  }));

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
              {isLoadingLogos
                ? // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[#fff2b0]/20 bg-[#363523]/50 animate-pulse"
                    >
                      <div className="w-6 h-6 bg-[#c1c0bc]/20 rounded-full"></div>
                      <div className="h-4 bg-[#c1c0bc]/20 rounded w-20"></div>
                    </div>
                  ))
                : ecosystems.map((eco, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[#fff2b0]/20 bg-[#363523]/50 hover:border-[#fff2b0]/40 transition-colors"
                    >
                      {eco.logo ? (
                        <img
                          src={eco.logo}
                          alt={eco.name}
                          className="w-6 h-6 rounded-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-lg opacity-30">◆</span>
                      )}
                      <span className="text-[#c1c0bc] font-medium text-sm">
                        {eco.name}
                      </span>
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
