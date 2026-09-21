"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const featuredArticles = [
  { title: "Blockchain Technology, Explained Simply", description: "A clear, practical guide to blocks, consensus, and why decentralization matters.", date: "March 10, 2026", category: "Education", slug: "blockchain-technology-explained-simply" },
  { title: "Yield Generation: How DeFi Really Works", description: "Learn where yield comes from, which parts are sustainable, and which risks deserve attention.", date: "March 9, 2026", category: "Yield Strategies", slug: "yield-generation-how-defi-really-works" },
  { title: "Custodial Wallets: Benefits and Tradeoffs", description: "A straightforward look at convenience, security, and when custody may make sense.", date: "March 7, 2026", category: "Wallets", slug: "custodial-wallets-benefits-and-tradeoffs" },
];

export default function EducationAlphaHubSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setError("Please enter your name and email.");
      setIsLoading(false);
      return;
    }
    const [firstName, ...rest] = trimmedName.split(/\s+/);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: firstName, surname: rest.join(" ") || "Community", email: trimmedEmail }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
      setName("");
      setEmail("");
      window.setTimeout(() => setSubmitted(false), 3500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="home-content-section bg-[#F2EDFF]">
      <div className="mx-auto grid w-full max-w-[1600px] gap-16 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-12 xl:px-16">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Education & Alpha</p>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#190B23]">Research you can put to work.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">Get practical explainers, strategy briefs, and risk-aware market context delivered without the noise.</p>

          <form onSubmit={handleSubscribe} className="mt-10 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[#30283B]">Full name</span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" required className="mt-2 w-full border-0 border-b border-[#BCAECA] bg-transparent px-0 py-3 text-[#30283B] outline-none transition-colors placeholder:text-[#92889A] focus:border-[#662E91] focus:ring-0" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#30283B]">Email address</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="mt-2 w-full border-0 border-b border-[#BCAECA] bg-transparent px-0 py-3 text-[#30283B] outline-none transition-colors placeholder:text-[#92889A] focus:border-[#662E91] focus:ring-0" />
            </label>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <button type="submit" disabled={isLoading} className="mt-2 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#662E91] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#542477] disabled:opacity-60">
              {isLoading ? "Joining..." : submitted ? "You're in — check your inbox" : "Subscribe to weekly briefs"}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Featured Reads</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#190B23]">Latest notes</h3>
            </div>
            <Link href="/tools/alpha-hub" className="text-sm font-semibold text-[#662E91] hover:text-[#542477]">View all <span aria-hidden="true">&#8594;</span></Link>
          </div>
          <div className="mt-8">
            {featuredArticles.map((article, index) => (
              <motion.div key={article.slug} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} className="border-t border-[#CFC5D6] last:border-b">
              <Link href={`/tools/alpha-hub/${article.slug}`} className="group block py-7">
                <div className="flex items-center justify-between gap-4 text-xs text-[#796E81]"><span className="font-semibold uppercase tracking-[0.14em] text-[#662E91]">{article.category}</span><span>{article.date}</span></div>
                <h4 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#30283B] transition-colors group-hover:text-[#662E91]">{article.title}</h4>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6A6272]">{article.description}</p>
              </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
