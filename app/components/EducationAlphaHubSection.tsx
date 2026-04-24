"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const featuredArticles = [
  {
    title: "Blockchain Technology, Explained Simply",
    description:
      "A clear, practical guide to blocks, consensus, and why decentralization matters.",
    date: "March 10, 2026",
    category: "Education",
    slug: "blockchain-technology-explained-simply",
  },
  {
    title: "Yield Generation: How DeFi Really Works",
    description:
      "Learn where yield comes from, which parts are stable, and what to avoid.",
    date: "March 9, 2026",
    category: "Yield Strategies",
    slug: "yield-generation-how-defi-really-works",
  },
  {
    title: "Custodial Wallets: Benefits and Tradeoffs",
    description:
      "A simple look at convenience, security, and when custodial makes sense.",
    date: "March 7, 2026",
    category: "Wallets",
    slug: "custodial-wallets-benefits-and-tradeoffs",
  },
];

export default function EducationAlphaHubSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setError("Please enter your name and email.");
      setIsLoading(false);
      return;
    }

    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const surname = nameParts.slice(1).join(" ") || "Community";

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: firstName,
          surname,
          email: trimmedEmail,
        }),
      });

      if (!response.ok) {
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await response.json();
          msg = data?.error || msg;
        } catch (_) {
          try {
            const text = await response.text();
            if (text) msg = text;
          } catch (_) {}
        }
        setError(msg);
        setIsLoading(false);
        return;
      }

      try {
        await response.json();
      } catch (_) {}

      setSubmitted(true);
      setIsLoading(false);
      setName("");
      setEmail("");
      setTimeout(() => setSubmitted(false), 3500);
    } catch (err: any) {
      setError(
        err?.message
          ? `Network error: ${err.message}`
          : "Network error. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-[color:var(--theme-surface-contrast)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-[color:var(--theme-border)] bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-surface-contrast)] p-8 md:p-10"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--theme-primary-weak)]">
              Education + Alpha Hub
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--theme-primary)] mt-4">
              Research that moves with the market
            </h3>
            <p className="text-[var(--theme-text-muted)] mt-4 leading-relaxed">
              Get weekly strategy briefs, risk alerts, and actionable market
              insights directly from the Kwidao research desk.
            </p>

            <form onSubmit={handleSubscribe} className="mt-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-[var(--theme-primary)]">Name</span>
                  <input
                    type="text"
                    placeholder="Enter fullname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] text-[var(--theme-text-muted)] placeholder:text-[color:var(--theme-text-muted)] focus:outline-none focus:border-[color:var(--theme-primary)] transition-colors"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-[var(--theme-primary)]">Email</span>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[var(--theme-surface-contrast)] border border-[color:var(--theme-border)] text-[var(--theme-text-muted)] placeholder:text-[color:var(--theme-text-muted)] focus:outline-none focus:border-[color:var(--theme-primary)] transition-colors"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="theme-button-primary w-full px-4 py-3.5 disabled:opacity-60"
              >
                {isLoading
                  ? "Joining..."
                  : submitted
                    ? "You're in - check your inbox"
                    : "Subscribe to Weekly Briefs"}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[color:var(--theme-text-soft)]">
              <span className="rounded-full border border-[color:var(--theme-border)] px-3 py-1">
                Market analysis
              </span>
              <span className="rounded-full border border-[color:var(--theme-border)] px-3 py-1">
                Yield rotations
              </span>
              <span className="rounded-full border border-[color:var(--theme-border)] px-3 py-1">
                Security alerts
              </span>
              <span className="rounded-full border border-[color:var(--theme-border)] px-3 py-1">
                Airdrop signals
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-contrast)] p-8 md:p-10"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--theme-primary-weak)]">
                Featured Reads
              </p>
              <h4 className="text-2xl font-semibold text-[var(--theme-primary)] mt-3">
                Latest Alpha Notes
              </h4>
            </div>

            <div className="mt-8 space-y-5">
              {featuredArticles.map((article) => (
                <Link
                  key={article.title}
                  href={`/tools/alpha-hub/${article.slug}`}
                  className="flex flex-col rounded-2xl border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-contrast)] p-5 transition-colors hover:border-[color:var(--theme-border-strong)] hover:bg-[var(--theme-surface-contrast)]"
                >
                  <div className="flex items-center justify-between gap-4 text-xs text-[color:var(--theme-text-soft)]">
                    <span className="rounded-full border border-[color:var(--theme-border-soft)] px-2 py-1 text-[color:var(--theme-primary)]">
                      {article.category}
                    </span>
                    <span>{article.date}</span>
                  </div>
                  <h5 className="text-lg font-semibold text-[var(--theme-primary)] mt-3">
                    {article.title}
                  </h5>
                  <p className="text-sm text-[var(--theme-text-muted)] mt-2">
                    {article.description}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
