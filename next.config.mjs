const dev = process.env.NODE_ENV !== 'production';
// Vercel's toolbar (comments and feedback on preview links) loads from vercel.live, on preview deployments only.
const preview = process.env.VERCEL_ENV === 'preview';
const toolbar = (...sources) => (preview ? sources : []);

/**
 * What a page may load (docs/security). Everything the site uses is its own: scripts, fonts (next/font), the film's
 * frames and video, the showroom model. Inline scripts stay allowed because Next.js streams each page with small
 * inline scripts and app/layout.tsx runs one before paint; there are no third-party scripts to trust.
 */
const csp = [
  "default-src 'self'",
  // wasm-unsafe-eval: the Meshopt decoder that unpacks the showroom model is WebAssembly (components/stage/models.ts).
  // unsafe-eval only in development, where Next.js's fast refresh needs it.
  ["script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'", dev && "'unsafe-eval'", ...toolbar('https://vercel.live')],
  ["style-src 'self' 'unsafe-inline'", ...toolbar('https://vercel.live')],
  // blob: and data: for the textures three.js unpacks from the model.
  ["img-src 'self' data: blob:", ...toolbar('https://vercel.live', 'https://vercel.com')],
  ["font-src 'self' data:", ...toolbar('https://vercel.live', 'https://assets.vercel.com')],
  "media-src 'self' blob:",
  ["connect-src 'self' blob: data:", ...toolbar('https://vercel.live', 'wss://ws-us3.pusher.com')],
  "worker-src 'self' blob:",
  preview ? 'frame-src https://vercel.live' : "frame-src 'none'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .map((d) => (Array.isArray(d) ? d.filter(Boolean).join(' ') : d))
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Vercel sends the same; stating it keeps it if the site is ever hosted elsewhere.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // No other site may show these pages in a frame (frame-ancestors above; X-Frame-Options for older browsers).
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The site uses none of these.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No "X-Powered-By: Next.js" on every answer.
  poweredByHeader: false,
  // The legacy static site still lives in /pages and /assets; keep Next from treating it as routes or lint targets.
  pageExtensions: ['tsx', 'ts'],
  eslint: { dirs: ['app', 'components', 'lib'] },
  transpilePackages: ['three'],
  // Lets a second dev server run beside the first without sharing (and corrupting) one build folder.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async headers() {
    // A concept build (lib/store.ts CONCEPT) keeps every file out of search engines, the film's frames and photos included.
    const concept = process.env.NEXT_PUBLIC_OFFICIAL_SITE === '1' ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [{ source: '/:path*', headers: [...securityHeaders, ...concept] }];
  },
};

export default nextConfig;
