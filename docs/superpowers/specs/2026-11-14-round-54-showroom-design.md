# Round 54: a calmer header, a still first view, the sentence, the range wheel, a simple footer and an All products page

Status: for Bob's approval (builder check done; its questions are settled under "My calls"). Decided through eleven
rounds of mock-ups on 2026-11-14 and 15 (`public/mockups/r54/`, not committed). The whole home page as decided is
`/mockups/r54/site11.html?look=c&over=over` (run the dev server); the All products page is `/mockups/r54/products.html`.
In that mock-up the reviews, the people behind it and Visit are the live site itself, shown in a frame.

## Why

Bob wants the products easier to see and more cinematic, a page that lists every product on its own, an "Our solution"
section, a slightly more modern site (especially the header), more motion so the site is "not completely still", a
simpler footer, and a site that feels "cinematic and premium like business". He gave style references (soft glass phone
UIs, round icon buttons and pills, bold mixed-weight type; genomines.com for a seamless first view; squared-media.nl for
the footer) and said not to copy them. After looking at how Apple, EcoFlow, Anker SOLIX and Tesla show a range (one
product stands for a category, one product a screen) he chose to have one product stand for each range, with the
ranges changing in place as you scroll, "so the website doesn't just look like one scroll down and it easily reaches
the end".

## What Bob decided (from the mock-ups)

1. **Header B, minimal.** One floating glass capsule that never moves or hides: the mark and "Jontai Energy" on the
   left; on the right one pill holding three icons (Support, Member, language) and a round Menu button with two lines
   and no word. It turns deep green with pale ink over dark sections, as today. The full-screen menu stays and gains
   "All products" and "Our solution".
2. **First view: still, light, four facts** (`site11.html`, look C, picked 2026-11-15). Light green over the faint,
   slowly moving valley (as today, barely visible). Centred: "Aruba sunlight, **made useful.**" in the site's mix of
   light and bold, one line ("Solar, backup power, lighting, cooling, security cameras and furniture, from one
   family-owned store in Oranjestad."), and two buttons, "Visit the store" (forest) and "See what we sell" (glass pill).
   Along the foot, four facts on one ruled line, each with a small label: **Hours** "**Open now**, until 7:00 PM" (live,
   from the store hours, as today); **The store** "**Cumana 73**, Oranjestad"; **What we sell** "**Six ranges**, one
   store"; **Jontai Rewards** "**Afl. 25 back** for every Afl. 500" (from `lib/loyalty.ts`). No big JONTAI, no scene, and
   no handover effect: the words rise in once as the page opens, and when you scroll the first view holds still while
   Rewards slides up over it as a sheet with rounded top corners (Bob: "C and rewards slides over"). It fits one
   screen; on phones the facts sit two by two.
3. **Rewards.** The same content and rules (`lib/loyalty.ts`), laid out calmer: "Shop as usual. **Earn it back.**" with
   one line under it; the two plans side by side with a thin rule between, each its card shown small and tilted, a
   large figure ("**Afl. 25** back", "**10%** off"), one sentence and "How it works" (which opens the existing steps
   panel); then "See my points" and "Not sure which card fits? Ask us; a person answers." No pill or chip above the
   title (Bob, round 43). Motion: the heading rises into place line by line, the two cards float gently and lean toward
   the pointer, and the figures count up once when they come into view.
4. **Our solution: the sentence.** It takes the place of the "Why Jontai" section. The screen holds one large paragraph
   that fills in as you scroll, the key promises turning bold green:
   "At Jontai, your home makes **its own power**, so the island's blackouts do not stop your day. We **fix what we
   sell**, even years later. Our prices are **hard to beat**, for the same quality or better. We sell **far more than
   solar**. **Every customer matters**, long after the sale. And our family **keeps learning**, to bring tomorrow's
   ideas home."
   When it is full, six small icon points appear under it: Your own power, We fix what we sell, Prices hard to beat,
   More than solar, Every customer matters, Always learning. The paragraph and the points fit one screen. **No people,
   names or photos** (Bob: remove Bob and Chakho).
5. **The ranges: the wheel**, on **dark green** (picked 2026-11-15 over Posters, The walk and The index; the dark
   showroom of mock-up 6 was rejected as "not good designed"). The home page's six range rows are replaced by one held
   screen, opened by the heading "Six ranges. **One store.**" and one short line. The whole What we sell block, its end
   band included, is the site's deep green, and the header turns deep green over it. As the block arrives it grows from
   a rounded card, inset from the screen's sides, out to the full width.
   - Left: the six range names stand on a drum, like a phone's date picker. The name in front sits between two
     hairlines at full strength; the names above and below tilt away on the curve and fade. Scrolling turns the drum one
     name at a time, resting on each range before it turns on. Clicking a name turns to it.
   - Right: **one product** per range, large, as a clean cut-out: no haze or large blurred shadow round it, only a small
     shadow where it meets the floor, and a faint wash of that range's colour across the screen (sun-yellow for Solar,
     sea-glass for Cooling, leaf for Backup power, lamp-warm for LED lighting, slate-mist for Security, sand for
     Furniture). The products slide past vertically in step with the drum (the current one goes up and out as the next
     comes up from below, with no blur and no overlap) and bob very slightly while they rest.
   - Each range is plainly a link to its products on the All products page (`/products?range=<id>`), in three ways
     (Bob: "needs to be clickable somewhere more visible ... even from image"): a large cream button at the foot left,
     "See all 7 LED lighting products", with "04 / 06" beside it; the product picture itself (it lifts a little on
     hover and shows "See all LED lighting"); and the name in front on the drum.
   - Each range shows only its name, its product and that button: no description line (Bob: the title alone is fine).
   - After Furniture the screen lets go into the end band: "Every product, **one by one.**" with "See all products".
   One product per range: Solar, the solar panel; Cooling, the solar air conditioner; Backup power, the portable power
   station; LED lighting, the bulb (hanging from the top by its cord); Security, the outdoor solar camera; Furniture,
   the lounge chair.
6. **All products page** at `/products` (`products.html`, "Light pools"). Title "All **products**", one line, a filter
   pill for each range plus Others (with counts), a search box, then every product in a grid of four: the product
   standing in a soft pool of white light (no frame), the range in small text, the name in bold and a round arrow; it
   opens the product's page as today (the sheet over the page). Others (SD cards, small solar lights, solar doorbells,
   WiFi mesh) is a ruled list of words at the end. `/products?range=<id>` opens it on that range ("See the range").
   Solar shows every solar product, as on the home page today (`shownIn`).
7. **The footer, simple** (after squared-media.nl, not copied; Bob: "the footer should be more simple"). On the light
   paper ground: a large centred question, "Questions? **A person answers.**", one line ("Call, send a message or come by
   Cumana 73. Someone at the store reads every message."), and two buttons, "Send a message" (the existing contact form)
   and the phone number. Under a hairline, four short columns of plain links: **Pages** (What we sell, All products,
   Rewards, Request a quote, Visit), **Help** (Support, Questions, Large-item delivery), **Follow** (Facebook,
   Instagram), **Contact** (email, phone, address). A last thin line holds the copyright with the service line ("sells
   and delivers; it does not install"), the concept note with the link to jontaienergy.com, and the languages. The huge
   JONTAI ENERGY and the old three columns go. The footer is the same on every page.
8. **Motion through the page** (Bob: "more motion or animation so the site is not completely still", "cinematic and
   premium"): the smooth scroll the site already has (Lenis); headings rise into place line by line as they arrive,
   with their lines and buttons fading up just after; the Rewards cards and figures as in 3; the sentence as in 4; the
   wheel's arrival, turning and resting motion as in 5; footer links underline from the left on hover.
9. **Unchanged:** the reviews, the people behind it, Visit, the product pages and sheets, quote, support.

## Goals

- The first view says plainly what Jontai is, and looks like a premium store, not a scene.
- Each range is easy to see and read: one product and its name.
- Scrolling through What we sell feels like turning through the store's ranges, not a long list.
- Every product is reachable on one page, filtered by range.
- The site moves enough to feel alive and cinematic, and stays professional and calm: no gimmicks.

## Non-goals

- New product pictures (no credits needed; the existing `public/sky/range-*` pictures are used).
- Any change to the reviews, the team, Visit or the product pages.
- Prices.

## Anti-goals (what Bob rejected this round)

- More than one product per range on the home page, or products overlapping each other or their names.
- Chats, flip cards, day stories, cursor-following pictures, anything that reads as a trick.
- Glass pills with status dots, eyebrow chips, decorative shapes, boxes round reading text.
- Bob's or Bryan's names or photos in Our solution.
- A dark showroom for the ranges, crossfades that blur one product into the next, and a description line plus two
  buttons on every range.
- Haze or large blurred shadows round the product pictures, which make them look like they have a background.
- Copying a reference's look (the genomines field of light strands was "too close"); handover effects in the first view
  (the name flying into the header, letters parting, the card opening); the big JONTAI in the first view.

## Constraints

- Next.js 14 app router on branch `redesign/v9-after-hours`; styles in `app/styles/*.css`; Archivo (with its width axis)
  is the only family; Phosphor icons; GSAP ScrollTrigger with Lenis for scroll motion, as the site already does.
- The translator swaps whole text nodes by their exact English (`lib/i18n/es.json`, `zh.json`), so every new string
  goes in both dictionaries, and **the sentence must fill phrase by phrase, not word by word**: each phrase is its own
  text node so it can be translated. Strings with a number in them (the wheel's button, the facts) are built from
  separate text nodes so each part translates.
- Product data stays in `lib/islands.ts` (`ISLANDS`, `PRODUCTS`, `shownIn`, `OTHERS`); store facts in `lib/store.ts`;
  the product pages and the sheet route (`app/@modal/(.)products/[slug]`) must keep working, including from the new
  `/products` page.
- Anchors the footer and menu use (`#solar`, `#cooling`, `#backup`, `#light`, `#security`, `#upstairs`, `#products`,
  `#rewards`, `#visit`, `#delivery`) must still land in the right place: a range anchor scrolls to the point where the
  wheel rests on that range.
- Reduced motion: no held screens and no floating, bobbing, counting or rising. The sentence shows fully; the wheel
  becomes six still rows one after another, each with the range's name, count and "See the range" beside its product;
  Rewards scrolls normally after the first view.
- Phones: the first view's facts sit two by two; the wheel keeps the held screen, with the drum of names in the top part
  and the product below it; the footer's columns sit two by two.
- Keyboard and screen readers: the names on the drum are real buttons in order, and the one in front is marked as
  current.
- Tests (`npm test`, `node --test lib/i18n/translate.test.ts`), lint, types and build pass.

## My calls (settled after the builder check; Bob can overrule)

- **Delivery.** While Furniture is in front, the wheel's foot adds "How delivery works", which opens the existing
  delivery panel. The footer's `#delivery` link lands there.
- **The range notes move to the All products page.** The wheel shows names only, so the notes appear on `/products`
  under the matching filter: Cooling's "Jontai Energy sells and delivers; it does not install.", LED lighting's "Stock
  changes often, so ask before you make the trip." and Furniture's "Large-item delivery available."
- **"Pictures are illustrations, not specific stock."** sits in the band that ends the wheel and at the foot of the All
  products page.
- **Others.** The full list (SD cards, small solar lights, solar doorbells, WiFi mesh) with "Ask us" and "Request a
  quote" moves to the All products page, under its Others filter and at its foot. The band that ends the wheel adds one
  line: "Also SD cards, small solar lights, solar doorbells and WiFi mesh." with "Ask us".
- **The street lamp on /products.** The grid has no frames, so a cropped pole would hang in mid-air: the All products
  page uses the whole lamp, published to `public/sky/range-pole-lamp-full-{640,1200}.webp` from the round 53 source.
  Framed places (the product page, its sheet, "More in") keep the cropped head rising from the frame's foot.
- **The first view's hours.** "Open now, until 7:00 PM" changes with the time of day, as the open-now line does today;
  when closed it says when the store opens next.
- **The footer's contact details** come from `lib/store.ts` (phone, email, address, socials), and its language row uses
  the existing language switch.

## Left to the builder

Timings and easing; exact sizes and breakpoints; how the held screens are coded (one ScrollTrigger timeline per
section is expected); component names and files; whether `Collection`, `Why`, `CollectionMotion`, `ProductRail` and the
old footer's `FitText`/`FooterFocus` are deleted or kept; how the All products filters keep their state.
