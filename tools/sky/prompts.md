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
