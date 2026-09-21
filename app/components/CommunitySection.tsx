"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRightIcon } from "./icons/ArrowIcons";

export default function CommunitySection() {
  return (
    <section className="home-content-section bg-[#F2EDFF]">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
      <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#662E91]">Kwidao Community</p>
        <h2 className="mx-auto mt-5 max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.06em] text-[#190B23]">Learn, contribute, and help shape what comes next.</h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#625A6A] md:text-lg md:leading-8">Follow product releases, research notes, security updates, and the conversations guiding Kwidao’s growth.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="https://x.com/kwidao" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-lg bg-[#190B23] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#30283B]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" /></svg>
            Follow on X
            <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
          </a>
          <Link href="/waitlist" className="inline-flex min-h-[3.25rem] items-center justify-center rounded-lg border border-[#662E91] px-7 py-3.5 text-sm font-semibold text-[#662E91] transition-colors hover:bg-white/60">Join the waitlist</Link>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
