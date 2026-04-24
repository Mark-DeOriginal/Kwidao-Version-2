import Link from "next/link";
import { getSessionUser } from "@/lib/p2p/auth";

const marketHighlights = [
  { label: "Active Advertisers", value: "4,200+" },
  { label: "Avg. Trade Completion", value: "3m 42s" },
  { label: "Dispute Resolution SLA", value: "< 30 min" },
];

const sampleOffers = [
  { trader: "Avalink Desk", payment: "Bank Transfer", price: "1 USDT = 1.00 USD", limit: "50 - 8,000 USD", completion: "98.8%" },
  { trader: "PrimeOTC", payment: "Mobile Money", price: "1 USDT = 1.01 USD", limit: "20 - 2,500 USD", completion: "97.9%" },
  { trader: "BlueRoute", payment: "SEPA Instant", price: "1 USDC = 1.00 EUR", limit: "100 - 12,000 EUR", completion: "99.2%" },
  { trader: "Cedar P2P", payment: "Local Bank", price: "1 AVAX = 34.76 USD", limit: "80 - 5,500 USD", completion: "97.4%" },
];

const steps = [
  {
    title: "Connect Wallet",
    text: "Sign in instantly with MetaMask or any injected EVM wallet on Avalanche C-Chain.",
  },
  {
    title: "Open Trade Room",
    text: "Choose counterparty, amount, and payment method to lock trade terms and start chat.",
  },
  {
    title: "Share Receipt Proof",
    text: "Buyer uploads fiat payment proof in-app, then seller verifies and releases crypto.",
  },
  {
    title: "Escalate If Needed",
    text: "If issues arise, moderators are notified and step in with structured resolution actions.",
  },
];

const safetyPoints = [
  "Wallet-native authentication and session controls",
  "Structured evidence trail inside each trade room",
  "Dedicated moderator approval workflow with identity checks",
  "In-app notifications for disputes, status changes, and settlement updates",
];

export default async function P2PHomePage() {
  const user = await getSessionUser();

  return (
    <main className="space-y-4">
      <section className="p2p-hero">
        <div className="p2p-row">
          <div>
            <p className="p2p-eyebrow">Kwidao Peer-to-Peer Marketplace</p>
            <h1 className="p2p-title">Buy and sell crypto directly with verified dispute support</h1>
            <p className="p2p-subtitle">
              Trade USDT, USDC, and AVAX with transparent execution flows, wallet-native login, and
              moderator-backed conflict handling modeled after top centralized P2P desks.
            </p>
          </div>
          <span className="p2p-kbd p2p-muted">
            {user
              ? `Connected ${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-4)}`
              : "Connect wallet from top-right"}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/p2p/dashboard" className="p2p-btn-primary">
            Start Trading
          </Link>
          <Link href="/p2p/moderator/apply" className="p2p-btn-secondary">
            Become a Moderator
          </Link>
        </div>
      </section>

      <section className="p2p-grid-3">
        {marketHighlights.map((item) => (
          <article key={item.label} className="p2p-panel">
            <p className="p2p-muted text-sm">{item.label}</p>
            <p className="p2p-stat">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="p2p-panel">
        <div className="p2p-row">
          <div>
            <h2 className="p2p-section-title">Live Offer Snapshot</h2>
            <p className="p2p-subtitle">
              Typical P2P offer board format with price, payment method, limit windows, and completion
              performance.
            </p>
          </div>
          <span className="p2p-badge">Realtime style preview</span>
        </div>
        <div className="mt-4 p2p-offer-grid">
          {sampleOffers.map((offer) => (
            <article key={offer.trader} className="p2p-card-compact">
              <div className="p2p-offer-row">
                <p className="text-sm font-semibold">{offer.trader}</p>
                <span className="p2p-badge">{offer.completion}</span>
              </div>
              <p className="mt-2 text-sm p2p-muted">{offer.payment}</p>
              <p className="mt-1 text-sm font-medium">{offer.price}</p>
              <p className="mt-1 text-xs p2p-muted">Order limits: {offer.limit}</p>
              <Link href="/p2p/dashboard" className="p2p-btn-secondary mt-3 inline-flex">
                Create Similar Trade
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="p2p-panel">
        <h2 className="p2p-section-title">How Trading Works</h2>
        <div className="mt-4 p2p-grid-2">
          {steps.map((step, index) => (
            <article key={step.title} className="p2p-card-compact">
              <p className="p2p-eyebrow">Step {index + 1}</p>
              <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
              <p className="p2p-subtitle">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="p2p-grid-2">
        <article className="p2p-panel">
          <h2 className="p2p-section-title">Trust and Safety Layer</h2>
          <ul className="mt-3 space-y-2">
            {safetyPoints.map((point) => (
              <li key={point} className="p2p-card-compact text-sm p2p-muted">
                {point}
              </li>
            ))}
          </ul>
        </article>
        <article className="p2p-panel">
          <h2 className="p2p-section-title">Built For Scale</h2>
          <p className="p2p-subtitle">
            The MVP foundation supports user dashboards, moderator work queues, and admin review panels
            with clear role boundaries and dispute lifecycle tracking.
          </p>
          <div className="mt-4 p2p-card-compact">
            <p className="text-sm font-semibold">Role Access Modules</p>
            <p className="mt-1 text-sm p2p-muted">
              User Dashboard, Trade Room, Moderator Queue, Admin Governance Console
            </p>
          </div>
          <div className="mt-3 p2p-card-compact">
            <p className="text-sm font-semibold">Settlement Assets</p>
            <p className="mt-1 text-sm p2p-muted">USDT, USDC, AVAX on Avalanche C-Chain</p>
          </div>
        </article>
      </section>

      <section className="p2p-panel">
        <h2 className="p2p-section-title">Frequently Asked Questions</h2>
        <div className="mt-3 space-y-2">
          <details className="p2p-faq-item p2p-card-compact">
            <summary>Do I need email and password to use P2P?</summary>
            <p className="p2p-muted text-sm">
              No. Wallet connect is enough to create and access your account session.
            </p>
          </details>
          <details className="p2p-faq-item p2p-card-compact">
            <summary>How is a fiat payment dispute resolved?</summary>
            <p className="p2p-muted text-sm">
              Any participant can escalate in the trade room. Assigned moderators review proof and apply
              release or cancellation decisions.
            </p>
          </details>
          <details className="p2p-faq-item p2p-card-compact">
            <summary>Can I apply to become a moderator?</summary>
            <p className="p2p-muted text-sm">
              Yes. Submit identity and experience details through the moderator application workflow.
            </p>
          </details>
        </div>
      </section>

      <section className="p2p-hero">
        <div className="p2p-row">
          <div>
            <h2 className="p2p-section-title">Launch your first P2P order in minutes</h2>
            <p className="p2p-subtitle">
              Connect your wallet, create your trade room, and manage settlement with full visibility from
              one dedicated interface.
            </p>
          </div>
          <Link href="/p2p/dashboard" className="p2p-btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

