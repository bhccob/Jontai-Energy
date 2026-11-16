# Security audit, 16 November 2026

The repo is public on GitHub and the site runs on Vercel. This audit checked every tracked file, the full git history on
every branch, the live site, the two form routes, the HTTP headers, the client code and the dependencies. The fixes are on
branch `security/harden-site`.

## Summary

| # | Severity | Finding | Status |
|---|---|---|---|
| H1 | High | Next.js 14.2.35 is out of support, with 25 known advisories (3 critical) | Fixed: Next 15.5.29, React 19 |
| H2 | High | A plain `.env` or `.env.production` would have been committed | Fixed: `.gitignore` |
| M1 | Medium | No CSP, frame, nosniff, referrer or permissions headers | Fixed: `next.config.mjs` |
| M2 | Medium | Form routes had no rate limit or origin check, and the size limit could be skipped | Fixed: `lib/guard.ts` |
| M3 | Medium | GitHub secret scanning, push protection and Dependabot alerts are off; no branch protection | Bob |
| L1 | Low | The email check let a display name or odd address into the Reply-To | Fixed: `lib/fields.ts` |
| L2 | Low | Control and text-direction characters reached the store's inbox | Fixed: `lib/fields.ts` |
| L3 | Low | Python caches committed; mock-ups, reviews and worktrees not ignored | Fixed: `.gitignore` |
| L4 | Low | Personal emails and a Windows user name sit in git metadata and two scripts | Bob (optional) |
| L5 | Low | `X-Powered-By: Next.js` on dynamic answers | Fixed |
| L6 | Low | Dev-only packages with advisories (`sharp`, `minimatch`) | Accepted, see below |
| L7 | Low | The rate limit lives in server memory, one count per instance | Bob: Vercel Firewall rule |

No secret was ever committed. No key needs rotating.

## High

### H1. Next.js 14 is out of support

- Where: `package.json:23` (was `"next": "^14.2.25"`, installed 14.2.35).
- Why: Next 14 gets no more patches. `pnpm audit` listed 35 advisories, 25 of them in Next: 3 critical, 9 high. Most
  critical ones need self-hosting, Windows hosting or the image optimizer on your own server. But the Server Components
  denial-of-service bugs reach any App Router site, Vercel included.
- Fix: Next 15.5.29 (the patched line) and React 19.3.1. Four pages now await `params` and `searchParams`
  (`app/products/[slug]/page.tsx`, `app/@modal/(.)products/[slug]/page.tsx`, `app/contact/page.tsx`,
  `app/quote/page.tsx`). Next's pinned PostCSS 8.4.31 is overridden to 8.5.31 (`package.json:48`); the CSS output is
  byte for byte the same. `pnpm audit` now shows 4 advisories, all in dev tools.

### H2. Env files were not all ignored

- Where: `.gitignore:7` (was `.env*.local` only).
- Why: the repo is public. A `.env` or `.env.production` holding `RESEND_API_KEY` would have been committed and pushed.
- Fix: `.gitignore:11` ignores every `.env*` file except `.env.example`, plus `.vercel/`, `*.pem` and `*.key`.

## Medium

### M1. Missing security headers

- Where: `next.config.mjs:14` (CSP) and `next.config.mjs:36` (the other headers).
- Why: the live site only sent HSTS (Vercel adds it). Any site could frame the pages (clickjacking), and nothing limited
  where scripts could load from.
- Fix: every page now sends:
  - `Content-Security-Policy`: only the site's own scripts, styles, fonts, images, video and model. No plugins, no
    framing (`frame-ancestors 'none'`), forms post only to the site, `base-uri 'self'`. `wasm-unsafe-eval` lets the
    Meshopt decoder (WebAssembly) unpack the showroom model. On preview deployments it also allows Vercel's toolbar.
  - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy` turning off camera, microphone, location, payment, USB and Topics.
  - `Cross-Origin-Opener-Policy: same-origin` and HSTS (the same value Vercel sends).
- Note: scripts keep `'unsafe-inline'`. Next.js streams every page with small inline scripts, and `app/layout.tsx:91`
  runs one before paint. Nonces would make every page render on demand instead of static. There are no third-party
  scripts, so the policy still blocks any script from another site.
- Checked in a production build: home page, sky video, fonts, language switch (and its head script), member login,
  product panel, product, quote, contact and support pages all load with no CSP violations.

### M2. The form routes could be abused

- Where: `app/api/quote/route.ts` and `app/api/contact/route.ts`. Now `app/api/quote/route.ts:18`,
  `app/api/contact/route.ts:17` and `lib/guard.ts:98`.
- Why: once the site goes official, these routes send email through Resend.
  - No rate limit: a script could flood the store's inbox and the Resend quota.
  - No origin check, and `request.json()` also parsed `text/plain`. Another site could make a visitor's browser post a
    message with no preflight.
  - The 20 kB limit read `Content-Length` only. A chunked body sends none, so the whole body was read.
  - Today the routes answer 403 first, because the site is a concept build. So this was not exploitable yet.
- Fix: `lib/guard.ts` runs before any field is read:
  - Refuses posts from other sites (`Sec-Fetch-Site`, `Origin`): 403.
  - JSON only: 415.
  - 5 posts per address per 10 minutes: 429 with `Retry-After`.
  - Counts bytes while reading and stops at 20 kB: 413.
  - The honeypot field and the field checks stay as they were. The forms already fall back to the visitor's email app on
    any refusal.
- Tested with `lib/guard.test.ts` and against a real production build: cross-site 403, `text/plain` 415, a 30 kB chunked
  body 413, the sixth post 429.

### M3. GitHub protections are off

- Secret scanning, push protection, Dependabot alerts and Dependabot security updates are all disabled.
- The default branch `Jontai-Energy` has no protection: anyone with push access can force-push or delete it.
- Bob's to do, below.

## Low

### L1. The email check was loose

- Where: `lib/message.ts:33` and `lib/quote.ts:61` (old), now `lib/fields.ts:7`.
- Why: `Evil<ana@example.com>` passed and became the Reply-To. A mail client could show "Evil" as the name.
- Fix: one plain address only: no spaces, quotes, angle brackets or commas.

### L2. Hidden characters reached the inbox

- Where: now `lib/fields.ts:13`.
- Why: null bytes and right-to-left override characters could make a name or subject read differently from what was
  typed.
- Fix: control characters (except tabs and line breaks) and direction marks are stripped from every field.

### L3. Stray files

- `tools/blender/film/__pycache__/*.pyc` were committed. Removed and ignored.
- `public/mockups/`, `.impeccable/review/`, `.claude/worktrees/` were not ignored. A mock-up committed to `public/`
  would be served to anyone. All three are ignored now.

### L4. Personal details in git metadata

- Two personal Gmail addresses and a laptop host name are commit authors. Every public repo shows these.
- `update-i18n.ps1:1` and `update-i18n-v2.ps1:1` hold a local Windows path with your user name. Older docs in the history
  do too.
- These cannot be removed without rewriting history. That is not needed for safety. See Bob's to do.

### L5. Framework banner

- Next.js sent `X-Powered-By: Next.js` on dynamic answers. Off now (`next.config.mjs:53`).

### L6. Dev-only packages with advisories

- `sharp` 0.33.5 (`package.json:43`, 3 high): bugs in libvips, libheif and librsvg. They matter when processing untrusted
  images. Only the `tools/` scripts use it, on your own renders and Higgsfield downloads. Left pinned so the tools' output
  does not change. Bump it to 0.35.5 or later next time you run them.
- `minimatch` under `eslint-config-next` (1 moderate): slow matching on hostile glob patterns. Only our own lint config
  feeds it.

### L7. The rate limit is per server instance

- `lib/guard.ts:72` keeps counts in memory. Vercel can run several instances, each with its own count. It slows one
  sender down but does not stop a crowd. A Vercel Firewall rule is the stronger layer. See Bob's to do.

## Checked and fine

- No secret in git. All 212 commits on all branches were scanned for 17 key formats (Resend, OpenAI, Stripe, AWS,
  GitHub, Google, Slack, private keys, JWTs and more) and for any `KEY`, `SECRET`, `TOKEN` or `PASSWORD` set to a value. No `.env` file was ever committed. The real Resend key in your
  local `.env.local` appears nowhere in the history.
- Vercel has no environment variables set, so the live site holds no key. Preview deployments need a Vercel login.
- The live site serves only `public/`. `/.env`, `/.env.example`, `/audit.txt`, `/index.html`, `/pages/about/index.html`,
  `/assets/js/main.js`, `/package.json`, `/next.config.mjs`, `/.git/config` and `/tools/sky/prompts.md` all return 404.
  The legacy static site, `tools/` and `docs/` are readable on GitHub but not served.
- No source maps ship (`/_next/static/chunks/*.js.map` returns 403). No key or local path is in the client bundles.
  `RESEND_API_KEY` is read only in the two route handlers, on the server.
- `dangerouslySetInnerHTML` is used twice, with constants only (`app/layout.tsx:91`, `app/layout.tsx:106`).
- Every `target="_blank"` link has `rel="noopener noreferrer"`. No open redirect: the only scripted navigation uses the
  site's own data (`components/home/StoryMotion.tsx:266`).
- `/lab` returns 404 in production (`app/lab/page.tsx:9`).
- Browser storage holds no personal data: the language choice in `localStorage` (`lib/i18n/store.ts:44`) and "bundle offer
  seen" in `sessionStorage` (`components/ui/BundleOffer.tsx:33`).
- No image in the repo carries EXIF location or camera data. The showroom model holds only its generator name.
- Visitors only see generic errors. Resend's error body is logged on the server only (`app/api/quote/route.ts:44`).
- `node_modules` was committed once (commit `75a792a`, removed in `1664a83`). It only adds weight; nothing secret is in it.
- The phone, store email and address in `lib/store.ts` are the store's public business details.
- The team photos (`/team/bob.webp`, `/team/bryan.webp`) are public on purpose, for the home page. Anything in `public/`
  can be downloaded by anyone.

## Bob's to do

These need your accounts. Nothing here is urgent: no key leaked.

1. **GitHub, Settings, Code security:** turn on Secret scanning, Push protection, Dependabot alerts and Dependabot
   security updates.
2. **GitHub, Settings, Branches:** add a rule for `Jontai-Energy`. Require a pull request, block force-pushes and
   deletion.
3. **GitHub, Settings, Emails (your account):** tick "Keep my email addresses private" and "Block command line pushes
   that expose my email". Then set `git config --global user.email` to your GitHub noreply address. Bryan can do the same.
4. **Vercel, Firewall:** before the site goes official, add a rate-limit rule for `/api/contact` and `/api/quote` (for
   example 5 requests per 10 minutes per IP). This audit could not read the current firewall settings.
5. **Vercel, Environment variables:** when the site goes official, add `RESEND_API_KEY` as a Sensitive variable,
   Production only. If it ever shows up anywhere public, rotate it in Resend at once.
6. **Optional clean-up:** delete what is no longer used: `update-i18n.ps1`, `update-i18n-v2.ps1`, `audit.txt`, and the
   legacy static site (`index.html`, `pages/`, `assets/`). Your call.
7. **History rewrite:** not needed, since no secret was committed. Only if you want the author emails gone from old
   commits. That means rewriting history and force-pushing every branch, which breaks every open clone and worktree.
   I did not do it.
