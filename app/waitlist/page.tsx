"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/app/components/icons/ArrowIcons";

const waitlistFeatures = [
  {
    title: "Early Access",
    description: "Get exclusive access to new features and products before the general public.",
    tone: "cool" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="m5 19 5-12 9-2-2 9-12 5Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m10 14 4-4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Special Rewards",
    description: "Early supporters will receive special bonuses and rewards on launch day.",
    tone: "warm" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M4 12h16M12 4v16" strokeLinecap="round" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    ),
  },
  {
    title: "Community",
    description: "Join a vibrant community of DeFi enthusiasts and innovators.",
    tone: "cool" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M7.5 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16.5 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M4.5 19a3.5 3.5 0 0 1 6 0M13.5 19a3.5 3.5 0 0 1 6 0M9.5 18a4.5 4.5 0 0 1 5 0" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let msg = "Something went wrong. Please try again.";
        try {
          const data = await response.json();
          msg = data?.error || msg;
        } catch (_) {
          try {
            const txt = await response.text();
            if (txt) msg = txt;
          } catch (_) {}
        }
        setError(msg);
        setIsLoading(false);
        return;
      }

      try {
        await response.json();
      } catch (_) {}

      setSubmitted(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(
        err?.message
          ? `Network error: ${err.message}`
          : "Network error. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="kwidao-waitlist-page min-h-screen bg-[#F2EDFF] py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-12 xl:px-16">
      <div className="mb-12">
        <Link
          href="/"
          className="text-[color:var(--theme-primary-weak)] hover:text-[var(--theme-primary)] transition-colors text-sm flex items-center gap-2 w-fit"
        >
          <ArrowLeftIcon className="h-4 w-4 shrink-0" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="waitlist-layout mx-auto max-w-6xl">
        <div className="waitlist-intro">
          <div className="theme-kicker mb-6">Early access</div>
          <h1 className="text-[clamp(2.35rem,4vw,3.7rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[#190B23]">
            Join Kwidao from the beginning.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#6A6272] sm:text-lg">
            Get product updates, early access to new DeFi tools, and a direct line to the community shaping Kwidao.
          </p>
        </div>

        {submitted ? (
          <div className="waitlist-form-card theme-card border-[color:var(--theme-positive)]/40 bg-white p-8 text-center sm:p-12">
            <div className="mb-6 flex justify-center">
              <div className="theme-icon-badge h-16 w-16 rounded-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
                  <path d="m6 12 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-[var(--theme-primary)] sm:text-3xl">
              Welcome to the Waitlist!
            </h2>
            <p className="mb-6 text-sm text-[var(--theme-text-soft)] sm:text-base">
              Thank you for joining, {formData.name}! We&apos;ve sent a confirmation email to{" "}
              <span className="font-semibold text-[var(--theme-primary)]">{formData.email}</span>.
              We&apos;ll notify you as soon as we launch.
            </p>
            <p className="text-xs text-[var(--theme-text-muted)] sm:text-sm">
              In the meantime, follow us on social media for the latest updates and announcements.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", surname: "", email: "" });
              }}
              className="theme-button-secondary mt-8 px-6 py-3"
            >
              <span>Add Another Email</span>
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </button>
          </div>
        ) : (
          <div className="waitlist-form-card theme-card bg-white p-7 sm:p-10">
            <div className="mb-8 border-b border-[#E6DFEA] pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B739D]">Your details</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#30283B]">Reserve your place</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[var(--theme-text-strong)]"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John"
                    disabled={isLoading}
                    required
                    className="theme-field w-full rounded-lg px-4 py-3 placeholder:text-[color:var(--theme-text-soft)] focus:border-[color:var(--theme-primary)] focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="surname"
                    className="mb-2 block text-sm font-medium text-[var(--theme-text-strong)]"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    placeholder="Doe"
                    disabled={isLoading}
                    required
                    className="theme-field w-full rounded-lg px-4 py-3 placeholder:text-[color:var(--theme-text-soft)] focus:border-[color:var(--theme-primary)] focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[var(--theme-text-strong)]"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  required
                  className="theme-field w-full rounded-lg px-4 py-3 placeholder:text-[color:var(--theme-text-soft)] focus:border-[color:var(--theme-primary)] focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="theme-button-primary mt-8 flex w-full items-center justify-center px-6 py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isLoading ? "Joining..." : "Join the Waitlist"}</span>
                {!isLoading && (
                  <ArrowRightIcon className="h-4 w-4 shrink-0" />
                )}
              </button>

              <p className="text-center text-xs text-[var(--theme-text-muted)]">
                We respect your privacy. No spam, just early access updates.
              </p>
            </form>
          </div>
        )}

        <div className="waitlist-benefits mt-10 border-t border-[#D4CADB]">
          {waitlistFeatures.map((feature, index) => (
            <div key={feature.title} className="grid grid-cols-[30px_1fr] gap-3 border-b border-[#D4CADB] py-5">
              <span className="pt-0.5 text-xs font-semibold text-[#A993BC]">0{index + 1}</span>
              <div>
                <h3 className="font-semibold text-[#30283B]">{feature.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#766D7E]">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </main>
  );
}
