import Link from "next/link";

export default function YieldGenerationHowDefiReallyWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <article className="max-w-4xl mx-auto">
        <Link href="/tools/alpha-hub" className="text-sm text-[var(--theme-primary)] hover:underline inline-block mb-6">
          Back to Alpha Hub
        </Link>

        <header className="space-y-4 mb-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary)]">Yield Strategies</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-primary)]">
            Yield Generation: How DeFi Really Works
          </h1>
          <p className="text-lg text-[var(--theme-text-soft)]">
            The simple mechanics behind earning yield onchain.
          </p>
          <p className="text-sm text-[color:var(--theme-text-soft)]">March 9, 2026 · 10 min read</p>
        </header>

        <div className="rounded-2xl overflow-hidden border border-[color:var(--theme-border-subtle)] mb-10">
          <img
            src="/alpha-hub/yield.jpg"
            alt="DeFi yield illustration"
            className="w-full h-[260px] md:h-[380px] object-cover"
            loading="lazy"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Where yield comes from</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Yield is the return you earn for providing something useful. In DeFi, that can be
            liquidity, lending capital, or participation in a protocol.
          </p>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Borrowers pay interest to access capital, traders pay fees to swap assets, and protocols
            distribute incentives to attract activity. Those cash flows combine into the yield you see.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Three common yield sources</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>Lending yield from interest paid by borrowers.</li>
            <li>Liquidity pool fees from trading volume.</li>
            <li>Incentive rewards from protocol emissions.</li>
          </ul>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">What makes yield reliable</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            The most reliable yield is tied to real demand, not just incentives. Look for consistent
            borrowing demand or steady swap volume. Check how quickly funds can be withdrawn and how
            long the protocol has operated safely.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">A quick safety checklist</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>Know the source of yield and how it is paid.</li>
            <li>Read audits and check admin privileges.</li>
            <li>Assume incentives decay and size accordingly.</li>
          </ul>
        </section>
      </article>
    </div>
  );
}



