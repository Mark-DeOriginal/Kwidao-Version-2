import Script from "next/script";
import { KwizeranaApp } from "./KwizeranaApp";

export default function KwizeranaPage() {
  return (
    <>
      <KwizeranaApp />
      <Script
        src="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js"
        strategy="afterInteractive"
      />
    </>
  );
}
