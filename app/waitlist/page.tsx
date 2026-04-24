"use client";

import { useState } from "react";
import Link from "next/link";

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
    <main className="min-h-screen px-8 py-12 lg:px-12">
      <div className="mb-12">
        <Link
          href="/"
          className="text-[color:var(--theme-primary-weak)] hover:text-[var(--theme-primary)] transition-colors text-sm flex items-center gap-2 w-fit"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="rotate-180"
          >
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <div className="theme-kicker mb-8">Join Our Community</div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-[var(--theme-primary)] sm:text-5xl md:text-6xl">
            Be the First to Experience the Future
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-[var(--theme-text-soft)] sm:text-lg">
            Get early access to Kwizerana DAO when we launch.
          </p>
        </div>

        {submitted ? (
          <div className="theme-card border-[color:var(--theme-positive)]/40 bg-gradient-to-br from-[color:var(--theme-primary-faint)] to-[color:var(--theme-positive-soft)] p-8 text-center sm:p-12">
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
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="theme-card bg-gradient-to-br from-[color:var(--theme-primary-faint)] to-transparent p-8 sm:p-12">
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
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <p className="text-center text-xs text-[var(--theme-text-muted)]">
                We respect your privacy. No spam, just early access updates.
              </p>
            </form>
          </div>
        )}

        <div className="mt-16 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {waitlistFeatures.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className={feature.tone === "warm" ? "theme-icon-badge-warm mx-auto mb-3" : "theme-icon-badge mx-auto mb-3"}>
                {feature.icon}
              </div>
              <h3 className="mb-2 font-semibold text-[var(--theme-text-strong)]">{feature.title}</h3>
              <p className="text-sm text-[var(--theme-text-soft)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
