"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function ChainFallbackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M9.5 8.5 7 11a3 3 0 0 0 4.2 4.2l1.4-1.4m2-5L16 7.4a3 3 0 0 1 4.2 4.2l-2.4 2.4a3 3 0 0 1-4.2 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrustPartnersStrip() {
  const blockchainNames = ["Avalanche", "Ethereum", "Solana", "Sui", "Polygon"];
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const response = await fetch(
          "/api/blockchain-logos?blockchains=avalanche-2,ethereum,solana,sui,matic-network",
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
    <section className="border-y border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-primary-faint)] py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="theme-panel px-6 py-8 md:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="theme-kicker">Network Coverage</span>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--theme-primary)] md:text-4xl">
                Built for Avalanche, expanding across key ecosystems
              </h2>
              <p className="text-base leading-relaxed text-[var(--theme-text-muted)]">
                Kwidao stays visually calm here too: dark copy for readability,
                blue-violet for hierarchy, and warm accents only where they
                help guide attention.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[var(--theme-text-soft)]">
              <span className="theme-chip px-3 py-1.5">Multichain research</span>
              <span className="theme-chip-accent px-3 py-1.5">Protocol analytics</span>
              <span className="theme-chip px-3 py-1.5">Execution tooling</span>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--theme-primary-weak)]">
                Supported Blockchains
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {isLoadingLogos
                  ? [...Array(5)].map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="theme-card animate-pulse px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[color:var(--theme-border-soft)]" />
                          <div className="space-y-2">
                            <div className="h-3 w-24 rounded-full bg-[color:var(--theme-border-soft)]" />
                            <div className="h-3 w-16 rounded-full bg-[color:var(--theme-border-soft)]" />
                          </div>
                        </div>
                      </div>
                    ))
                  : ecosystems.map((eco, index) => (
                      <motion.div
                        key={eco.name}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="theme-card px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="theme-icon-badge h-10 w-10 rounded-xl">
                            {eco.logo ? (
                              <img
                                src={eco.logo}
                                alt={eco.name}
                                className="h-5 w-5 rounded-full object-cover"
                                loading="lazy"
                                onError={(event) => {
                                  (
                                    event.target as HTMLImageElement
                                  ).style.display = "none";
                                }}
                              />
                            ) : (
                              <ChainFallbackIcon />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--theme-text-strong)]">
                              {eco.name}
                            </p>
                            <p className="text-xs text-[var(--theme-text-soft)]">
                              Supported in market tracking
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--theme-primary-weak)]">
                Integrated Protocols
              </p>
              <div className="theme-card p-5">
                <div className="flex flex-wrap gap-3">
                  {protocols.map((protocol, index) => (
                    <motion.span
                      key={protocol}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className={
                        index % 3 === 1
                          ? "theme-chip-accent px-3 py-1.5 text-sm"
                          : "theme-chip px-3 py-1.5 text-sm"
                      }
                    >
                      {protocol}
                    </motion.span>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[var(--theme-text-muted)]">
                  The protocol list is styled as supporting metadata, not the
                  main headline. That keeps the strip polished and easier to
                  scan while still feeling alive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
