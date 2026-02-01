import Link from "next/link";
import SocialIcons from "./Icons";

export default function ComingSoon() {
  return (
    <main className="px-8 py-8 lg:px-12 scroll-smooth coming-soon">
      {/* Hero Section */}
      <section className="snap-section">
        <header className="flex items-center justify-between">
          <a className="block" href="/">
            <img
              src="/kwidao-logo-dark-mode.svg"
              alt="Kwidao Logo"
              className="h-8 w-auto"
            />
          </a>
          <div className="flex items-center gap-4">
            <button
              disabled
              className="px-5 py-2 text-sm bg-foreground/50 text-background rounded-full font-medium cursor-not-allowed"
            >
              Testnet
            </button>
            <span className="text-xs">Soon</span>
          </div>
        </header>

        <div className="mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[#fff2b0]/50 bg-secondary/50 mb-8">
            <span className="text-xs tracking-wide text-[#fff2b0]">
              Powered by Kwidao
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#fff2b0] leading-[1.05] tracking-tight mb-6">
            We are coming soon
          </h1>
          <p className="text-base sm:text-lg max-w-md leading-relaxed mb-10">
            Ready to get started? Join the waitlist and experience the future of
            finance.
          </p>
          <Link
            href="#"
            className="flex items-center gap-2 w-fit text-[#fff2b0] active:scale-95 font-medium bg-[#fff2b0]/10 px-4 py-2 rounded-[50px]"
          >
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

      {/* Footer Section */}
      <section className="snap-section mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pt-4 border-t border-[#c1c0bc]/20">
          <p className="text-sm mt-2">
            To get notified when our website goes live, kindly follow our
            socials.
          </p>
          <div className="flex items-center gap-6">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://x.com/kwidao"
              className="hover:text-foreground transition-colors"
            >
              <SocialIcons
                className="w-4 h-4"
                iconName="twitter"
                color="currentColor"
              />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="#"
              className="hover:text-foreground transition-colors"
            >
              <SocialIcons
                className="w-4 h-4"
                iconName="instagram"
                color="currentColor"
              />
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="#"
              className="hover:text-foreground transition-colors"
            >
              <SocialIcons
                className="w-4 h-4"
                iconName="facebook"
                color="currentColor"
              />
            </Link>
          </div>
        </div>
        <p className="text-xs mt-8">© 2025 Kwidao. All rights reserved.</p>
      </section>
    </main>
  );
}
