import dynamic from "next/dynamic";

import HeroSection from "./components/HeroSection";

function SectionFallback({ className }: { className: string }) {
  return <section aria-hidden="true" className={`animate-pulse ${className}`} />;
}

const LiveMarketWidget = dynamic(() => import("./components/LiveMarketWidget"), {
  loading: () => <SectionFallback className="min-h-[180px]" />,
});

const WhatIsKwidaoSection = dynamic(() => import("./components/WhatIsKwidaoSection"), {
  loading: () => <SectionFallback className="min-h-[520px]" />,
});

const EcosystemSection = dynamic(() => import("./components/EcosystemSection"), {
  loading: () => <SectionFallback className="min-h-[320px]" />,
});

const LiveMarketAnalyticsSection = dynamic(
  () => import("./components/LiveMarketAnalyticsSection"),
  {
    loading: () => <SectionFallback className="min-h-[640px]" />,
  },
);

const HowItWorksSection = dynamic(() => import("./components/HowItWorksSection"), {
  loading: () => <SectionFallback className="min-h-[360px]" />,
});

const ToolsPreviewSection = dynamic(() => import("./components/ToolsPreviewSection"), {
  loading: () => <SectionFallback className="min-h-[460px]" />,
});

const EducationAlphaHubSection = dynamic(
  () => import("./components/EducationAlphaHubSection"),
  {
    loading: () => <SectionFallback className="min-h-[540px]" />,
  },
);

const DAOTokenSection = dynamic(() => import("./components/DAOTokenSection"), {
  loading: () => <SectionFallback className="min-h-[760px]" />,
});

const CommunitySection = dynamic(() => import("./components/CommunitySection"), {
  loading: () => <SectionFallback className="min-h-[480px]" />,
});

export default function Home() {
  return (
    <main id="top" className="bg-[var(--theme-surface)] text-[var(--theme-text-muted)] scroll-smooth">
      {/* Hero Section */}
      <section>
        <HeroSection />
      </section>

      {/* Live Market Widget - Full Width */}
      <section
        className="overflow-hidden py-8"
        style={{ backgroundColor: "#f2edff" }}
      >
        <LiveMarketWidget />
      </section>

      {/* What is Kwidao */}
      <div id="what-is-kwidao">
        <WhatIsKwidaoSection />
      </div>

      {/* Ecosystem Section */}
      <div id="ecosystem">
        <EcosystemSection />
      </div>

      {/* Live Market Analytics */}
      <LiveMarketAnalyticsSection />

      {/* How it Works */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>

      {/* Tools Preview */}
      <ToolsPreviewSection />

      {/* Education & Alpha Hub */}
      <EducationAlphaHubSection />

      {/* DAO & Token */}
      <DAOTokenSection />


      {/* Community */}
      <div id="community">
        <CommunitySection />
      </div>

    </main>
  );
}
