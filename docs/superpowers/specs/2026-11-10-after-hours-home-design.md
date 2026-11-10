# After hours: home page design (round 9)

Approved by Bob on 2026-11-10 (plan "After hours"). Built on `redesign/v9-after-hours`, cut from the live branch `Jontai-Energy` at c8c9c62.

## Why

Bob's brief on the live site, with alethia.earth as the inspiration: the first view must say what the company is; Jontai Rewards must be easier to understand yet informative, and come first; products go to the bottom with a better scroll; seamless motion; big, HD, premium, "like an actual expensive company". No weird shapes and images, which Bob defined as decorative shapes (round windows, route lines, corner frames), rough 3D models, and fake-looking pictures.

Bob's choices: rebuild the products cleanly in Blender; bundles are one simple discount popup for now.

## The idea

One dark showroom, and the products are the only decoration. The home page sits on the owner's deep forest field (`#0f281d`, forest `#173D2C`, sand text `#F7F5EC`, mint `#B8D8A8` for actions). Behind the copy, one 3D stage holds the Blender-built products, lit like the store after closing: warm key, soft green rim, soft shadows. The camera never cuts; scrolling moves it through the one room. Type stays Archivo, large and lighter in weight.

Not allowed: frames, tags, circles, route lines, dust, patterns, loaders with counters, scroll cues, text that fades before it can be read.

## Page order

1. Header: mark, Support, Menu, plus a mint "Bundle offer" pill.
2. First view: family-owned line and live open status; headline "Solar, power and light for every Aruban home."; one line on the store (Cumana 73, furniture one floor up); "Visit the store" and "See what we sell". The product family, large and cropped on the right, drifting slowly. The six ranges on one ruled line along the bottom; hovering or focusing a name lights its product; clicking jumps to it.
3. Bundle popup: unfolds from the pill once per visit, does not block the page. Three ruled rows (Starter Solar Kit 20%, Home Security Bundle 15%, Outdoor Lighting Pack 15%, with contents), "Ask on WhatsApp", note "Sample offers. Ask in store for this month's bundles."
4. Jontai Rewards: products part and dim, the loyalty card rises and faces you. "Spend Afl. 500. Get Afl. 25 back."; Afl. 500 and Afl. 25 as two big figures on a rule; three steps (join in store, shop as usual, spend your vouchers); one spend slider with the result; four ruled facts (store credit not cash, yearly restart, business 10% from 5,000 points, full terms at the counter); Member login, Visit the store.
5. Products: pinned walk through six stops (Solar, Cooling, Backup power, Lighting, Security, Furniture). Product very large, slowly turning, draggable; name, one sentence, up to three datasheet figures, two links; ruled jump list on the right; each stop holds and the scroll settles on it. Lighting keeps the 3000K to 6500K slider. Phones get one screen per range with stills.
6. The store: three ruled points (family-owned, delivery, talk to a person) rise over the stage, then Visit as today.
7. Footer: unchanged.

Removed: loader, "At a glance" numbers, "Meet the team, coming soon".

## Models

Blender, shaped after the product photos in `public/products` and `public/catalog`: hybrid inverter (built first as the quality checkpoint), solar panel, power station, split air conditioner, solar camera, loyalty card; lounge chair checked and rebuilt if rough; the live LED bulb reused. One Meshopt GLB for the live stage, Cycles stills for phones and reduced motion. "3D illustrations, not specific stock" stays.

## Rules kept from earlier rounds

Every claim traces to a datasheet or the owner; "Afl." on every amount; never imply installation; delivery wording unchanged; sample offers marked as samples; no boxes or cards; glass only on what floats; reduced motion, no-JS and Save-Data visitors get stills and every word.

## Build notes

Technical rules (sticky stage inside a scope, one pinned section, one smoothing, loader removal traps, night tokens scoped to the home page, non-modal popup, rendering budget) are in the approved plan and are carried into the code comments where they apply.
