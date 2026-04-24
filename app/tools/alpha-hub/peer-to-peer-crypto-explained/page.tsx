import Link from "next/link";

export default function PeerToPeerCryptoExplainedPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <article className="max-w-4xl mx-auto">
        <Link href="/tools/alpha-hub" className="text-sm text-[var(--theme-primary)] hover:underline inline-block mb-6">
          Back to Alpha Hub
        </Link>

        <header className="space-y-4 mb-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary)]">Market Structure</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-primary)]">
            Peer-to-Peer Crypto, Explained
          </h1>
          <p className="text-lg text-[var(--theme-text-soft)]">
            How direct trading works and when it makes sense.
          </p>
          <p className="text-sm text-[color:var(--theme-text-soft)]">March 4, 2026 · 7 min read</p>
        </header>

        <div className="rounded-2xl overflow-hidden border border-[color:var(--theme-border-subtle)] mb-10">
          <img
            src="/alpha-hub/p2p.jpg"
            alt="Peer to peer trading"
            className="w-full h-[260px] md:h-[380px] object-cover"
            loading="lazy"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">What P2P means</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Peer-to-peer trading means you buy or sell directly with another person, often through
            a platform that provides escrow. The platform helps both sides follow the rules.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">How pricing works</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            P2P prices can include a premium or discount depending on demand and payment method.
            Faster or riskier methods often carry higher premiums.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Safety basics</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>Always use platform escrow and avoid off-platform payments.</li>
            <li>Check user history, completion rate, and reviews.</li>
            <li>Keep payment receipts and clear references.</li>
          </ul>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">When P2P is a good fit</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            P2P is useful when local payment options are limited or when you need more control over
            settlement. For larger trades, split orders to reduce risk.
          </p>
        </section>
      </article>
    </div>
  );
}



