import Link from "next/link";

export default function ComingSoon() {
  return (
    <main className="px-8 py-8 lg:px-12 scroll-smooth">
      {/* Hero Section */}
      <section className="snap-section">
        <div className="mt-10">
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
            href="/waitlist"
            className="flex items-center gap-2 w-fit text-[#fff2b0] active:scale-95 font-medium bg-[#fff2b0]/10 px-4 py-2 rounded-[50px] hover:bg-[#fff2b0]/20 transition-colors"
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
    </main>
  );
}
