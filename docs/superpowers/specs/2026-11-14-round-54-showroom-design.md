# Round 54: a calmer header, a still first view, the sentence, the range wheel, a simple footer and an All products page

Status: approved by Bob and built (2026-11-15); updated after the build for the wheel by name and the old footer. Was: for Bob's approval (builder check done; its questions are settled under "My calls"). Decided through eleven
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
   "All products" and "Our solution". The globe opens the three languages in a pane under the capsule, each named in
   itself with the one in use ticked; it stays cream over dark sections, like the Menu button (Bob: "the header to
   change language doesnt appear good"; the capsule had been clipping the list).
   The menu (Bob, of its eleven big capitals: "this is so cluttered"): four big places on the home page in the site's
   light wide type, sentence case and no rules (What we sell, Our solution, Rewards, Visit the store); beside them on
   wide screens and under them on phones, small, under quiet labels: Ranges (All products, then the six ranges, each
   straight to its products) and Help (Support, Send a message, Request a quote, Get directions); then the languages.
2. **First view: still, four facts** (`site11.html`, look C, picked 2026-11-15). Forest green over the faint, slowly
   moving valley (barely visible): light green at first, then on 2026-11-16 Bob: "make the first view page background
   color to be darker green like above the footer color", so the field is Visit's #173d2c with pale words, the header
   turns deep green over it, and the browser's bars match. Centred: "Aruba sunlight, **made useful.**" in the site's
   mix of light and bold, one line ("Solar, backup power, lighting, cooling, security cameras and furniture, from one
   family-owned store in Oranjestad."), and two buttons, "Visit the store" (pale) and "See what we sell" (clear glass
   with a pale rim), the pair Visit uses.
   Along the foot, four facts on one ruled line, each with a small label: **Hours** "**Open now**, until 7:00 PM" (live,
   from the store hours, as today); **The store** "**Cumana 73**, Oranjestad"; **What we sell** "**6+ ranges**, one
   store"; **Jontai Rewards** "**Afl. 25 back** for every Afl. 500" (from `lib/loyalty.ts`). No big JONTAI, no scene, and
   no handover effect: the words rise in once as the page opens, and when you scroll the first view holds still while
   the next section slides up over it: Rewards at first (Bob: "C and rewards slides over"), What we sell since Bob's
   order of 2026-11-16 ("1. First view 2. What we sell 3. Reviews 4. Our solution 5. Rewards 6. Team 7. Visit the
   store and the footer"), its deep green rising as a rounded card that grows to the edges. Asked for my order, I
   swapped one pair, promise before proof, and Bob: "do your order": first view, What we sell, Our solution (the
   ranges' green hem now hangs over it), Reviews, Rewards, Team, Visit, so white and mist take turns. It fits one
   screen; on phones the facts sit two by two. The soft sun behind the headline drifts slowly round the top of the
   screen and the green veil thins round it so the valley shows through there; the valley and the words lean a touch
   for depth. (It followed the pointer for a while; cursor effects were dropped, see 8.) With reduced motion it stays
   still.
3. **Rewards.** The same content and rules (`lib/loyalty.ts`), laid out calmer: "Shop as usual. **Earn it back.**" with
   one line under it; the two plans one under the other with a thin rule between, each a tall row of its own (Bob:
   "loyalty program area gotta be bigger ... more verticaly long(er)"): its card shown large and tilted on one side
   (the home card left, the business card right; above the text on phones), and on the other a large figure
   ("**Afl. 25** back", "**10%** off"), one sentence and "How it works" (which opens the existing steps panel under the
   text); then "See my points" and "Not sure which card fits? Ask us; a person answers." No pill or chip above the
   title (Bob, round 43). Motion: the heading rises into place line by line, the two cards float gently and lean toward
   the pointer, and the figures count up once when they come into view.
4. **Our solution: a line and six cards** (picked 2026-11-15 from three card directions: Bob chose the simple cards of
   direction C, "C is looking best but iwant more simple cards", then, with the line held beside the cards "not quite
   right", the layout "Line on top, 3 x 2 grid"). It takes the place of the "Why Jontai" section. Its ground is the same
   plain white as Rewards just above it (Bob: "the color background as our solution should be the same as loyalty
   area"). The top is laid out like the top of Rewards: "Your home makes **its own power.**" / "We stand behind it."
   large on two lines (rising word by word), and at its foot on the right "Six promises from one family-owned store at
   Cumana 73, Oranjestad." and Visit the store. Under it six tall cards (after the 3 x 2 grid, Bob: "no i want more
   simple card design view, something like https://www.squared-media.nl/ where its more cinematic and have animation
   and seem more like business, do not copy exact"): each only a number (01 to 06), the promise and one plain line:
   Your own power, We fix what we sell, Prices hard to beat, More than solar, Every customer matters, Always learning.
   Three grounds in turn from the site's greens (deep, brand green, pale mint), larger corners, a soft shadow, nothing
   to press. Design 1 (Bob's name for it, commit 8b36495) dealt the cards into a low fan. Bob: "this is good design is
   there more option thats similair"; of three mock-ups (2 the spread, 3 the slide, 4 the turn) he said "maybe design
   3". So, on wide screens, the section holds still under the header while the six cards run in from the right and
   across the screen on a strip as the page scrolls; each leans away from the middle of the screen and sits back a
   little, standing straight and full size as it passes the middle. Under the strip a count (01 / 06 to 06 / 06) and a
   thin rule fill as it runs; scrolling back runs it back. The strip takes whatever room the line leaves (four lines in
   Spanish). Wide screens with reduced motion show the cards in two rows of three. On tablets and phones the cards
   stack into a deck: each stops under the header a little lower than the last and the next slides over it, the
   covered one sinking back and dimming slightly (reduced motion: the deck, still). This replaced the long sentence
   that filled in word by word, then the 3 x 2 grid. **No people, names or photos** (Bob: remove Bob and Chakho).
   Then (2026-11-16) Bob asked whether the cards looked "professional enough for a solar company" and said the
   "background color doesnt match well". Of three mock-ups (A spec sheet, B one deep panel, C on the green) he picked
   **C. On the green**, and "Yes, one dark one light" for the page: Our solution now sits on the forest green #173d2c
   like What we sell above it, every card the same panel (a touch lighter than the green, a hairline rim, a mint icon in
   a soft circle, the number in outline, the promise and one line), standing straight on the strip and in the deck,
   easing back only a touch away from the middle. The page has one dark ground (#173d2c: first view, What we sell, Our
   solution, Visit; the footer a shade deeper, #0e2219) and one light ground (#f3f6f1: Reviews, Rewards, Team); the
   green hangs as a curved hem over the reviews, where the light starts.
5. **The ranges: the wheel**, on **dark green**, by name only (picked 2026-11-15 over Posters, The walk and The index;
   after the build Bob asked: "maybe six ranges products should not include the image? and include others"). The home
   page's six range rows are replaced by one held screen, opened by the heading "6+ ranges. **One store.**" (Bob: "maybe 6+
   ranges isntead of just 6 ranges": six ranges and Others) and the line "Every range, one at a time. Keep scrolling to go
   through them." The whole What we sell block, its end band included, is the
   site's deep green, and the header turns deep green over it. As the block arrives it grows from a rounded card, inset
   from the screen's sides, out to the full width.
   - The names of the six ranges and **Others** stand large across the middle of the screen on a drum, like a phone's
     date picker: the one in front between two hairlines at full strength, the ones above and below tilting away on the
     curve and fading. Scrolling turns the drum one name at a time, resting on each before it turns on. One deep green,
     no colour per range (Bob: "i dont want so much color pallete"). No product pictures on the home page.
   - Each one leads to its products on the All products page (`/products?range=<id>`, Others to its Others list): the
     name in front, marked by a small round arrow beside it that turns under the pointer (Bob: "something indicating
     that its clickable"), and one minimal link at the foot that says only "See all LED lighting products" (Others:
     "See all other products") on a hairline. Clicking another name turns the drum to it.
   - The order matters (Bob: "solar first then led lighting"): Solar, LED lighting, Cooling, Backup power, Security,
     Furniture, then Others. The menu, the footer and the All products page follow it.
   - Large and well apart (Bob: "six range products gotta be bigger and more seperated also better scrolling feel"):
     names about 150px tall on a laptop, neighbours about one and a half name heights apart (more on phones), the outer
     ones melting into the green at the drum's top and foot. A name too wide for the screen in the language shown is
     set down on its own. Each name rests briefly, then the drum turns in a long, gentle ease; when the scroll stops part
     way through a turn the page glides on to the next name the way it was going, like a phone's date picker, so one
     mouse-wheel notch turns one name.
   - After Others the screen lets go into the end band: "Every product, **one by one.**" with "See all products".
   - 2026-11-16, Bob: "6+ ranges, one store gotta be more prominent and creative shown, and also maybe a transparent
     or not very visible placed products for each product when scroll". Of three headings he picked **A. The big
     number**: the heading has a screen of its own, a 6 the height of the screen with a mint +, counting up from 0 the
     first time it comes into view, "ranges." light and "**One store.**" bold beside it, the line under them past a
     hairline (on phones the number on top). And "Fainter than the mock-up": while the wheel turns, the range in front
     shows two of its own products, faint (at most 0.1), either side of its name, fading in as the wheel reaches it and
     out as it turns on, drifting with the turn (Solar: panel and inverter; LED lighting: pole lamp and bulb; Cooling:
     air conditioner and standing fan; Backup power: power station and generator; Security: outdoor and indoor camera;
     Furniture: sofa and lounge chair; Others: none).
6. **All products page** at `/products`, to look at, not to shop (Bob: "i want them to not be like a site that you
   can shop but only to view so more minimal and better displayed"). Title "All **products**", one line ("Everything on
   the shelf at Cumana 73, one by one. Pick one to read what it is."), the ranges as a row of plain names between two
   hairlines (the one shown in ink, underlined; no pills, no counts, no search), then every product large, three to a
   row: the product standing in a soft pool of white light (no frame), the range in small capitals and the name, which
   underlines under the pointer. No buy buttons and no quote. A product opens its **short info** (Bob: "click and see
   short info of the products ... same styling design as the page of display"): a sheet of the page's own light that
   slides in from the side (from the foot on phones) over a soft shade, with the product large, its range, name, model,
   what it is, up to four figures and three points on ruled lines, and "Ask us about it". That detail is kept for Cooling
   and Backup power only (Bob: "cooling and backup power is fine"); elsewhere a product is a kind of product (Bulbs,
   Ceiling lights, Outdoor cameras), so its short info is one general line on what it is and what it is for, with no
   model, figures or points (Bob: "not go too much detailed into some products since its like a subcategory"). Arrows (and the arrow keys)
   step to the product before or after, with "2 / 19"; the cross, the shade, Escape or Back close it. The address keeps
   the range and the product (`?range=`, `?item=`), so links and Back work, and nothing reloads. Others (SD cards, small
   solar lights, solar doorbells, WiFi mesh) is a ruled list of words at the end, with "Ask us". Solar shows every solar
   product, as on the home page (`shownIn`). The full product pages stay for direct links.
7. **The footer: unchanged after all.** A simpler footer after squared-media.nl was built, then Bob asked for the old one
   back ("i want the old footer back also"); the round 53 footer stays as it was. The simple one was: On the light
   paper ground: a large centred question, "Questions? **A person answers.**", one line ("Call, send a message or come by
   Cumana 73. Someone at the store reads every message."), and two buttons, "Send a message" (the existing contact form)
   and the phone number. Under a hairline, four short columns of plain links: **Pages** (What we sell, All products,
   Rewards, Request a quote, Visit), **Help** (Support, Questions, Large-item delivery), **Follow** (Facebook,
   Instagram), **Contact** (email, phone, address). A last thin line holds the copyright with the service line ("sells
   and delivers; it does not install"), the concept note with the link to jontaienergy.com, and the languages. The huge
   JONTAI ENERGY and the old three columns go. The footer is the same on every page.
8. **No cursor effect.** A light, then a dot trail after squared-media.nl, then rising specks were tried and dropped
   (Bob: "remove the cursor thing idea"). The pointer is the system's own; on the first view the sun drifts slowly by
   itself.
9. **Motion through the page** (Bob: "more motion or animation so the site is not completely still", "cinematic and
   premium"): the smooth scroll the site already has (Lenis); headings rise into place line by line as they arrive,
   with their lines and buttons fading up just after; the Rewards cards and figures as in 3; the sentence as in 4; the
   wheel's arrival, turning and resting motion as in 5; footer links underline from the left on hover.
10. **Unchanged:** the reviews, the people behind it, Visit, the footer, the product pages and sheets, quote, support.

## Goals

- The first view says plainly what Jontai is, and looks like a premium store, not a scene.
- Each range is easy to see and read: one product and its name.
- Scrolling through What we sell feels like turning through the store's ranges, not a long list.
- Every product is reachable on one page, filtered by range.
- The site moves enough to feel alive and cinematic, and stays professional and calm: no gimmicks.

## Non-goals

- New product pictures (no credits needed; the existing `public/sky/range-*` pictures are used).
- Any change to the reviews, the team, Visit, the footer or the product pages.
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

- **Delivery.** "How delivery works" opens beside Furniture's note on the All products page (the wheel's foot only says
  "See ... products"). The footer's `#delivery` link lands on Furniture in the wheel.
- **The range notes move to the All products page.** The wheel shows names only, so the notes appear on `/products`
  under the matching filter: Cooling's "Jontai Energy sells and delivers; it does not install.", LED lighting's "Stock
  changes often, so ask before you make the trip." and Furniture's "Large-item delivery available."
- **"Pictures are illustrations, not specific stock."** sits at the foot of the All products page (the home page's wheel
  shows no pictures).
- **Others.** The full list (SD cards, small solar lights, solar doorbells, WiFi mesh) with "Ask us" and "Request a
  quote" is on the All products page, under its Others filter and at its foot; on the home page Others is the wheel's
  seventh name.
- **The street lamp on /products.** The grid has no frames, so a cropped pole would hang in mid-air: the All products
  page uses the whole lamp, published to `public/sky/range-pole-lamp-full-{640,1200}.webp` from the round 53 source.
  Framed places (the product page, its sheet, "More in") keep the cropped head rising from the frame's foot.
- **The first view's hours.** "Open now, until 7:00 PM" changes with the time of day, as the open-now line does today;
  when closed it says when the store opens next.

## Left to the builder

Timings and easing; exact sizes and breakpoints; how the held screens are coded (one ScrollTrigger timeline per
section is expected); component names and files; whether `Collection`, `Why`, `CollectionMotion`, `ProductRail` and the
old footer's `FitText`/`FooterFocus` are deleted or kept; how the All products filters keep their state.
