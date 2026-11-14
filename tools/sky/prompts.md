# Nature images (round 9, nature direction)

Generated on Higgsfield with GPT Image 2.6, approved by Bob on 2026-11-10 (test first: the sky and the solar island).
Originals go in `source/` (not committed, about 6 MB each; download them again by job id from Higgsfield); `publish.mjs` makes the served files in `public/sky`.

| File | Settings | Prompt |
| --- | --- | --- |
| `sky-day.png` (job 1e27a265) | 21:9, 4K, high | Wide panoramic photograph of a bright Aruba sky: deep clear blue at the top fading to a paler, softer blue toward the horizon, large soft white cumulus clouds gathered in the lower half and drifting off the right edge, warm late-morning sunlight from the upper left lighting the cloud tops. No land, no sea, no birds, no aircraft, no text. Shot on a full-frame camera, natural colours, crisp cloud detail, high dynamic range, calm and premium. |
| `island-solar.png` (job d8a417f8) | 1:1, 2K, high, transparent, reference `tools/blender/products/out/ref-solar-square.png` (the Blender panel and inverter) | A small floating island of rock and lush green grass hovering in mid-air, isolated on a transparent background. The underside is rough grey-brown limestone tapering to a point, with a few hanging roots and patches of moss; the top is flat and covered in short, healthy green grass with a few small wild plants. On top of the island stand the solar panel and the white wall inverter exactly as in the reference image: the framed monocrystalline panel tilted back toward the sky on a slim aluminium stand, the white inverter with its small green screen standing upright beside it. Soft natural midday sunlight from the upper left, gentle contact shadows on the grass. Photorealistic product photography, sharp detail, true-to-life colours, no text, no logos, no people. |

| `valley-green.png` (job b1f5af85) | 21:9, 4K, high; the page's backdrop since Bob asked for green as the main colour | Wide panoramic photograph of lush green hills rolling into soft morning mist: layered ridges of deep green grass and trees fading paler with distance, a thin band of pale hazy sky along the very top, rich deep green grass in the foreground across the bottom, gentle warm sunlight from the upper left catching the ridge lines. Calm, premium, natural colours dominated by greens, crisp detail, high dynamic range. No buildings, roads, people, animals or text. |

These are illustrations: the site labels them "Illustrations, not specific stock".

## Second batch (approved by Bob on 2026-11-10, "Yes, make them")

All 1:1, 2K, high, transparent, GPT Image 2.6, with the island wording above and these products; references are the Blender renders in `tools/blender/products/out/ref-*-square.png` (the bulb uses `public/catalog/bulb.webp`).

| File | Job | On the island |
| --- | --- | --- |
| `island-power.png` | 7ca9f5a4 | the portable power station: graphite case, silver corner caps and handles, colour screen, four outlets, two light bars |
| `island-cooling.png` | 1ce3ab8f | the split air conditioner: the outdoor unit on the grass, the indoor unit on a short weathered wooden post |
| `island-light.png` | bc447568 | a slim dark wooden lamp post with a short arm, the clear filament LED bulb hanging lit on a black cord |
| `island-security.png` | 72cd0cd6 | the solar site camera: galvanised pole, white bullet camera on a bracket, small tilted solar panel on top |
| `island-furniture.png` | 276737ac | the oak lounge chair with sage-green boucle cushions |
| `grass-front.png` | 3e8fea6b | 21:9, 2K, high, transparent: tall wild grass blades and seed heads along the bottom edge, out of focus, backlit |

## Third batch (approved by Bob on 2026-11-11, round 10: "motion" and "no two views the same")

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-array.png` | 02e3e351 | GPT Image 2.6, 1:1, 2K, high, transparent, reference = `island-solar.png` at 1024 px (2.75 credits) | The same style as the reference picture: a floating island of thick green grass and pale limestone rock with hanging roots, seen slightly from above, carrying a neat row of four ground-mounted solar panels on an aluminium frame, a few white and yellow wildflowers, soft daylight from the upper left. Transparent background, nothing else in the picture, no text. |
| `valley-loop.mp4` | 89d9c069 | Kling 3.0 Pro, 5 s, 16:9, sound off; start and end image both the centre 16:9 crop of `valley-green.png` at 1920 × 1080, so the loop has no seam (8.75 credits) | Locked-off camera, nearly still. Soft morning mist drifts slowly through the green valleys, low clouds move gently from left to right, sunlight slowly brightens and fades across the hills, trees and grass sway slightly in a light breeze. No camera movement, no new objects, no people, no animals, no text. Photographic, natural colours. |

The array island is the first view's; the panel-and-inverter island stays with the Solar range, so the two never repeat.

The loop is published with ffmpeg (not a project dependency; `npm i ffmpeg-static` anywhere and use its binary):

```bash
ffmpeg -i tools/sky/source/valley-loop.mp4 -an -vf "scale=1920:-2,format=yuv420p" -c:v libx264 -preset slow -crf 25 -profile:v high -movflags +faststart public/sky/valley-loop-1920.mp4
ffmpeg -i tools/sky/source/valley-loop.mp4 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 public/sky/valley-loop-1920.webm
```

## The lighting island's bulb (round 11, no credits)

Bob, 2026-11-11: "the bulb gotta make sense since its not connected to the socket". The generated island hung the bulb upside down: the cord's socket held the top of the glass and the screw base pointed at the grass. `tools/sky/fix-bulb.mjs` keeps the cord and socket, turns the glass and base over so the base goes up into the socket, and writes `source/island-light-fixed.png`, which `publish.mjs` now prefers. It prints where the glass ends up (lib/islands, `lamp`), for the page's 2700K to 6500K light.

## The bulb lit from inside (round 17, no credits)

Bob, 2026-11-11: "switching the color doesnt make sense the brightness has to be inside the bulb". `tools/sky/bulb-light.mjs` (run after `publish.mjs`) bakes the lighting island's bulb at 2700, 3500, 4500, 5500 and 6500K from the photo itself: the filaments' own light takes the new colour and burns nearly white at the core, the glass fills with light from the filaments out and stays clear at the rim. Each temperature is `public/sky/island-light-k<K>-{1200,700}.webp`, the island's size and clear except the globe; one shared `island-light-halo-{1200,700}.webp` holds where the light falls round it, and the page paints it in the slider's colour. `--debug` writes check images to `source/`.

## The first view's islands (round 26, approved by Bob on 2026-11-11)

Bob first approved a home on the island (job 6e4bcccf, 2.75 credits) and a sunset scroll into Rewards ("Sunset, lights on"). Seeing the house he wanted it "more simple looking" and asked for something other than a floating island; a simple house on a green hill was made (job 90184beb, 2.75 credits), and then he went back: "lets just continue with the floating island but i want more sub floating islands ... not the house since it look too big and can the floating island look slightly different". Neither house picture is used. He picked "Mossy and rounder" for the new look.

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-main.png` | daec7613 | GPT Image 2.6, 1:1, 2K, high, transparent, no reference (2.75 credits) | A floating island hovering in mid-air, seen slightly from above. The island is rounder and softer than a jagged rock: its underside is a smooth, rounded mass of rock almost entirely covered in deep green moss and small ferns, with a few thin hanging roots. The top is lush short green grass with a few small white and yellow wildflowers. On it stand a neat row of three solar panels on a low aluminium frame and, beside them, a slim dark lamp post with a short arm from which a clear filament LED bulb hangs, softly lit. Soft daylight from the upper left. Photorealistic, calm, premium, true colours. Transparent background, nothing else, no text, no people, no logos. |
| `islands-small.png` | 498dea9b | GPT Image 2.6, 3:2, 2K, high, transparent, reference = `island-main.png` (job daec7613) (2.75 credits) | Four small floating islands in the same style as the reference, spaced well apart, none touching: one with a small solar garden light on a stake, one with a young green tree, one with a single small solar panel, one with grass, wildflowers and a tiny solar garden light. Same moss, rock, grass and light. Transparent background, no text. |

Then Bob asked to see the Casibari option (2026-11-12, "i want to see the casibari rock island"), and it became the first view's island; the mossy one is kept beside it in `public/sky/island-main-*`:

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-boulders.png` | e102de95 | GPT Image 2.6, 1:1, 2K, high, transparent, no reference (2.75 credits) | A floating island hovering in mid-air, seen slightly from above. Its underside is a cluster of large, smooth, rounded grey boulders like Aruba's Casibari rock formations, with patches of moss. The top is lush short green grass with a few small white and yellow wildflowers and one tall kadushi cactus. On it stand a neat row of three solar panels on a low aluminium frame and, beside them, a slim dark lamp post with a short arm from which a clear filament LED bulb hangs, softly lit. Soft daylight from the upper left. Photorealistic, calm, premium, true colours. Transparent background, nothing else, no text, no people, no logos. |

Then Bob asked for "something else on the big main island that makes it look filling and not random stuff thrown in there but yet small and minimal" and picked "Rock garden". GPT Image 2.6 failed four times on this edit (no credits taken), so it was made with FLUX 3 from the island on white, then cut out by `tools/sky/cutout-white.mjs` (removes the white that reaches the edges and enclosed pure-white pockets, softens and un-whitens the outline):

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-garden.png` (from `island-garden-white.png`) | f71c437b | FLUX 3 Image, 1:1, 2K, reference = `island-boulders.png` flattened on white (3 credits) | Edit the reference picture. Keep the floating island, its rounded grey Casibari boulders, grass, wildflowers, kadushi cactus, three solar panels and lamp post exactly as they are, in the same places, same size and same framing. Add, small and neatly placed, so the top reads as one calm little garden: a narrow path of pale limestone stepping stones from the front edge to the lamp post, and around the kadushi a small ring of pale stones with a few low aloe plants. Nothing else. Same soft daylight from the upper left, same photorealistic style. Keep the plain pure white background, no shadow on the background, no text, no people, no logos. |

The same day he dropped the sunset ("i dont want the transition to change color"): the scroll is now one camera moving in on the islands, through the sky's own white mist, into Rewards.

Published with `node tools/sky/publish.mjs island-garden` (and `island-boulders`), then `node tools/sky/hero-islands.mjs`, which cuts the four small islands out of their sheet (`island-small-{lantern,tree,panel,meadow}-{640,360}.webp`). The array island stays as the solar panels' chip on the quote page.

## The solar lamp island and the chair (round 27, approved by Bob on 2026-11-12)

Bob sent the lighting island as the look he wanted for the main island ("lets just make the main island this") and asked for "only the solar with a light that powers on where they dont take too much space", and for the small solar-panel island to become something else so it is not redundant. He picked "All-in-one solar lamp" and "Lounge chair".

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-lamp.png` | d9765d38 | GPT Image 2.6, 1:1, 2K, high, transparent, reference = the lighting island (job bc447568) (2.75 credits) | A floating island in the same style as the reference picture: pale limestone rock underneath with moss and hanging roots, a thick top of lush green grass with a few small white wildflowers, seen slightly from above, soft daylight from the upper left. On it stands one compact all-in-one solar street light: a slim dark grey pole, a small solar panel mounted at the top and angled to the sun, and just under it a short arm with a slim LED light head facing down, switched off. Neat and small, near the middle, nothing else on the island. Photorealistic, true colours, transparent background, no text, no people, no logos. |
| `island-small-chair.png` | a3a6059a | GPT Image 2.6, 1:1, 2K, high, transparent, reference = the tree island cut from `islands-small.png` (2.75 credits) | A small floating island in the same style as the reference picture, with the same rounded mossy underside, grass and small ferns, seen slightly from above, soft daylight from the upper left. On it stands a small light oak lounge chair with sage-green cushions. Nothing else. Photorealistic, true colours, transparent background, no text, no people, no logos. |

The lamp's light is CSS (sky.css, `.hero__led`, `.hero__halo`, `.hero__beam`, `.hero__pool`), placed on the LED face at 705, 196 of the 1200 by 1443 picture; it powers on with a short flicker once the islands have arrived, and the camera's move flies into it. Published with `node tools/sky/publish.mjs island-lamp` and `node tools/sky/hero-islands.mjs`.

## The solar floodlight island with the card (round 28, approved by Bob on 2026-11-12)

Seeing the solar lamp island, Bob said "the pole is too long", the island should be bigger, with "more smaller stuff that goes together: solar + loyalty card + light for solar + (come up with something)". A first set with a power station (job 86ea5c4b, 2.75 credits) was rejected before it was used: "the objects are too small and the power doesnt make sense that its connected to the solar panel and membershipcard should look normal; maybe solar panel plus a floodlight with a short pole thats camera". He approved:

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-guard.png` | 1f240ae2 | GPT Image 2.6, 1:1, 2K, high, transparent, reference = the solar lamp island (job d9765d38) (2.75 credits) | The same floating island as the reference picture (pale limestone rock underneath with moss and hanging roots, a thick top of lush green grass with a few small white wildflowers), but without the street light, filling most of the picture, seen slightly from above, soft daylight from the upper left. Near the middle, large and clearly visible, one compact all-in-one solar security light on a short sturdy dark grey pole, about chest height: at the top a solar panel angled to the sun, just under it a slim LED floodlight facing forward and down, switched off, and under that a small white dome security camera, all on the same pole as one neat unit. Right beside the pole, standing upright in the grass and leaning slightly, a large green loyalty card that looks like a real plastic membership card: thin, glossy, rounded corners, a small 'Jontai Energy' wordmark in white in the top left corner, a small 'Rewards member' label in the top right and a neat row of five small sun stamps along the bottom. Nothing else. Photorealistic, true colours, transparent background, no people, no other text or logos. |

The floodlight's light is CSS on its LED panel (545 to 697 by 209 to 243 of the 1200 by 1166 picture); the camera's move flies into the card (`ZOOM` in `components/home/Hero.tsx`). Published with `node tools/sky/publish.mjs island-guard`.

Seeing it, Bob said "it still looks too long and like the island has empty spaces". He approved an edit of it with FLUX 3 (3 credits), from the island on white, cut out with `node tools/sky/cutout-white.mjs source/island-guard2-white.png source/island-post.png --clear 5 --solid 12` (tight, so the pale boulders at the edge stay) and published as `island-post`:

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-post.png` (from `island-guard2-white.png`) | 19ceb587 | FLUX 3 Image, 1:1, 2K, reference = `island-guard.png` flattened on white (3 credits) | Edit the reference picture. Keep the floating island, its pale limestone rock, roots and grass, the green Jontai Energy loyalty card and the solar floodlight unit (solar panel, LED floodlight and white dome camera) exactly as they look, in the same place, same size and same framing, but make its dark grey pole about half as tall, so the solar panel sits just above the top of the card. Fill the empty grass with a few low, natural pieces: on the left a small cluster of low aloe plants and white wildflowers, and at the front right two small rounded pale limestone boulders with a little moss. Nothing else. Same soft daylight from the upper left, same photorealistic style. Keep the plain pure white background, no shadow on the background, no text other than the card's, no people, no logos. |

## The set on the main island, round 29 (approved by Bob on 2026-11-12)

Bob: "the island slightly too big and can make the objects not be in 1 pole make them seprated but close to eachother since i want the island to be filled looking but not loong", "membership card dont need to have the sun on the card". He picked a new GPT Image picture; seeing it, "this version is good maybe add something small behind/around like aruba grass or something or even string lights", and picked both, as a FLUX 3 edit.

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-cluster.png` | 0c208c3d | GPT Image 2.6, 1:1, 2K, high, transparent, reference = the round 28 edit (job 19ceb587) (2.75 credits) | A floating island in the same style as the reference picture: pale limestone rock underneath with moss and hanging roots, a thick top of lush green grass, filling most of the picture, seen slightly from above, soft daylight from the upper left. On the left a small cluster of low aloe plants and white wildflowers, and at the front right two small rounded pale limestone boulders with a little moss. In the middle, three separate, low pieces standing close together around a green loyalty card, none much taller than the card: a small solar panel on a low tilted ground frame just left of the card; a short LED floodlight on a knee-high post just behind the card, switched off; and a small white dome security camera on its own short post just right of the card. The green Jontai Energy loyalty card stands upright in the grass and leans slightly, like a real plastic membership card: thin, glossy, rounded corners, plain, with only a small 'Jontai Energy' wordmark in white in the top left corner and a small 'Rewards member' label in the top right, no suns or stamps. Nothing else. Photorealistic, true colours, transparent background, no people, no other text or logos. |
| `island-set.png` (from `island-garden2-white.png`) | a84f2e18 | FLUX 3 Image, 1:1, 2K, reference = `island-cluster.png` flattened on white (3 credits) | Edit the reference picture. Keep everything exactly as it is: the floating island, rock, roots, grass, aloe, wildflowers, boulders, the solar panel, the floodlight, the camera and the green Jontai Energy card, same places, same size, same framing. Add only, small and low: a few tufts of tall, wispy golden-green Aruban grass behind the set and at the edges of the island top, and behind the set a short string of warm white festoon light bulbs hanging in a gentle curve between two low, slim wooden posts no taller than the floodlight, the bulbs switched off. Nothing else. Same soft daylight from the upper left, same photorealistic style. Keep the plain pure white background, no shadow on the background, no text other than the card's, no people, no logos. |

Cut out with protected areas (the card's white letters kept; strict white limits on the boulders, bulbs, daisies and camera dome; a looser one elsewhere for the haze round the wispy grass):

```bash
node tools/sky/cutout-white.mjs tools/sky/source/island-garden2-white.png tools/sky/source/island-set.png --clear 5 --solid 36 --tight-solid 12 --tight "63,48,87,62.5;33,27.5,91.5,33;8,37,26.5,50;74.5,27.5,84,44" --keep "46,29,75.5,52.5;74.5,27.5,84,44"
node tools/sky/publish.mjs island-set
```

The floodlight and the festoon bulbs that show (not the three behind the card) power on in CSS (sky.css); the camera's move flies into the card.

## Back to the short-post island, with a plain card (round 29, 2026-11-12)

Bob rejected both round-29 islands ("just keep the simple version main island from 1 design before ... the one where theres 1 short pole with a card"), so `island-post` is the first view's island again, and asked to take the suns off its card (FLUX 3, 3 credits):

| File | Job | Settings | Prompt |
| --- | --- | --- | --- |
| `island-post.png` (from `island-post2-white.png`) | 3f0743f7 | FLUX 3 Image, 1:1, 2K, reference = the round 28 edit on white (job 19ceb587) (3 credits) | Edit the reference picture. Keep everything exactly as it is: the floating island, its pale limestone rock, roots and grass, the aloe and wildflowers, the two small boulders, and the short post with the solar panel, floodlight and white dome camera, same places, same size, same framing. Change only the green Jontai Energy loyalty card: remove the row of five sun stamps, so the card is plain glossy green with only the 'Jontai Energy' wordmark in white in the top left and the small 'Rewards member' label in the top right. Nothing else changes. Same soft daylight from the upper left, same photorealistic style. Keep the plain pure white background, no shadow on the background, no people, no logos. |

```bash
node tools/sky/cutout-white.mjs tools/sky/source/island-post2-white.png tools/sky/source/island-post.png --clear 5 --solid 12 --keep "47,30,78,50.5;43,35,51,45"
node tools/sky/publish.mjs island-post
```


## Two more product types: solar street lamps and solar fans (round 31, approved by Bob on 2026-11-12)

Bob asked to add "(solar) street lamps" and "solar fans" to the ranges. Both catalogue pictures were made in the cream studio look of `public/catalog/*.webp`, with `public/catalog/floodlight.webp` uploaded as the style reference, then resized to 800 px (`public/catalog/street-lamp.webp`, `public/catalog/solar-fan.webp`). Originals in `tools/sky/source/catalog/`.

| File | Job | Settings | Prompt |
|---|---|---|---|
| `street-lamp.png` | 7e42bb10 | GPT Image 2.6, 1:1, 1K, high, reference = floodlight.webp (1.5 credits) | A product photo in the same style as the reference picture: one all-in-one solar LED street lamp shown on its own, without a pole: a slim dark grey aluminium light head with a flat solar panel built into its top and a short mounting arm at the back, seen from slightly in front and above so both the panel and the LED face show, switched off, centred, filling about two thirds of the frame. Plain warm cream studio background like the reference, soft daylight from the upper left, a soft shadow under it. Photorealistic, true colours, no text, no logos, no people. |
| `solar-fan.png` | 6be58f34 | GPT Image 2.6, 1:1, 1K, high, reference = floodlight.webp (1.5 credits) | A product photo in the same style as the reference picture: one solar fan set: a white standing pedestal fan with a round wire grille, and beside it a small framed solar panel on a low folding stand, joined to the fan's base by one neat black cable. Seen from slightly in front, centred, filling about two thirds of the frame. Plain warm cream studio background like the reference, soft daylight from the upper left, soft shadows. Photorealistic, true colours, no text, no logos, no people. |

## The six ranges without islands, sharp (round 38, approved by Bob on 2026-11-13)

Round 36 cut the products out of the 800 px catalogue pictures, and Bob found them "too low" in quality. Then he asked to "remove the islands and make the image higher quality for the products", and approved making them new ("Make all five"). All GPT Image 2.6, 1:1, 2K, high, transparent, 2.75 credits each, with the product's catalogue picture in `public/catalog` as the reference. Every prompt follows this pattern: "Recreate the product from the reference picture exactly, same shape, colours, parts and proportions, as a new, sharp, high-resolution product photo: <the product>. Shown on its own, centred, filling about four fifths of the frame, seen from slightly in front, soft daylight from the upper left. Photorealistic product photography, crisp detail, true colours. Transparent background, no floor, no shadow, nothing else, no text, no logos, no people."

| File | Job | Reference | The product |
| --- | --- | --- | --- |
| `range-solar.png` | d1a7fee8 | `solar-panels.webp`, `inverter.webp` | the framed blue monocrystalline solar panel standing upright, tilted slightly back, and beside it on the right, a little in front, the white wall inverter with its small screen, about a third of the panel's height |
| `range-cooling.png` | 4cb9c3ee | `solar-ac.webp` | the white split air conditioner, the slim wall-mounted indoor unit above and, below it, the outdoor unit with its round fan grille and brass pipe valves |
| `range-power.png` | c8904c4e | `power-station.webp` | the portable power station, its graphite grey case with silver corner caps and carry handles, the colour screen, the row of outlets and the two light bars on its front, seen from slightly in front and to the side |
| `range-security.png` | 89928ba1 | `camera-home.webp` | the white solar security camera, the round white camera head with its dark lens on its white wall bracket, with the small black solar panel mounted above it |
| `range-furniture.png` | 5b4a5750 | `lounge-chair.webp` | the lounge chair, its light oak frame with gently curved arms and its sage-green boucle seat and back cushions, seen from slightly in front and to the side |

Published with `node tools/sky/range-products.mjs` (trims each to the product and writes `public/sky/range-<image>-{1200,640}.webp`). Lighting keeps the bulb from `bulb-light.mjs`.

## More products in each range (round 39, approved by Bob on 2026-11-13, "9 pictures")

Bob: "in the six range products gotta add more product like solar street lamp and solar fans". Same settings and prompt pattern as round 38 (GPT Image 2.6, 1:1, 2K, high, transparent, 2.75 credits each, the catalogue picture as the reference). The combined panel-and-inverter picture is split into two. The inverter's first submission hit a rate limit (nothing charged) and was sent again.

| File | Job | Reference | The product |
| --- | --- | --- | --- |
| `range-solar-panel.png` | 2af67ccd | `solar-panels.webp` | one framed blue monocrystalline solar panel with a silver aluminium frame, standing upright and tilted slightly back, seen from slightly in front and to the side |
| `range-inverter.png` | 6b0182f2 | `inverter.webp` | the white wall-mounted hybrid solar inverter with its small colour screen, its buttons and its wall bracket, seen from slightly in front and to the side |
| `range-solar-fan.png` | 17d82ed6 | `tools/sky/source/catalog/solar-fan.png` | the white standing pedestal fan with its round wire grille and white blades, and beside it on the right the small framed solar panel on its low folding stand, joined to the fan's round base by one neat black cable |
| `range-street-lamp.png` | 878c6cae | `tools/sky/source/catalog/street-lamp.png` | the all-in-one solar LED street lamp head on its own, without a pole: the slim dark grey aluminium body with the flat solar panel built into its top, the LED face underneath and the short mounting bracket at the back, seen from slightly in front and above, switched off |
| `range-floodlight.png` | 5c38139d | `floodlight.webp` | the black LED floodlight with its square face of small LEDs behind clear glass, its finned heat sink and its U-shaped mounting bracket, switched off |
| `range-led-strip.png` | bcf7c95f | `led-strip.webp` | a neat coil of white flexible LED strip light with a short loose end curving out of it, its small LEDs glowing soft warm white |
| `range-generator.png` | 5ef6885d | `generator.webp` | the compact portable inverter generator, its pale grey case with dark green side panels, carry handle, green fuel cap and control panel with two sockets |
| `range-camera-site.png` | c9b6f237 | `camera-site.webp` | the solar site security camera on its short galvanised steel pole with a round base plate, the white bullet camera on a bracket and the framed solar panel tilted on top |
| `range-sofa.png` | d261fb35 | `sofa.webp` | the two-seat sofa in soft cream boucle fabric with rounded arms, two seat and two back cushions, on a slim light oak base with short legs |

Published with `node tools/sky/range-products.mjs` (every product, or the names given), then `node tools/sky/thumbs.mjs` for the quote page's chips.

## Ceiling lights and tubes (round 41, approved by Bob on 2026-11-14, "Make both")

Bob: "for led lighting need to include ceiling lights and the tubes". Same settings and pattern as rounds 38 and 39 (GPT Image 2.6, 1:1, 2K, high, transparent, 2.75 credits each).

| File | Job | Reference | The products |
| --- | --- | --- | --- |
| `range-ceiling-lights.png` | 9fcee2e1 | `downlights.webp` | a slim round white LED downlight and beside it a slim square white LED ceiling panel, both with their small spring clips at the sides, standing on edge and leaning slightly back, switched off |
| `range-tubes.png` | a28df1d8 | `tubes.webp` | two slim white LED tubes with their two-pin end caps and beside them one white linear LED fitting with a square profile, laid side by side diagonally, switched off |
