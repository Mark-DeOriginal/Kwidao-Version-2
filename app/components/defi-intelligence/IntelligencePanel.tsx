"use client";

import { useMemo, useState } from "react";

import {
  AGENTS,
  DATA_SOURCES,
  QUICK_QUERIES,
  formatCompact,
} from "@/lib/defiIntelligence";

import SectionHeading from "./SectionHeading";

const RESPONSES: Record<string, string> = {
  def: "Routing your query to the KWIZERANA intelligence layer. Six agents are scanning on-chain data, TVL context, market signals, and news feeds.",
  tvl: "**DeFiLlama TVL Intelligence**\n\nAgent: onchain-intel -> DeFiLlama API\n\n- Total DeFi TVL: live monitoring\n- 7-day change: capital flow tracking\n- Avalanche TVL: ecosystem tracking\n\nUse the Compare tab to benchmark chain performance.",
  messari:
    "**Messari Deep Metrics - AVAX**\n\nAgent: onchain-intel -> Messari data model\n\n- NVT ratio\n- Real volume quality\n- Active addresses and dev activity\n\nLow NVT with strong active addresses usually signals healthier fundamentals.",
  dexscreener:
    "**DexScreener - New and Trending Tokens**\n\nAgent: market-data -> DexScreener API\n\n- New token pair discovery across chains\n- Liquidity, volume, and short-term momentum context\n\nSwitch to Signals to view the live hot pair feed.",
  perps:
    "**Perpetual DEX Rankings**\n\nAgent: onchain-intel -> derivatives exchange data\n\nTracks volume, open interest, fee schedules, and token/airdrop notes across perp venues.\n\nOpen the Perp DEXes tab for the full ranked table.",
  yield:
    "**Top AVAX Yield Context**\n\nAgent: onchain-intel\n\nTracks pool-level opportunity framing and risk notes for major AVAX DeFi venues.\n\nAlways verify contracts and risk before deploying capital.",
  stablecoin:
    "**Stablecoin Peg Health**\n\nAgent: onchain-intel\n\nMonitors peg stability and liquidity stress. Deviations above threshold should trigger defensive risk posture.",
  hack:
    "**DeFi Security Tracker**\n\nAgent: security-radar\n\nMonitors exploit categories: bridge attacks, oracle manipulation, access control issues, and rug patterns.",
  fear:
    "**Fear and Greed + NVT Composite**\n\nAgent: news-scanner + onchain-intel\n\nSentiment regime plus valuation context are available in the Signals tab.",
  trending:
    "**CoinGecko Trending Narrative**\n\nAgent: market-data\n\nHighlights retail attention flow. Use Heatmap and Compare for deeper follow-through analysis.",
  compare:
    "**Asset Comparison**\n\nUse Compare to evaluate 2-6 assets by 24h, 7d, 30d, market cap, and volume.",
  bot: "**Bot Status**\n\nGrid strategy status is tracked in the Grid Bot tool and related dashboards.",
  phar: "**PHAR - Pharaoh Exchange**\n\nAVAX ecosystem token context and liquidity behavior can be analyzed in Compare and Signals.",
  pharou: "**Pharou / P33 Context**\n\nCommunity token and liquidity behavior can be reviewed through Compare and live signals.",
  aero: "**AERO - Aerodrome Finance**\n\nBase ecosystem DEX token context can be benchmarked in Compare.",
  cmc: "**CoinMarketCap Reference**\n\nUse as supplementary market intelligence and cross-check with CoinGecko feeds.",
  moats: "**Moats Reward Snapshot**\n\nTracks fort-weight style reward context for relevant ecosystem tokens.",
  xau: "**Short Signal XAU/USD**\n\nStrategy layer checks trend gate, momentum state, and volatility confirmation.",
};

function renderResponse(content: string) {
  return content
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--theme-text-strong)">$1</strong>');
}

function findResponse(input: string) {
  const q = input.toLowerCase();
  if (q.includes("tvl") || q.includes("total value") || q.includes("capital flow")) return RESPONSES.tvl;
  if (q.includes("messari") || q.includes("nvt") || q.includes("real vol") || q.includes("dev commit")) return RESPONSES.messari;
  if (q.includes("dexscreen") || q.includes("dexscreener") || q.includes("new token") || q.includes("new pair")) return RESPONSES.dexscreener;
  if (q.includes("perp") || q.includes("perpetual") || q.includes("futures") || q.includes("open interest") || q.includes("funding rate")) return RESPONSES.perps;
  if (q.includes("coinmarketcap") || q.includes("cmc") || q.includes("market cap rank")) return RESPONSES.cmc;
  if (q.includes("phar") && !q.includes("pharou")) return RESPONSES.phar;
  if (q.includes("pharou") || q.includes("p33")) return RESPONSES.pharou;
  if (q.includes("aero") || q.includes("aerodrome")) return RESPONSES.aero;
  if (q.includes("yield") || q.includes("farm") || q.includes("apy") || q.includes("pool") || q.includes("liquidity")) return RESPONSES.yield;
  if (q.includes("stablecoin") || q.includes("peg") || q.includes("depeg")) return RESPONSES.stablecoin;
  if (q.includes("hack") || q.includes("exploit") || q.includes("security") || q.includes("breach")) return RESPONSES.hack;
  if (q.includes("moats") || q.includes("reward") || q.includes("hefe") || q.includes("fort")) return RESPONSES.moats;
  if (q.includes("xau") || q.includes("gold") || q.includes("short")) return RESPONSES.xau;
  if (q.includes("fear") || q.includes("greed") || q.includes("sentiment")) return RESPONSES.fear;
  if (q.includes("trending") || q.includes("narrative") || q.includes("retail")) return RESPONSES.trending;
  if (q.includes("compar") || q.includes("chart") || q.includes("graph") || q.includes("vs")) return RESPONSES.compare;
  if (q.includes("bot") || q.includes("grid") || q.includes("status")) return RESPONSES.bot;

  const avaxTokens = ["joe", "qi", "benqi", "traderjoe", "vit", "blaze", "balln", "wavax"];
  if (avaxTokens.some((token) => q.includes(token))) return RESPONSES.yield;

  const preview = input.length > 40 ? `${input.slice(0, 40)}...` : input;
  return `**No specific intelligence found for "${preview}"**\n\nTry one of these:\n- PHAR / P33 / AERO deep dives\n- TVL and capital flow context\n- Yield / APY / farms\n- Fear and Greed sentiment\n- Trending narratives\n- Perps and funding context\n- Stablecoin peg health\n- DeFi security tracker\n- Compare / chart / vs\n- DexScreener new pairs\n\nUse the Compare tab for live asset pricing.`;
}

export default function IntelligencePanel({ globalMarketCap }: { globalMarketCap: number | null }) {
  const [query, setQuery] = useState("");
  const [responseHtml, setResponseHtml] = useState(
    renderResponse("Ask anything - market signals, TVL context, comparisons, trends, and perp DEX rankings."),
  );
  const [typing, setTyping] = useState(false);

  const runQuery = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setTyping(true);
    const result = findResponse(text);
    const delay = result.includes("No specific intelligence") ? 600 : 1200;
    window.setTimeout(() => {
      setResponseHtml(renderResponse(result));
      setTyping(false);
    }, delay);
  };

  const stats = useMemo(
    () => [
      { label: "AI Agents", value: "6" },
      { label: "Data Sources", value: "8+" },
      { label: "Coverage", value: "24/7" },
      { label: "Total DeFi TVL", value: formatCompact(globalMarketCap) },
    ],
    [globalMarketCap],
  );

  return (
    <section className="space-y-6">
      <div className="di-panel">
        <SectionHeading
          eyebrow="6 Agents - DeFiLlama - DexScreener - CoinGecko - Perp DEXes"
          title="All DeFi tasks in one ask"
          description="Ask anything - market signals, on-chain TVL, research context, yield checks, stablecoin health, and live derivatives intelligence."
        />
        <div className="mt-8 max-w-4xl">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runQuery(query);
              }}
              placeholder="Ask KWIZERANA Intelligence anything..."
              className="theme-field h-14 w-full rounded-2xl px-5 pr-28 outline-none"
            />
            <button
              type="button"
              onClick={() => runQuery(query)}
              className="theme-button-primary absolute right-2 top-2 h-10 px-4 text-sm"
            >
              Ask
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_QUERIES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  runQuery(preset);
                }}
                className="theme-button-secondary px-3 py-2 text-xs"
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="theme-card mt-5 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">KWIZERANA Intelligence</p>
            {typing ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--theme-text-soft)]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--theme-text-soft)] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--theme-text-soft)] [animation-delay:300ms]" />
              </div>
            ) : (
              <div
                className="mt-3 text-sm leading-7 text-[var(--theme-text-soft)]"
                dangerouslySetInnerHTML={{ __html: responseHtml }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="theme-card rounded-2xl p-5 text-center">
            <p className="text-2xl font-semibold text-[var(--theme-text-strong)]">{stat.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--theme-primary-weak)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="di-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--theme-primary-weak)]">The Intelligence Layer</p>
        <h3 className="mt-3 text-3xl font-bold text-[var(--theme-text-strong)]">Six agents. One hive mind.</h3>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="theme-card rounded-2xl p-5">
              <h4 className="text-lg font-semibold text-[var(--theme-text-strong)]">{agent.name}</h4>
              <p className="mt-2 text-sm leading-7 text-[var(--theme-text-soft)]">{agent.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <span key={tag} className="theme-chip rounded-full px-2.5 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="di-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--theme-primary-weak)]">Data Sources</p>
        <h3 className="mt-3 text-3xl font-bold text-[var(--theme-text-strong)]">Every chain. Every signal.</h3>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map((source) => (
            <div key={source.name} className="theme-card rounded-2xl p-5">
              <p className="font-semibold text-[var(--theme-text-strong)]">{source.name}</p>
              <p className="mt-1 text-sm text-[var(--theme-text-soft)]">{source.type}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
