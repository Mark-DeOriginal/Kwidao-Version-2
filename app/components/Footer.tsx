import Link from "next/link";
import SocialIcons from "./Icons";

export default function Footer() {
  return (
    <>
      {/* Footer Section */}
      <footer className="px-8 py-8 lg:px-12 snap-section mt-10">
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
      </footer>
    </>
  );
}
