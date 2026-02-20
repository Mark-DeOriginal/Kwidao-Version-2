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
import SecuritySafetySection from "./components/SecuritySafetySection";
import CommunitySection from "./components/CommunitySection";
import FinalCTASection from "./components/FinalCTASection";

export default function Home() {
  return (
    <main className="bg-[#363523] text-[#c1c0bc] scroll-smooth">
      {/* Hero Section */}
      <section className="border-b border-[#fff2b0]/10">
        <div className="px-4 md:px-8">
          <HeroSection />
        </div>
      </section>

      {/* Live Market Widget - Full Width */}
      <section className="border-b border-[#fff2b0]/10 py-8 px-4 md:px-8 bg-[#2a2820]/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h3 className="text-sm uppercase tracking-widest text-[#fff2b0]/60 font-bold mb-4">
              Live Market Prices
            </h3>
          </div>
          <LiveMarketWidget />
        </div>
      </section>

      {/* Trust & Partners */}
      <TrustPartnersStrip />

      {/* What is Kwidao */}
      <section className="border-b border-[#fff2b0]/10">
        <div className="px-4 md:px-8">
          <WhatIsKwidaoSection />
        </div>
      </section>

      {/* Ecosystem Section */}
      <EcosystemSection />

      {/* Live Market Analytics */}
      <LiveMarketAnalyticsSection />

      {/* How it Works */}
      <HowItWorksSection />

      {/* Tools Preview */}
      <section className="border-b border-[#fff2b0]/10">
        <div className="px-4 md:px-8">
          <ToolsPreviewSection />
        </div>
      </section>

      {/* Education & Alpha Hub */}
      <EducationAlphaHubSection />

      {/* DAO & Token */}
      <section className="border-b border-[#fff2b0]/10">
        <div className="px-4 md:px-8">
          <DAOTokenSection />
        </div>
      </section>

      {/* Security & Safety */}
      <SecuritySafetySection />

      {/* Community */}
      <section className="border-b border-[#fff2b0]/10">
        <div className="px-4 md:px-8">
          <CommunitySection />
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTASection />
    </main>
  );
}
