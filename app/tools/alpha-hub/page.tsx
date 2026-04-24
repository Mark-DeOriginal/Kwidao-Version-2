"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TopicFilter =
  | "All"
  | "Yield Strategies"
  | "Risk Management"
  | "Onchain Research"
  | "Market Structure";

const TOPICS: TopicFilter[] = [
  "All",
  "Yield Strategies",
  "Risk Management",
  "Onchain Research",
  "Market Structure",
];

const BLOG_INDEX = [
  {
    slug: "blockchain-technology-explained-simply",
    title: "Blockchain Technology, Explained Simply",
    subtitle: "A clear, practical guide to how blockchain actually works",
    description:
      "Understand blocks, consensus, and why decentralization matters without the jargon.",
    topic: "Onchain Research" as const,
    readTime: "9 min read",
    publishDate: "March 10, 2026",
    image:
      "/alpha-hub/blockchain.jpg",
  },
  {
    slug: "yield-generation-how-defi-really-works",
    title: "Yield Generation: How DeFi Really Works",
    subtitle: "The simple mechanics behind earning yield onchain",
    description:
      "Learn where yield comes from, which parts are stable, and what to avoid.",
    topic: "Yield Strategies" as const,
    readTime: "10 min read",
    publishDate: "March 9, 2026",
    image:
      "/alpha-hub/yield.jpg",
  },
  {
    slug: "custodial-wallets-benefits-and-tradeoffs",
    title: "Custodial Wallets: Benefits and Tradeoffs",
    subtitle: "Why some users choose them and how to use them safely",
    description:
      "A balanced look at custodial wallets, who they help, and what to watch.",
    topic: "Risk Management" as const,
    readTime: "8 min read",
    publishDate: "March 7, 2026",
    image:
      "/alpha-hub/custody.jpg",
  },
  {
    slug: "why-yield-vaults-attract-capital",
    title: "Why Yield Vaults Attract Capital",
    subtitle: "A simple view of how vault strategies compound returns",
    description:
      "Vaults automate strategy execution, but understanding the basics keeps you safe.",
    topic: "Yield Strategies" as const,
    readTime: "9 min read",
    publishDate: "March 5, 2026",
    image:
      "/alpha-hub/vaults.jpg",
  },
  {
    slug: "peer-to-peer-crypto-explained",
    title: "Peer-to-Peer Crypto, Explained",
    subtitle: "How direct trading works and when it makes sense",
    description:
      "A friendly guide to P2P trading, pricing, and basic safety checks.",
    topic: "Market Structure" as const,
    readTime: "7 min read",
    publishDate: "March 4, 2026",
    image:
      "/alpha-hub/p2p.jpg",
  },
  {
    slug: "analytics-dashboard-what-to-watch",
    title: "Analytics Dashboards: What to Watch",
    subtitle: "A simple way to interpret DeFi dashboards without the noise",
    description:
      "Key metrics that actually help you make decisions, explained clearly.",
    topic: "Onchain Research" as const,
    readTime: "8 min read",
    publishDate: "March 2, 2026",
    image:
      "/alpha-hub/analytics.jpg",
  },
];

export default function AlphaHubPage() {
  const [topic, setTopic] = useState<TopicFilter>("All");

  const filteredPosts = useMemo(() => {
    if (topic === "All") {
      return BLOG_INDEX;
    }
    return BLOG_INDEX.filter((post) => post.topic === topic);
  }, [topic]);

  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/#" className="text-sm text-[var(--theme-primary)] hover:underline inline-block">
          Back to home
        </Link>

        <div className="bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-surface-contrast)] border border-[color:var(--theme-border-subtle)] rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--theme-primary)] mb-2">
            Alpha Hub
          </h1>
          <p className="text-[var(--theme-text-muted)] mb-8">
            Read deep-dive research across yield strategy, risk management,
            onchain research, and market structure.
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {TOPICS.map((item) => {
              const isActive = item === topic;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isActive
                      ? "bg-[var(--theme-primary)] text-[var(--theme-canvas)] border-[var(--theme-primary)]"
                      : "bg-[var(--theme-surface-contrast)] text-[var(--theme-primary)] border-[color:var(--theme-border-strong)] hover:border-[color:var(--theme-primary)]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/tools/alpha-hub/${post.slug}`}
                className="group rounded-xl overflow-hidden border border-[color:var(--theme-border-subtle)] bg-[var(--theme-surface-contrast)] hover:border-[color:var(--theme-primary)] transition-colors"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-[color:var(--theme-primary-soft)] text-[var(--theme-primary)]">
                      {post.topic}
                    </span>
                    <span className="text-[color:var(--theme-text-soft)]">{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--theme-primary)] leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[var(--theme-text-soft)]">{post.subtitle}</p>
                  <p className="text-sm text-[color:var(--theme-text-soft)]">{post.description}</p>
                  <p className="text-xs text-[color:var(--theme-text-soft)]">{post.publishDate}</p>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <p className="text-sm text-[var(--theme-text-muted)] mt-4">
              No articles found for this topic.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


