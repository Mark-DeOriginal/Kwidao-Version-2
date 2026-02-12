'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CommunitySection() {
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Community Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#fff2b0] mb-6">
              Join Our Community
            </h2>

            <p className="text-lg text-[#c1c0bc] mb-8 leading-relaxed">
              Connect with thousands of DeFi enthusiasts, earn points by participating, and shape the future of Kwidao through governance.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#fff2b0]/10 bg-[#363523]/50">
                <div className="text-3xl">𝕏</div>
                <div>
                  <h4 className="font-bold text-[#fff2b0]">Twitter / X</h4>
                  <p className="text-sm text-[#c1c0bc]">Latest updates, market insights, and announcements</p>
                </div>
                <Link href="https://twitter.com" target="_blank" className="ml-auto text-[#fff2b0] hover:text-[#fff2b0]/80">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                  </svg>
                </Link>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#fff2b0]/10 bg-[#363523]/50">
                <div className="text-3xl">💬</div>
                <div>
                  <h4 className="font-bold text-[#fff2b0]">Discord</h4>
                  <p className="text-sm text-[#c1c0bc]">Chat, support, and community events</p>
                </div>
                <Link href="https://discord.com" target="_blank" className="ml-auto text-[#fff2b0] hover:text-[#fff2b0]/80">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7995 19.7995 0 00-4.885-1.515a.06.06 0 00-.064.03c-.211.378-.445.879-.608 1.27a18.27 18.27 0 00-5.487 0c-.163-.39-.397-.892-.609-1.27a.064.064 0 00-.064-.029c-1.743.297-3.348.808-4.885 1.515a.06.06 0 00-.031.021C.399 9.12.73 13.818 3.101 18.021a.064.064 0 00.052.028c1.179.22 2.318.482 3.415.771a.064.064 0 00.066-.028c.231-.39.446-.836.629-1.305a.064.064 0 00-.033-.088c-.418-.126-.823-.26-1.22-.41a.064.064 0 00-.097.067c.08.244.16.494.238.745.005.018.045.028.064.024 2.564-.608 5.201-.608 7.722 0 .02.003.06-.006.065-.024.078-.251.159-.501.237-.745a.064.064 0 00-.097-.067c-.398.15-.802.284-1.22.41a.064.064 0 00-.033.088c.183.469.398.915.629 1.305a.064.064 0 00.066.028c1.097-.289 2.236-.551 3.415-.771a.064.064 0 00.052-.028c2.7-4.474 3.899-8.848 1.744-13.216a.061.061 0 00-.031-.021zM8.02 15.33c-1.183 0-2.157-.964-2.157-2.15s.974-2.15 2.157-2.15c1.183 0 2.157.964 2.157 2.15 0 1.184-.974 2.15-2.157 2.15zm7.975 0c-1.189 0-2.157-.966-2.157-2.15s.968-2.15 2.157-2.15c1.188 0 2.157.966 2.157 2.15 0 1.184-.969 2.15-2.157 2.15z" />
                  </svg>
                </Link>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#fff2b0]/10 bg-[#363523]/50">
                <div className="text-3xl">📱</div>
                <div>
                  <h4 className="font-bold text-[#fff2b0]">Telegram</h4>
                  <p className="text-sm text-[#c1c0bc]">Real-time notifications and community</p>
                </div>
                <Link href="https://telegram.com" target="_blank" className="ml-auto text-[#fff2b0] hover:text-[#fff2b0]/80">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.112L9.4 15.9l-5.894-.814c-.786-.11-.785-.806.17-1.196l15.454-5.962c.7-.27 1.362.166 1.162 1.293z" />
                  </svg>
                </Link>
              </div>
            </div>

            <p className="text-sm text-[#c1c0bc] bg-[#363523]/50 border border-[#fff2b0]/10 rounded-lg p-4">
              <strong>Earn Points:</strong> Participate in governance, refer friends, and engage with the community to accumulate points toward future rewards and airdrop eligibility.
            </p>
          </motion.div>

          {/* Right: Community Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: 'Community Members', value: '15K+' },
              { label: 'Active Traders', value: '8.5K+' },
              { label: 'Total TVL', value: '$2.3M' },
              { label: 'Supported Chains', value: '5+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-[#363523] to-[#2a2820] border border-[#fff2b0]/10 rounded-lg p-6 text-center hover:border-[#fff2b0]/30 transition-colors"
              >
                <div className="text-3xl font-bold text-[#fff2b0] mb-2">
                  {stat.value}
                </div>
                <p className="text-xs uppercase tracking-widest text-[#c1c0bc]/60 font-bold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
