"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white" aria-labelledby="home-hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-[#CAC3E7]/35 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-0 h-[580px] w-[580px] rounded-full bg-[#4F6FD8]/10 blur-[130px]" />
      <div className="relative mx-auto grid w-full max-w-[1600px] items-start gap-5 px-6 pb-10 pt-8 sm:px-10 lg:min-h-[640px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-0 lg:px-12 lg:pb-10 lg:pt-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 order-2 max-w-[790px] lg:order-1 lg:w-[112%] lg:pt-12"
        >
          <h1
            id="home-hero-title"
            className="text-[clamp(2.45rem,10vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.06em] text-[#190B23]"
          >
            Earn Better Yields
            <br className="hidden sm:block" />
            <span className="text-[#662E91]"> with More Clarity</span>
          </h1>
          <p className="mt-8 max-w-[670px] text-lg leading-[1.55] text-[#565268] sm:text-xl lg:mt-9 lg:text-[1.35rem]">
            Bridge USDC across supported chains, then use live market context
            and practical DeFi tools to make your next move with more clarity.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-10">
            <Link
              href="/waitlist"
              className="inline-flex min-h-14 items-center justify-center rounded-lg bg-[#662E91] px-8 text-base font-semibold text-white transition-colors hover:bg-[#542477] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#662E91]"
            >
              Join Waitlist
            </Link>
            <Link
              href="/usdc-bridge"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-lg border border-[#662E91] bg-white px-8 text-base font-semibold text-[#662E91] transition-colors hover:bg-[#F5F0FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#662E91]"
            >
              USDC Bridge
              <span aria-hidden="true" className="text-lg transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">&#8599;</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 mx-auto w-full max-w-[360px] sm:max-w-[460px] lg:order-2 lg:-ml-5 lg:-mt-8 lg:max-w-none"
          aria-hidden="true"
        >
          <Image
            src="/kwidao-hero-loop.webp"
            alt=""
            width={1254}
            height={1254}
            priority
            sizes="(max-width: 1023px) 90vw, 48vw"
            className="h-auto w-full mix-blend-multiply"
          />
        </motion.div>
      </div>
    </section>
  );
}
