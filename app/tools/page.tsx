import Link from "next/link";

const featuredTools = [
  {
    href: "/tools/defi-intelligence",
    eyebrow: "Imported Tool",
    title: "DeFi Intelligence",
    description:
      "All-in-one intelligence workspace with compare, heatmap, signals, and perp DEX rankings.",
    accent: "from-[color:var(--theme-primary-soft-strong)] to-transparent",
  },
  {
    href: "/tools/market-analyzer",
    eyebrow: "Imported Tool",
    title: "Kwizerana Market Analyzer",
    description:
      "A multi-chain scanner with KWI scoring, trending views, and chart drilldowns.",
    accent: "from-[color:var(--theme-primary-soft-strong)] to-transparent",
  },
  {
    href: "/tools/grid-bot",
    eyebrow: "Imported Tool",
    title: "Grid Bot Dashboard",
    description:
      "Adaptive grid automation with backtesting, wallet sync, and live price feeds.",
    accent: "from-[color:var(--theme-accent-soft)] to-transparent",
  },
  {
    href: "/tools/position-sizer",
    eyebrow: "Core Tool",
    title: "Position Sizer",
    description:
      "Plan risk, leverage, and liquidation distance before you enter a trade.",
    accent: "from-[color:var(--theme-soft-fill)] to-transparent",
  },
  {
    href: "/tools/yield-calculator",
    eyebrow: "Core Tool",
    title: "Yield Calculator",
    description:
      "Estimate returns, compare scenarios, and model yield outcomes quickly.",
    accent: "from-[color:var(--theme-accent-soft)] to-transparent",
  },
  {
    href: "/tools/alpha-hub",
    eyebrow: "Research",
    title: "Alpha Hub",
    description:
      "Research articles, strategy explainers, and DeFi market context in one place.",
    accent: "from-[color:var(--theme-primary-soft-strong)] to-transparent",
  },
];

export default function ToolsPage() {
  return (
    <main className="bg-[var(--theme-surface)] text-[var(--theme-text-muted)] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-[color:var(--theme-border-subtle)] bg-gradient-to-br from-[var(--theme-surface-contrast)] via-[var(--theme-surface-strong)] to-[var(--theme-surface-contrast-strong)] p-8 md:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary-weak)]">
              Kwidao Tools
            </p>
            <h1 className="mt-4 text-4xl font-bold text-[var(--theme-primary)] md:text-5xl">
              Trading, research, and market workflows in one place.
            </h1>
            <p className="mt-4 text-base text-[var(--theme-text-soft)] md:text-lg">
              The imported Kwizerana toolset now lives alongside the rest of the
              project under a single tools directory and shared navigation.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="theme-card group relative overflow-hidden rounded-3xl p-6"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-70 transition group-hover:opacity-100`}
                />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--theme-primary-weak)]">
                    {tool.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-[var(--theme-text-strong)]">
                    {tool.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--theme-text-soft)]">
                    {tool.description}
                  </p>
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-[var(--theme-primary)]">
                    Open tool
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
