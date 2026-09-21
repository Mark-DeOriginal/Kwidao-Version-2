"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/app/components/icons/ArrowIcons";

type TopicFilter = "All" | "Yield Strategies" | "Risk Management" | "Onchain Research" | "Market Structure";

const TOPICS: TopicFilter[] = ["All", "Yield Strategies", "Risk Management", "Onchain Research", "Market Structure"];

const BLOG_INDEX = [
  { slug: "blockchain-technology-explained-simply", title: "Blockchain Technology, Explained Simply", subtitle: "A clear, practical guide to how blockchain actually works", description: "Understand blocks, consensus, and why decentralization matters without the jargon.", topic: "Onchain Research" as const, readTime: "9 min read", publishDate: "March 10, 2026", image: "/alpha-hub/blockchain.jpg" },
  { slug: "yield-generation-how-defi-really-works", title: "Yield Generation: How DeFi Really Works", subtitle: "The simple mechanics behind earning yield onchain", description: "Learn where yield comes from, which parts are stable, and what to avoid.", topic: "Yield Strategies" as const, readTime: "10 min read", publishDate: "March 9, 2026", image: "/alpha-hub/yield.jpg" },
  { slug: "custodial-wallets-benefits-and-tradeoffs", title: "Custodial Wallets: Benefits and Tradeoffs", subtitle: "Why some users choose them and how to use them safely", description: "A balanced look at custodial wallets, who they help, and what to watch.", topic: "Risk Management" as const, readTime: "8 min read", publishDate: "March 7, 2026", image: "/alpha-hub/custody.jpg" },
  { slug: "why-yield-vaults-attract-capital", title: "Why Yield Vaults Attract Capital", subtitle: "A simple view of how vault strategies compound returns", description: "Vaults automate strategy execution, but understanding the basics keeps you safe.", topic: "Yield Strategies" as const, readTime: "9 min read", publishDate: "March 5, 2026", image: "/alpha-hub/vaults.jpg" },
  { slug: "peer-to-peer-crypto-explained", title: "Peer-to-Peer Crypto, Explained", subtitle: "How direct trading works and when it makes sense", description: "A friendly guide to P2P trading, pricing, and basic safety checks.", topic: "Market Structure" as const, readTime: "7 min read", publishDate: "March 4, 2026", image: "/alpha-hub/p2p.jpg" },
  { slug: "analytics-dashboard-what-to-watch", title: "Analytics Dashboards: What to Watch", subtitle: "A simple way to interpret DeFi dashboards without the noise", description: "Key metrics that actually help you make decisions, explained clearly.", topic: "Onchain Research" as const, readTime: "8 min read", publishDate: "March 2, 2026", image: "/alpha-hub/analytics.jpg" },
];

export default function AlphaHubPage() {
  const [topic, setTopic] = useState<TopicFilter>("All");
  const filteredPosts = useMemo(() => topic === "All" ? BLOG_INDEX : BLOG_INDEX.filter((post) => post.topic === topic), [topic]);
  const featured = filteredPosts[0];
  const remaining = filteredPosts.slice(1);

  return (
    <main className="alpha-hub-page min-h-screen bg-white py-12 text-[#30283B] md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[#662E91] no-underline hover:text-[#542477]"><ArrowLeftIcon className="h-4 w-4 shrink-0" /> All tools</Link>

        <header className="mt-10 grid gap-8 border-b border-[#DDD4E3] pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#662E91]">Alpha Hub</p>
            <h1 className="mt-4 text-[clamp(2.35rem,4vw,3.7rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[#190B23]">Research for making more informed onchain decisions.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6A6272] md:text-lg">Practical explainers and strategy notes that turn market structure, yield mechanics, and protocol risk into useful context.</p>
          </div>
          <div className="grid grid-cols-2 border-y border-[#DDD4E3] py-5">
            <div><p className="text-2xl font-semibold text-[#190B23]">{BLOG_INDEX.length}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#92889A]">Guides</p></div>
            <div className="border-l border-[#DDD4E3] pl-6"><p className="text-2xl font-semibold text-[#190B23]">4</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#92889A]">Topics</p></div>
          </div>
        </header>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#E6DFEA] pb-4" aria-label="Filter articles by topic">
          {TOPICS.map((item) => {
            const active = item === topic;
            return <button key={item} type="button" onClick={() => setTopic(item)} className={`min-h-10 shrink-0 border px-4 text-sm font-semibold transition-colors ${active ? "border-[#662E91] bg-[#662E91] text-white" : "border-[#D4CADB] bg-white text-[#625A6A] hover:border-[#662E91] hover:text-[#662E91]"}`}>{item}</button>;
          })}
        </div>

        {featured ? (
          <section className="mt-10">
            <Link href={`/tools/alpha-hub/${featured.slug}`} className="group grid overflow-hidden border border-[#DDD4E3] bg-white no-underline lg:grid-cols-[1.08fr_0.92fr]">
              <div className="min-h-[320px] overflow-hidden bg-[#F2EDFF] lg:min-h-[430px]">
                <img src={featured.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
              </div>
              <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
                <div>
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]"><span className="text-[#662E91]">Featured</span><span className="h-px w-8 bg-[#CFC2D8]" /><span className="text-[#92889A]">{featured.topic}</span></div>
                  <h2 className="mt-7 text-[clamp(1.8rem,3vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#190B23] group-hover:text-[#662E91]">{featured.title}</h2>
                  <p className="mt-5 text-base leading-7 text-[#625A6A]">{featured.description}</p>
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-[#E6DFEA] pt-5 text-sm"><span className="text-[#92889A]">{featured.publishDate} · {featured.readTime}</span><span className="inline-flex items-center gap-2 font-semibold text-[#662E91]">Read article <ArrowUpRightIcon className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></div>
              </div>
            </Link>
          </section>
        ) : null}

        {remaining.length > 0 ? (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B739D]">Latest thinking</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#30283B]">Explore the library</h2></div><span className="text-sm text-[#92889A]">{filteredPosts.length} articles</span></div>
            <div className="grid border-t border-[#DDD4E3] lg:grid-cols-2">
              {remaining.map((post, index) => (
                <Link key={post.slug} href={`/tools/alpha-hub/${post.slug}`} className={`group grid grid-cols-[96px_1fr] gap-5 border-b border-[#DDD4E3] py-7 no-underline sm:grid-cols-[150px_1fr] ${index % 2 === 0 ? "lg:pr-8" : "lg:border-l lg:pl-8"}`}>
                  <div className="h-24 overflow-hidden bg-[#F2EDFF] sm:h-28"><img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B739D]"><span>{post.topic}</span><span>·</span><span>{post.readTime}</span></div><h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.025em] text-[#30283B] group-hover:text-[#662E91] sm:text-xl">{post.title}</h3><p className="mt-2 hidden text-sm leading-6 text-[#766D7E] sm:block">{post.subtitle}</p></div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
