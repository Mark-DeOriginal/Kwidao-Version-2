import HeroSection from "./components/HeroSection";
import LiveMarketWidget from "./components/LiveMarketWidget";
import TrustPartnersStrip from "./components/TrustPartnersStrip";
import WhatIsKwidaoSection from "./components/WhatIsKwidaoSection";
import EcosystemSection from "./components/EcosystemSection";
import LiveMarketAnalyticsSection from "./components/LiveMarketAnalyticsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import ToolsPreviewSection from "./components/ToolsPreviewSection";
import EducationAlphaHubSection from "./components/EducationAlphaHubSection";
import DAOTokenSection from "./components/DAOTokenSection";
import CommunitySection from "./components/CommunitySection";

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
