import Link from "next/link";

export default function AnalyticsDashboardWhatToWatchPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <article className="max-w-4xl mx-auto">
        <Link href="/tools/alpha-hub" className="text-sm text-[var(--theme-primary)] hover:underline inline-block mb-6">
          Back to Alpha Hub
        </Link>

        <header className="space-y-4 mb-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary)]">Onchain Research</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-primary)]">
            Analytics Dashboards: What to Watch
          </h1>
          <p className="text-lg text-[var(--theme-text-soft)]">
            A simple way to interpret DeFi dashboards without the noise.
          </p>
          <p className="text-sm text-[color:var(--theme-text-soft)]">March 2, 2026 · 8 min read</p>
        </header>

        <div className="rounded-2xl overflow-hidden border border-[color:var(--theme-border-subtle)] mb-10">
          <img
            src="/alpha-hub/analytics.jpg"
            alt="Analytics dashboard"
            className="w-full h-[260px] md:h-[380px] object-cover"
            loading="lazy"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Start with the right questions</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Dashboards show a lot of data, but you only need a few metrics to make good decisions.
            Ask: Is demand growing? Is liquidity stable? Are fees rising or falling?
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Three metrics that matter</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>TVL shows confidence and usage.</li>
            <li>Volume and fees show real activity.</li>
            <li>Active wallets show adoption trends.</li>
          </ul>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Avoid common traps</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            A single spike in TVL can be misleading if incentives drove it. Compare metrics over time
            and cross-check with real usage signals.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Make it a habit</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            A weekly review is enough for most users. Track the same metrics consistently to spot
            real trends and build better intuition.
          </p>
        </section>
      </article>
    </div>
  );
}



