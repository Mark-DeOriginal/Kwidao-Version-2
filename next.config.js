/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    // Prevents Turbopack's persistent dev cache from ballooning (was ~1GB+)
    // and removes the slow cache-database compaction on every `next dev`.
    turbopackFileSystemCacheForDev: false,
  },
};
