import Link from "next/link";
import SocialIcons from "./Icons";

export default function Footer() {
  const footerLinks = [
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Whitepaper", href: "/whitepaper" },
        { label: "Lightpaper", href: "/lightpaper" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Analytics", href: "/analytics" },
        { label: "Vaults", href: "/vaults" },
        { label: "Learn", href: "/learn" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
        { label: "Partnerships", href: "/partnerships" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Risk Disclaimer", href: "/disclaimer" },
      ],
    },
  ];

  return (
    <footer className="px-6 md:px-12 py-16 border-t border-gray-800 bg-gradient-to-b from-transparent to-gray-900/30">
      <div className="max-w-6xl mx-auto">
        {/* Footer Content Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <h2 className="text-xl font-bold text-[#fff2b0] mb-4">Kwidao</h2>
            <p className="text-sm text-gray-400 mb-6">
              The AI-powered DeFi ecosystem for smarter yield farming.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com/kwidao"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#fff2b0]/10 hover:text-[#fff2b0] transition-colors"
              >
                <SocialIcons
                  className="w-5 h-5"
                  iconName="twitter"
                  color="currentColor"
                />
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#fff2b0]/10 hover:text-[#fff2b0] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#fff2b0]/10 hover:text-[#fff2b0] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#fff2b0] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-sm text-gray-500">
            © 2025 Kwidao. All rights reserved. | Built with ❤️ for DeFi
          </p>

          {/* Contract Addresses (placeholder) */}
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-600">Smart Contracts Coming Soon</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 mt-6">
          Disclaimer: Kwidao is a DeFi platform. Please conduct thorough
          research before investing. Cryptocurrency and DeFi investments carry
          risk, including potential loss of principal.
        </p>
      </div>
    </footer>
  );
}
