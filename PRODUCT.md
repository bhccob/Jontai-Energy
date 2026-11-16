# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Households and small businesses in Aruba who want lower power bills or backup power, plus anyone furnishing a home. They browse on a phone or laptop before driving to the store, and they want to know what is in stock, what it does, and whether it can be delivered.

## Product Purpose

The website for Jontai Energy, a retail store at Cumana 73, Oranjestad. It shows what the store sells and gets people to visit, message on WhatsApp, or request a quote. Success is a visitor who knows which product fits and contacts or visits the store.

## Positioning

A family-owned store (owner, 2026-10-27), which the owner says means more care for the products and the customers. One store carries both sides of a home: solar panels, inverters, generators, LED lighting and solar security cameras on the ground floor, and furniture on the second floor. Jontai delivers large items (generators, furniture) to the door. Jontai does not install. The home page says "Family-owned" in the hero's top line and as the statement's first point; a team page is a later feature, shown as "Meet the team · Coming soon" and not a link (owner, 2026-10-28).

## Operating Context

- No online checkout. Buying happens in the store, over WhatsApp, or through a quote request. No prices are published on the site.
- Loyalty program: spend Afl. 500, get Afl. 25 back (earned per full Afl. 500 block), rewards accumulate, reset after one year of use. Business members reach 5,000 points for 10% off for the rest of the year, until the account anniversary (as the store states it in `lib/loyalty.ts`, 2026-10-27). Membership is opened in store; the member login is a placeholder until points are connected.
- Delivery yes, installation no. Manufacturer documents say inverter wiring needs a licensed electrician and the solar AC needs an HVAC technician.
- Support (`/support`, owner, 2026-10-28): questions, warranty, returns and in-store service, shortened from the store's own policies on its current site (`lib/support.ts`), without installation, technicians, on-site work, prices or financing. The header's right link is Support; quotes stay reachable from the menu, chapters, panels, Visit and the footer.

## Capabilities and Constraints

- Stack: Next.js 15 App Router, TypeScript, plain CSS on design tokens (`app/tokens.css`, sections in `app/styles/`), Archivo through `next/font/google`, Lenis on the GSAP ticker, GSAP ScrollTrigger (scroll progress; one pinned section, the product rail), pnpm. No film: the home page is type, colour fields and the catalogue renders in `public/catalog`. One live 3D piece, chapter 04's bulb (three.js, `components/home/bulbScene.ts`), loads only as it nears the screen, renders only while it shows, and leaves the picture in place without WebGL. Scroll motion comes from data attributes read by `components/motion/PageMotion.tsx`; on wide screens the products run sideways on a pinned rail and a resting scroll settles onto each one (`ProductRail`, `useSettle`); phones keep them stacked. Glass is a token set in `app/tokens.css` with a `.glass` class. `tools/blender/` (the retired film) stays in the repo but is not shipped.
- Verification screenshots: `node tools/shots/shoot.mjs` against the dev server (see its header).
- The legacy static site (`index.html`, `pages/`, `assets/`) was deleted on 2026-11-16; it is in the git history before that date.
- Product facts come only from manufacturer documents (see Evidence). Categories without datasheets (LED, cameras, furniture, generators) list what is carried, with no invented specs.

## Brand Commitments

- Name: Jontai Energy. Hero copy from the owner's brief of 2026-10-26: "Aruba sunlight, made useful." with "Explore solar" and "Visit the store".
- Palette pinned by the owner: light green #B8D8A8, fresh green #79AE72, deep forest #173D2C, warm wood #B78455, light oak #D8B98E, warm background #F7F5EC, text #183128. Wood is architecture (stands, plinths, rails), not rustic decoration. This supersedes an earlier "dark and atmospheric" answer.
- Type: one family, Archivo. Wide and heavy (800, tight tracking) for headings and fitted words, narrow capitals (width 62) for labels and big figures, regular for body. Big and readable, because the store has few good photographs of itself.
- Direction chosen 2026-10-27 after studying nexdash.com and sedlecky-kaolin.com: type-led (spec `docs/superpowers/specs/2026-10-27-type-led-redesign-design.md`). The type is the hero; every scroll lands on one thing to read and text never fades out while it is read; no boxes or glass, only colour fields (sand, forest, oak upstairs), rules and space; products are the catalogue renders on the stage colour #EEE6D8 with feathered edges. A charging loader on the first visit, a shared product stage on wide screens, the 3D loyalty card. It supersedes "One day of Aruban sun" and the glass treatment.
- Round 2 (owner, 2026-10-28, spec section "Round 2"): glass returns, as an accent on what floats over colour (the header bar, the phone menu, product panel and member login, the stage's capsules, the visit panels, the regular loyalty card), never the reading text. The hero is calmer (top line, JONTAI, headline, lead, two buttons) and "In the store" is its own band after it. Product chapters settle into place, chapter 04's bulb is live 3D, LED strips are carried, and the tab title is "Jontai Energy | Smart Lights Smart Savings". Rewards keeps its name.
- Round 3 (owner, 2026-10-28, spec section "Round 3"): the header is slim (the mark, Support and Menu; a frosted bar edge to edge, no floating box) and the menu opens full screen on every screen. On wide screens the products lock in place and slide sideways, each holding still to be read and snapping on in the direction you scroll, then climb away in a staircase to the next section. "In the store" is gone (the hero leads into the statement), and Visit's details are ruled columns, not glass panels.
- Earlier direction (2026-10-26, retired 2026-10-27) after studying mdebeauty.com and fitosauna.com: "One day of Aruban sun". The scroll is the time of day; one sunlit lime-plaster wall with a divi-divi shadow carries every product at its hour, then morning light rises to the furniture floor. Interactions the owner asked for: a 3000K to 6500K bulb slider and a site-wide day/night switch (the switch was removed again on 2026-10-27; the site is in day colours only). No house interiors and no imitation of the real store (the staircase clip was removed for that reason).
- Copy rules: "Afl." for every amount. Never "We install", "Installation services", "Our installers" or anything implying installation comes with a purchase. Delivery wording: "Large-item delivery available. Ask us about furniture delivery." Service line, verbatim: "Jontai Energy is a retail store and does not provide installation services. Delivery is available for large items such as furniture."

## Evidence on Hand

- Namkoo SPI series datasheet and SPI-8K-UP / SPI-10K-UP user manual (`C:\Users\bhcco\Downloads\美标8KW说明书.pdf`, plus the datasheet image the owner shared).
- Namkoo 3000W Portable Power Station spec sheet (image the owner shared).
- Namkoo ACDC hybrid solar air conditioner brochure and installation manual (`C:\Users\bhcco\Downloads\`).
- Product photos in `public/products/`.
- Store facts in `lib/store.ts` (hours need confirming before launch).
- Absent: customer testimonials, real store interior photos, prices, stock levels. Do not fabricate them. Generated imagery and 3D models are illustrative and must not be presented as the actual store or stock.
- Open items for the owner: `docs/content-placeholders.md`.

## Product Principles

1. Every claim traces to a document or the owner; anything else is phrased as "ask in store".
2. The site sends people to a person: WhatsApp, the counter, or a quote. Never a dead-end cart.
3. Energy and furniture are one home, not two shops. Transitions between them should feel continuous.
4. Delivery is a promise worth repeating; installation is a boundary worth stating.

## Accessibility & Inclusion

Without JavaScript every section is complete and there is no loader. Reduced motion gets no loader, no movement, no smoothing and no settling onto chapters; everything shows in place, and the bulb slider, the 3D bulb (which then never turns by itself) and the loyalty card still work. Reduced transparency, or no backdrop blur, turns every glass surface solid. The 3D bulb is an extra: its canvas is `aria-hidden`, its picture keeps the description, and the slider works without it. Save-Data skips the loader. Text split for animation keeps the sentence for screen readers (a visually hidden copy; the split copy is `aria-hidden`); the loader and decorative renders are `aria-hidden`, and each product keeps its own described picture. The native cursor stays; the small sun that followed it was dropped by the owner on 2026-10-27, and the hero list's product disc shows only for a mouse and with motion. Body text meets WCAG AA; green text on sand uses green ink #3D7443.
