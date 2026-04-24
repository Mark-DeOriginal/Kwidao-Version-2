import Link from "next/link";

export default function BlockchainTechnologyExplainedSimplyPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <article className="max-w-4xl mx-auto">
        <Link href="/tools/alpha-hub" className="text-sm text-[var(--theme-primary)] hover:underline inline-block mb-6">
          Back to Alpha Hub
        </Link>

        <header className="space-y-4 mb-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary)]">Onchain Research</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-primary)]">
            Blockchain Technology, Explained Simply
          </h1>
          <p className="text-lg text-[var(--theme-text-soft)]">
            A clear, practical guide to how blockchain actually works without the jargon.
          </p>
          <p className="text-sm text-[color:var(--theme-text-soft)]">March 10, 2026 · 9 min read</p>
        </header>

        <div className="rounded-2xl overflow-hidden border border-[color:var(--theme-border-subtle)] mb-10">
          <img
            src="/alpha-hub/blockchain.jpg"
            alt="Blockchain visualization"
            className="w-full h-[260px] md:h-[380px] object-cover"
            loading="lazy"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">The simplest definition</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            A blockchain is a shared database that many computers maintain together.
            Instead of one company owning the database, the network agrees on updates as a group.
          </p>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Each new batch of data is stored in a block. Blocks link to previous blocks, which
            makes the history hard to change without the network noticing.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Why this is different</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>Anyone can verify the data at any time.</li>
            <li>No single company can rewrite history.</li>
            <li>Systems keep running even if a few nodes go offline.</li>
          </ul>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">The role of consensus</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Consensus is how the network decides what is true. It is the shared rulebook for
            validating new blocks and rejecting invalid ones.
          </p>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Some networks use proof of work, while others use proof of stake. The goal is the same:
            make it expensive to cheat and easy to verify.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Where it becomes useful</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Blockchains enable digital ownership, transparent markets, and programmable finance.
            This is why DeFi exists: it uses blockchain infrastructure to build lending, trading,
            and yield tools that run on open networks.
          </p>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            Once you understand the basics, it is easier to evaluate real products and risks.
          </p>
        </section>
      </article>
    </div>
  );
}



