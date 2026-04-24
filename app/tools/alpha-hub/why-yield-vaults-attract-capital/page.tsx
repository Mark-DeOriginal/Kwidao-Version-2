import Link from "next/link";

export default function WhyYieldVaultsAttractCapitalPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <article className="max-w-4xl mx-auto">
        <Link href="/tools/alpha-hub" className="text-sm text-[var(--theme-primary)] hover:underline inline-block mb-6">
          Back to Alpha Hub
        </Link>

        <header className="space-y-4 mb-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary)]">Yield Strategies</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-primary)]">
            Why Yield Vaults Attract Capital
          </h1>
          <p className="text-lg text-[var(--theme-text-soft)]">
            A simple view of how vault strategies compound returns.
          </p>
          <p className="text-sm text-[color:var(--theme-text-soft)]">March 5, 2026 · 9 min read</p>
        </header>

        <div className="rounded-2xl overflow-hidden border border-[color:var(--theme-border-subtle)] mb-10">
          <img
            src="/alpha-hub/vaults.jpg"
            alt="Yield vault strategy"
            className="w-full h-[260px] md:h-[380px] object-cover"
            loading="lazy"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">What a vault does</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            A yield vault pools capital and runs a strategy for you. It can harvest rewards,
            rebalance positions, and compound returns automatically.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Why vaults can outperform</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>Scale spreads gas costs across many users.</li>
            <li>Automated compounding boosts net returns.</li>
            <li>Strategies can rebalance faster than manual users.</li>
          </ul>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">What to check before depositing</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Read the strategy summary and check audits. Understand withdrawal timelines and any
            admin privileges that can change the strategy mid-flight.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Use vaults with boundaries</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Vaults are best used as part of a diversified approach. Set position sizes you are
            comfortable with and review performance regularly.
          </p>
        </section>
      </article>
    </div>
  );
}



