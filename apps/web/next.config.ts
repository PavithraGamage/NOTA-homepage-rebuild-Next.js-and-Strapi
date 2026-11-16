import type { NextConfig } from 'next';

/** Media is served from Strapi's public domain; next/image must be allowed to fetch it. */
const strapiPublicUrl = new URL(process.env.STRAPI_PUBLIC_URL ?? 'http://localhost:1337');

const securityHeaders = [
  // R3: never index this rebuild, even if HTML metadata were changed.
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // Cache Components (the 16.x default) is off on purpose: it prerenders a static shell at
  // build time, and our build cannot reach Strapi. We use tagged fetch caching instead.
  cacheComponents: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: strapiPublicUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapiPublicUrl.hostname,
        port: strapiPublicUrl.port,
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
