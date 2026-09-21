"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Ecosystem", href: "/#ecosystem" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Security", href: "/#security-safety" },
  { label: "Community", href: "/#community" },
  { label: "USDC Bridge", href: "/usdc-bridge" },
];

const toolLinks = [
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
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const isActiveLink = (href: string) =>
    href.startsWith("/#")
      ? pathname === "/" && activeHash === href.slice(1)
      : pathname === href;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setMobileMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E4ED] bg-white">
      <div className="mx-auto flex h-[82px] max-w-[1600px] items-center justify-between gap-6 px-6 sm:px-10 lg:px-12 xl:px-16">
        <a className="block shrink-0" href="/">
          <img
            src="/logo.svg"
            alt="Kwidao Logo"
            className="h-8 w-auto sm:h-9"
          />
        </a>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={isActiveLink(link.href) ? "page" : undefined}
              className={`whitespace-nowrap text-sm tracking-[-0.01em] transition-colors duration-200 hover:text-[#662E91] ${
                isActiveLink(link.href)
                  ? "font-semibold text-[#662E91]"
                  : "font-medium text-[#30283B]"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="relative group">
            <button
              type="button"
              className={`inline-flex items-center gap-2 text-sm tracking-[-0.01em] transition-colors duration-200 hover:text-[#662E91] ${
                pathname.startsWith("/tools")
                  ? "font-semibold text-[#662E91]"
                  : "font-medium text-[#30283B]"
              }`}
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
              <div className="invisible w-56 translate-y-2 rounded-lg border border-[#E8E4ED] bg-white p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                {toolLinks.map((tool) => (
                  <a
                    key={tool.href}
                    href={tool.href}
                    className="block rounded-md px-3 py-2 text-sm text-[#30283B] transition-colors hover:bg-[#F5F0FA] hover:text-[#662E91]"
                  >
                    {tool.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <a
            href="/waitlist"
            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-[#662E91] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#542477] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#662E91]"
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
          className="relative grid h-11 w-11 place-items-center rounded-lg border border-[#DED6E9] bg-white text-[#662E91] transition-colors hover:border-[#BFAFD0] hover:bg-[#F7F3FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#662E91] xl:hidden"
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200 ${mobileMenuOpen ? "scale-x-0 opacity-0" : ""}`} />
            <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav"
            key="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.38, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.22 } }}
            className="absolute inset-x-0 top-full overflow-hidden border-t border-[#E8E4ED] bg-white shadow-[0_20px_45px_rgba(25,11,35,0.09)] xl:hidden"
          >
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } },
                closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
              }}
              className="mx-auto max-h-[calc(100dvh-82px)] max-w-3xl overflow-y-auto px-6 py-6 sm:px-10"
              aria-label="Mobile navigation"
            >
              <div className="divide-y divide-[#EEE9F2] border-y border-[#EEE9F2]">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              aria-current={isActiveLink(link.href) ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: -8 } }}
              className={`flex items-center justify-between py-4 text-[15px] transition-colors duration-200 hover:text-[#662E91] ${
                isActiveLink(link.href)
                  ? "font-semibold text-[var(--theme-primary)]"
                  : "font-medium text-[var(--theme-text-muted)]"
              }`}
            >
              {link.label}
              <span aria-hidden="true" className="text-lg font-light text-[#A79AAF]">&#8594;</span>
            </motion.a>
          ))}
              </div>
              <motion.div variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: -8 } }} className="py-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A7B94]">Tools</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {toolLinks.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#F0ECF3] py-3 text-sm font-medium text-[#565268] transition-colors hover:text-[#662E91]"
                >
                  {tool.label}
                </a>
              ))}
                </div>
              </motion.div>
              <motion.a
                variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: -8 } }}
                href="/waitlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#662E91] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#542477]"
              >
                Join Waitlist
              </motion.a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
