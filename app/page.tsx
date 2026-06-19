"use client";

import dynamic from "next/dynamic";

import HeroSection from "./components/HeroSection";

function SectionFallback({ className }: { className: string }) {
  return <section aria-hidden="true" className={`animate-pulse ${className}`} />;
}

const LiveMarketWidget = dynamic(() => import("./components/LiveMarketWidget"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[180px]" />,
});

const TrustPartnersStrip = dynamic(() => import("./components/TrustPartnersStrip"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[280px]" />,
});

const WhatIsKwidaoSection = dynamic(() => import("./components/WhatIsKwidaoSection"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[520px]" />,
});

const EcosystemSection = dynamic(() => import("./components/EcosystemSection"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[320px]" />,
});

const LiveMarketAnalyticsSection = dynamic(
  () => import("./components/LiveMarketAnalyticsSection"),
  {
    ssr: false,
    loading: () => <SectionFallback className="min-h-[640px]" />,
  },
);

const HowItWorksSection = dynamic(() => import("./components/HowItWorksSection"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[360px]" />,
});

const ToolsPreviewSection = dynamic(() => import("./components/ToolsPreviewSection"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[460px]" />,
});

const EducationAlphaHubSection = dynamic(
  () => import("./components/EducationAlphaHubSection"),
  {
    ssr: false,
    loading: () => <SectionFallback className="min-h-[540px]" />,
  },
);

const DAOTokenSection = dynamic(() => import("./components/DAOTokenSection"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[760px]" />,
});

const CommunitySection = dynamic(() => import("./components/CommunitySection"), {
  ssr: false,
  loading: () => <SectionFallback className="min-h-[480px]" />,
});

export default function Home() {
  return (
    <main id="top" className="bg-[var(--theme-surface)] text-[var(--theme-text-muted)] scroll-smooth">
      {/* Hero Section */}
      <section className="border-b border-[color:var(--theme-border-subtle)]">
        <div className="px-4 md:px-8">
          <HeroSection />
        </div>
      </section>

      {/* Live Market Widget - Full Width */}
      <section className="border-b border-[color:var(--theme-border-subtle)] py-8 px-4 md:px-8 bg-[color:var(--theme-primary-faint)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h3 className="text-sm uppercase tracking-widest text-[color:var(--theme-primary-weak)] font-bold mb-4">
              Live Market Prices
            </h3>
          </div>
          <LiveMarketWidget />
        </div>
      </section>

      {/* Trust & Partners */}
      <TrustPartnersStrip />

      {/* What is Kwidao */}
      <section id="what-is-kwidao" className="border-b border-[color:var(--theme-border-subtle)]">
        <div className="px-4 md:px-8">
          <WhatIsKwidaoSection />
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem">
        <EcosystemSection />
      </section>

      {/* Live Market Analytics */}
      <LiveMarketAnalyticsSection />

      {/* How it Works */}
      <section id="how-it-works">
        <HowItWorksSection />
      </section>

      {/* Tools Preview */}
      <section className="border-b border-[color:var(--theme-border-subtle)]">
        <div className="px-4 md:px-8">
          <ToolsPreviewSection />
        </div>
      </section>

      {/* Education & Alpha Hub */}
      <EducationAlphaHubSection />

      {/* DAO & Token */}
      <section className="border-b border-[color:var(--theme-border-subtle)]">
        <div className="px-4 md:px-8">
          <DAOTokenSection />
        </div>
      </section>


      {/* Community */}
      <section id="community" className="border-b border-[color:var(--theme-border-subtle)]">
        <div className="px-4 md:px-8">
          <CommunitySection />
        </div>
      </section>

    </main>
  );
}
