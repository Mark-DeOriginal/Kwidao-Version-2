import Link from "next/link";
import SocialIcons from "./Icons";

export default function ComingSoon() {
  return (
    <main className="coming-soon scroll-smooth px-8 py-8 lg:px-12">
      <section className="snap-section">
        <header className="flex items-center justify-between">
          <a className="block" href="/">
            <img src="/logo.svg" alt="Kwidao Logo" className="h-8 w-auto" />
          </a>
          <div className="flex items-center gap-4">
            <button
              disabled
              className="theme-button-secondary cursor-not-allowed px-5 py-2 text-sm opacity-70"
            >
              Testnet
            </button>
            <span className="text-xs text-[var(--theme-text-soft)]">Soon</span>
          </div>
        </header>

        <div className="mt-20">
          <div className="theme-kicker mb-8">Powered by Kwidao</div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--theme-primary)] sm:text-5xl md:text-6xl lg:text-7xl">
            We are coming soon
          </h1>
          <p className="mb-10 max-w-md text-base leading-relaxed text-[var(--theme-text-soft)] sm:text-lg">
            Ready to get started? Join the waitlist and experience the future of finance.
          </p>
          <Link href="#" className="theme-button-primary w-fit px-4 py-2.5">
            <span>Join Waitlist</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-pulse"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </Link>
        </div>
      </section>

      <section className="snap-section mt-10">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-[color:var(--theme-border-soft)] pt-4 sm:flex-row sm:items-center">
          <p className="mt-2 text-sm text-[var(--theme-text-soft)]">
            To get notified when our website goes live, kindly follow our socials.
          </p>
          <div className="flex items-center gap-6 text-[var(--theme-text-strong)]">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://x.com/kwidao"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              <SocialIcons className="h-4 w-4" iconName="twitter" color="currentColor" />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="#"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              <SocialIcons className="h-4 w-4" iconName="instagram" color="currentColor" />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="#"
              className="hover:text-[var(--theme-primary)] transition-colors"
            >
              <SocialIcons className="h-4 w-4" iconName="facebook" color="currentColor" />
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--theme-text-soft)]">(c) 2025 Kwidao. All rights reserved.</p>
      </section>
    </main>
  );
}
