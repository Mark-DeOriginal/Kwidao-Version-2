"use client";

import { useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "Ecosystem", href: "/#ecosystem" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Peer to Peer", href: "/p2p" },
  { label: "Security", href: "/#security-safety" },
  { label: "Community", href: "/#community" },
];

const toolLinks = [
  { label: "P2P Marketplace", href: "/p2p" },
  { label: "Tools Hub", href: "/tools" },
  { label: "Live Market", href: "/live-market" },
  { label: "DeFi Intelligence", href: "/tools/defi-intelligence" },
  { label: "Market Analyzer", href: "/tools/market-analyzer" },
  { label: "Grid Bot", href: "/tools/grid-bot" },
  { label: "Position Sizer", href: "/tools/position-sizer" },
  { label: "Yield Calculator", href: "/tools/yield-calculator" },
  { label: "Alpha Hub", href: "/tools/alpha-hub" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuHeight, setMobileMenuHeight] = useState(0);
  const mobileNavContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateMobileMenuHeight = () => {
      if (mobileNavContentRef.current) {
        setMobileMenuHeight(mobileNavContentRef.current.scrollHeight);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
      updateMobileMenuHeight();
    };

    updateMobileMenuHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (mobileNavContentRef.current) {
        setMobileMenuHeight(mobileNavContentRef.current.scrollHeight);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-strong)] shadow-[var(--theme-shadow-soft)] backdrop-blur-xl">
      <div className="px-4 py-5 md:px-8 lg:px-12 flex items-center justify-between gap-4">
        <a className="block shrink-0" href="/">
          <img
            src="/logo.svg"
            alt="Kwidao Logo"
            className="h-8 w-auto md:h-9"
          />
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm tracking-wide text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors duration-200"
              aria-haspopup="true"
            >
              Tools
              <svg
                className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="absolute right-[-8px] top-full pointer-events-none">
              <div className="w-56 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-contrast-strong)] p-2 opacity-0 translate-y-2 invisible pointer-events-none shadow-xl shadow-black/30 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-hover:pointer-events-auto">
                {toolLinks.map((tool) => (
                  <a
                    key={tool.href}
                    href={tool.href}
                    className="block rounded-xl px-3 py-2 text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] hover:bg-[color:var(--theme-surface-soft)] transition-colors"
                  >
                    {tool.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <a
            href="/waitlist"
            className="theme-button-primary px-5 py-2.5 text-sm"
          >
            Join Waitlist
          </a>
        </nav>

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="theme-button-secondary md:hidden relative h-11 w-11 p-0"
        >
          <span
            className={`absolute h-0.5 w-5 bg-[var(--theme-primary)] transition-transform duration-300 ${
              mobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-[var(--theme-primary)] transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-[var(--theme-primary)] transition-transform duration-300 ${
              mobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
            }`}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden border-t border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-contrast-strong)] transition-[max-height,opacity,transform] duration-300 ease-out ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
        style={{ maxHeight: mobileMenuOpen ? `${mobileMenuHeight}px` : "0px" }}
      >
        <nav
          ref={mobileNavContentRef}
          className="px-4 py-4 flex flex-col gap-2"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] hover:bg-[color:var(--theme-surface-soft)] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 rounded-lg border border-[color:var(--theme-border-subtle)] bg-[color:var(--theme-surface-soft)] px-3 py-2">
            <p className="text-xs uppercase tracking-widest text-[color:var(--theme-primary-weak)] mb-2">
              Tools
            </p>
            <div className="flex flex-col gap-2">
              {toolLinks.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] hover:bg-[color:var(--theme-surface-soft)] transition-colors duration-200"
                >
                  {tool.label}
                </a>
              ))}
            </div>
          </div>
          <a
            href="/waitlist"
            onClick={() => setMobileMenuOpen(false)}
            className="theme-button-primary mt-2 px-4 py-3 text-center text-sm"
          >
            Join Waitlist
          </a>
        </nav>
      </div>
    </header>
  );
}
