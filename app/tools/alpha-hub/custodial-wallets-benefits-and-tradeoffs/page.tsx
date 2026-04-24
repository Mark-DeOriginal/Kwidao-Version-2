import Link from "next/link";

export default function CustodialWalletsBenefitsAndTradeoffsPage() {
  return (
    <div className="min-h-screen bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 md:px-8 py-10">
      <article className="max-w-4xl mx-auto">
        <Link href="/tools/alpha-hub" className="text-sm text-[var(--theme-primary)] hover:underline inline-block mb-6">
          Back to Alpha Hub
        </Link>

        <header className="space-y-4 mb-10">
          <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary)]">Risk Management</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-primary)]">
            Custodial Wallets: Benefits and Tradeoffs
          </h1>
          <p className="text-lg text-[var(--theme-text-soft)]">
            Why some users choose them and how to use them safely.
          </p>
          <p className="text-sm text-[color:var(--theme-text-soft)]">March 7, 2026 · 8 min read</p>
        </header>

        <div className="rounded-2xl overflow-hidden border border-[color:var(--theme-border-subtle)] mb-10">
          <img
            src="/alpha-hub/custody.jpg"
            alt="Custodial wallet security"
            className="w-full h-[260px] md:h-[380px] object-cover"
            loading="lazy"
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">What a custodial wallet is</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            A custodial wallet is managed by a third party, like an exchange or a wallet provider.
            They control the private keys on your behalf, which can reduce user error but adds trust.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Why people choose custodial</h2>
          <ul className="list-disc pl-6 space-y-3 text-[var(--theme-text-soft)]">
            <li>Easy setup and recovery if you lose your device.</li>
            <li>Support desks and fraud monitoring for added help.</li>
            <li>Convenience for frequent trading or on-ramp access.</li>
          </ul>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">Risks to understand</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            You are exposed to platform risk. If the custodian is hacked or freezes withdrawals,
            access can be delayed. You may also face limits on how and when you can move assets.
          </p>
        </section>

        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold text-[var(--theme-primary)]">A practical approach</h2>
          <p className="text-base leading-8 text-[var(--theme-text-soft)]">
            For everyday use, custodial wallets are often a good fit. For long-term storage, many
            users mix custodial and self-custody. A hybrid setup can reduce risk while keeping
            convenience.
          </p>
        </section>
      </article>
    </div>
  );
}



