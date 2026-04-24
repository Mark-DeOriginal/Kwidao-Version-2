import DefiIntelligenceClient from "@/app/components/defi-intelligence/DefiIntelligenceClient";

export default function DefiIntelligencePage() {
  return (
    <main className="di-page bg-[var(--theme-surface)] pb-10 pt-0 text-[var(--theme-text-muted)]">
      <DefiIntelligenceClient />
    </main>
  );
}
