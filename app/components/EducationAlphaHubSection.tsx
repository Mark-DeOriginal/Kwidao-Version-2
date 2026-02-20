"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function EducationAlphaHubSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate subscription
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const articles = [
    {
      title: "DeFi Yield Farming 101: Getting Started Safely",
      description:
        "A comprehensive guide for beginners on understanding yield farming, risks, and best practices.",
      date: "Feb 10, 2025",
      category: "Education",
    },
    {
      title: "Market Alert: Current Opportunities in Avalanche Ecosystem",
      description:
        "Analysis of the latest high-yield farming opportunities with risk assessments.",
      date: "Feb 9, 2025",
      category: "Market Insights",
    },
    {
      title: "Smart Contract Security: Protecting Your Assets",
      description:
        "What to look for in audit reports and how to evaluate protocol safety.",
      date: "Feb 8, 2025",
      category: "Security",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-[#2a2820]/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Articles */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#fff2b0] mb-8">
              Education & Alpha Hub
            </h2>

            <div className="space-y-4">
              {articles.map((article, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-lg p-5 hover:border-[#fff2b0]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold text-[#fff2b0] flex-grow">
                      {article.title}
                    </h4>
                    <span className="text-xs font-semibold text-[#fff2b0]/60 ml-2 whitespace-nowrap">
                      {article.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#c1c0bc] leading-relaxed mb-3">
                    {article.description}
                  </p>
                  <p className="text-xs text-[#c1c0bc]/50">{article.date}</p>
                </motion.div>
              ))}
            </div>

            <Link
              href="#"
              className="inline-flex items-center gap-2 text-[#fff2b0] hover:text-[#fff2b0] text-sm font-bold uppercase tracking-wider mt-6 group"
            >
              View All Resources
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Right: Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#363523]/80 to-[#2a2820]/80 border border-[#fff2b0]/20 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-[#fff2b0] mb-3">
              Get Market Insights
            </h3>
            <p className="text-[#c1c0bc] mb-6">
              Weekly strategies, risk alerts, and opportunities delivered to
              your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#363523]/50 border border-[#fff2b0]/20 text-[#c1c0bc] placeholder-[#c1c0bc]/40 focus:outline-none focus:border-[#fff2b0]/50 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-[#fff2b0] text-[#363523] font-bold rounded-lg hover:bg-[#fff2b0]/90 transition-colors"
              >
                {subscribed ? "✓ Subscribed!" : "Subscribe Now"}
              </button>
            </form>

            <p className="text-xs text-[#c1c0bc]/50 mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>

            <div className="mt-6 pt-6 border-t border-[#fff2b0]/10">
              <p className="text-xs uppercase tracking-widest text-[#fff2b0]/60 font-bold mb-4">
                Topics Covered
              </p>
              <div className="space-y-2">
                {[
                  "Market Analysis",
                  "Yield Opportunities",
                  "Security Tips",
                  "Airdrop Updates",
                ].map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-[#c1c0bc]"
                  >
                    <span className="text-[#fff2b0]">✓</span>
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
