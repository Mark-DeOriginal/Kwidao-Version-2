"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const communityLinks = [
  {
    label: "Twitter / X",
    href: "https://x.com/kwidao",
    description: "Live announcements, market takes, and product updates.",
    tone: "cool" as const,
  },
  {
    label: "TikTok",
    href: "#",
    description: "Short-form explainers, demos, and community highlights.",
    tone: "warm" as const,
  },
  {
    label: "Facebook",
    href: "#",
    description: "Community stories, event recaps, and growth updates.",
    tone: "cool" as const,
  },
  {
    label: "YouTube",
    href: "#",
    description: "Deep dives, tutorials, and market breakdowns.",
    tone: "warm" as const,
  },
];

function SocialIcon({ label }: { label: string }) {
  switch (label) {
    case "Twitter / X":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
        </svg>
      );
    case "TikTok":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
  }
}

export default function CommunitySection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="theme-panel overflow-hidden p-8 md:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="theme-kicker">Community</span>
                <h2 className="text-4xl font-bold tracking-tight text-[var(--theme-primary)] md:text-5xl">
                  Join the conversations shaping Kwidao
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-[var(--theme-text-muted)]">
                  Follow research drops, product updates, and community-led
                  discussions without every surface shouting the same color.
                  Headings stay bold, while the rest of the experience stays
                  clear, calm, and readable.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="theme-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--theme-primary-weak)]">
                    Updates
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-strong)]">
                    Weekly
                  </p>
                  <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
                    Market notes, shipping updates, and product changes.
                  </p>
                </div>
                <div className="theme-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--theme-primary-weak)]">
                    Focus
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-strong)]">
                    Practical
                  </p>
                  <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
                    Less noise, more useful context for traders and builders.
                  </p>
                </div>
                <div className="theme-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--theme-primary-weak)]">
                    Coverage
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--theme-text-strong)]">
                    Multichannel
                  </p>
                  <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
                    Social posts, explainers, clips, and longer-form tutorials.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-[var(--theme-text-soft)]">
                <span className="theme-chip px-3 py-1.5">Product releases</span>
                <span className="theme-chip-accent px-3 py-1.5">Research briefs</span>
                <span className="theme-chip px-3 py-1.5">Security updates</span>
              </div>
            </div>

            <div className="grid gap-4">
              {communityLinks.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theme-card group flex items-start gap-4 p-5"
                  >
                    <div
                      className={
                        item.tone === "warm"
                          ? "theme-icon-badge-warm shrink-0"
                          : "theme-icon-badge shrink-0"
                      }
                    >
                      <SocialIcon label={item.label} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-[var(--theme-text-strong)]">
                          {item.label}
                        </h3>
                        <span className="text-sm text-[var(--theme-primary-strong)] transition-transform group-hover:translate-x-0.5">
                          -&gt;
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--theme-text-muted)]">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
