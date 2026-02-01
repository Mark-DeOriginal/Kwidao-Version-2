"use client";

import { useState } from "react";
import Link from "next/link";

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
        // Try parse JSON error, fallback to text
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

      // Parse successful response
      try {
        await response.json();
      } catch (_) {
        // response body is not JSON, but status was ok
      }

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
      {/* Navigation Back Link */}
      <div className="mb-12">
        <Link
          href="/"
          className="text-[#fff2b0]/70 hover:text-[#fff2b0] transition-colors text-sm flex items-center gap-2 w-fit"
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

      {/* Main Content Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[#fff2b0]/50 bg-secondary/50 mb-8">
            <span className="text-xs tracking-wide text-[#fff2b0]">
              JOIN OUR COMMUNITY
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#fff2b0] leading-[1.1] tracking-tight mb-6">
            Be the First to Experience the Future
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
            Join thousands of early adopters who are revolutionizing the way
            finance works. Get exclusive early access to Kwizerana DAO when we
            launch.
          </p>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="bg-gradient-to-br from-[#fff2b0]/10 to-green-500/10 border border-green-500/30 rounded-2xl p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                {/* <Check className="w-8 h-8 text-green-400" /> */}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#fff2b0] mb-4">
              Welcome to the Waitlist!
            </h2>
            <p className="text-white/70 mb-6 text-sm sm:text-base">
              Thank you for joining, {formData.name}! We've sent a confirmation
              email to <span className="text-[#fff2b0]">{formData.email}</span>.
              We'll notify you as soon as we launch.
            </p>
            <p className="text-xs sm:text-sm text-white/50">
              In the meantime, follow us on social media for the latest updates
              and announcements.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", surname: "", email: "" });
              }}
              className="mt-8 inline-flex items-center gap-2 text-[#fff2b0] font-medium bg-[#fff2b0]/10 hover:bg-[#fff2b0]/20 px-6 py-3 rounded-full transition-all duration-200"
            >
              <span>Add Another Email</span>
              {/* <ArrowRight className="w-4 h-4" /> */}
            </button>
          </div>
        ) : (
          /* Form Section */
          <div className="bg-gradient-to-br from-[#fff2b0]/5 to-transparent border border-[#fff2b0]/20 rounded-2xl p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Surname Row */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#fff2b0] mb-2"
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
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#fff2b0]/50 text-white placeholder-white/40 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="surname"
                    className="block text-sm font-medium text-[#fff2b0] mb-2"
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
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#fff2b0]/50 text-white placeholder-white/40 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#fff2b0] mb-2"
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
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#fff2b0]/50 text-white placeholder-white/40 focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 flex items-center justify-center gap-2 text-[#fff2b0] font-medium bg-[#fff2b0]/10 hover:bg-[#fff2b0]/20 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-all duration-200"
              >
                <span>{isLoading ? "Joining..." : "Join the Waitlist"}</span>
                {/* {!isLoading && <ArrowRight className="w-4 h-4" />} */}
              </button>

              {/* Privacy Notice */}
              <p className="text-xs text-white/50 text-center">
                We respect your privacy. No spam, just early access updates.
              </p>
            </form>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-[#fff2b0] font-semibold mb-2">Early Access</h3>
            <p className="text-white/60 text-sm">
              Get exclusive access to new features and products before the
              general public.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-[#fff2b0] font-semibold mb-2">
              Special Rewards
            </h3>
            <p className="text-white/60 text-sm">
              Early supporters will receive special bonuses and rewards on
              launch day.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-[#fff2b0] font-semibold mb-2">Community</h3>
            <p className="text-white/60 text-sm">
              Join a vibrant community of DeFi enthusiasts and innovators.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#fff2b0] mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group border border-[#fff2b0]/20 rounded-lg p-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-[#fff2b0] group-open:text-[#fff2b0]">
                <span>When will Kwizerana DAO launch?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm">
                We're targeting a launch in Q2 2026. Early waitlist members will
                get notified first with exclusive launch details and special
                bonuses.
              </p>
            </details>

            <details className="group border border-[#fff2b0]/20 rounded-lg p-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-[#fff2b0] group-open:text-[#fff2b0]">
                <span>Is there a cost to join the waitlist?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm">
                No, joining the waitlist is completely free. We only ask for
                your basic information to notify you about the launch and any
                updates.
              </p>
            </details>

            <details className="group border border-[#fff2b0]/20 rounded-lg p-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-[#fff2b0] group-open:text-[#fff2b0]">
                <span>Can I use the platform before launch?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm">
                We'll be releasing a beta version for early waitlist members to
                test. This is your chance to try out the platform and provide
                valuable feedback.
              </p>
            </details>

            <details className="group border border-[#fff2b0]/20 rounded-lg p-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-[#fff2b0] group-open:text-[#fff2b0]">
                <span>How will you use my information?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm">
                Your information is used solely to notify you about the launch
                and important updates. We'll never share your data with third
                parties and you can unsubscribe at any time.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-20 text-center border-t border-[#fff2b0]/10 pt-12">
        <p className="text-white/60 text-sm mb-4">
          Have questions? Reach out to our team
        </p>
        <Link
          href="mailto:hello@kwizerana.com"
          className="inline-flex items-center gap-2 text-[#fff2b0] hover:text-[#fff2b0]/80 font-medium transition-colors"
        >
          hello@kwizerana.com
          {/* <ArrowRight className="w-4 h-4" /> */}
        </Link>
      </div>
    </main>
  );
}
