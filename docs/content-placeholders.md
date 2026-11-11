# Content to confirm or replace

Everything on the home page that Jontai Energy should check before launch. Nothing here was invented; each item is either taken from an existing source that needs confirming, or illustrative material that should be swapped for the real thing.

## Confirmed by the owner

- Opening hours, 2026-10-27: Monday to Saturday 9:00 to 19:00, Sunday 10:00 to 14:00 (shown as 9:00 AM to 7:00 PM and 10:00 AM to 2:00 PM; `lib/store.ts`). The "Open now" line uses Aruba time and does not know about public holidays.
- Phone and WhatsApp, 2026-10-27: +297 586 5323 for both (`lib/store.ts`). The current jontaienergy.com links WhatsApp to +297 566 6152; the owner confirmed +297 586 5323 is correct.

## Facts to confirm

| What | Where it shows | Current value | Source |
| --- | --- | --- | --- |
| Email | Visit the store, quote page, where quote requests are sent | jontai@qq.com | Old site pages |
| Instagram | Visit the store, Store JSON-LD | instagram.com/jontaienergy | Old site pages (Facebook was confirmed in the brief; Instagram was not) |
| LED colour temperatures | Dusk chapter, the bulb slider | "From warm 3000K to daylight 6500K." | The owner, 2026-10-26. Confirm which bulbs come in which temperatures |
| LED strips | Chapter 04's lead, the lighting panel's range | "Flexible strip lights, warm to daylight white." | The owner, 2026-10-28, said the store carries LED strips. Confirm the colour temperatures they come in |
| Family-owned | The statement's first point, the hero's top line | "Family-owned" and "We choose every product with care and look after every customer ourselves.", with "Meet the team" marked "Coming soon" | The owner, 2026-10-28, for family-owned and the team page to come. The sentence under it is ours; confirm or reword it |
| Loyalty terms | Loyalty section | Afl. 500 spent, Afl. 25 back, accumulates, resets after one year of use | Owner's brief. The page says full terms and the exact reset date are confirmed in store |
| Loyalty programs | Loyalty section, "Two loyalty programs" | Regular: every 500 points unlocks 1 voucher worth Afl. 25 in store credit; vouchers cannot be converted to cash. Business: reach 5,000 points and get 10% off for the rest of the year, until the next account anniversary, when points reset to 0 | Owner, 2026-10-27, from the current jontaienergy.com. Written in Afl. like the rest of the site (the current site says AWG) |
| Points per Afl. | Loyalty card on the page | The card works in points, 0 to 5,000, beside the brief's "Spend Afl. 500 and get Afl. 25 back", which reads as 1 point per Afl. 1 | Confirm how points are earned; the page never states a rate |
| Membership in store | Loyalty section, member login | "Open your membership in store at Cumana 73 and collect your loyalty card. The code on the card is your member login." | Owner, 2026-10-27 |
| Member login | Loyalty section (placeholder) | Asks for the loyalty code and name, as the current jontaienergy.com does, and says nothing was sent | Not connected. The current site looks members up in its Supabase database by loyalty code and name. Set `LOOKUP_URL` in `components/sections/MemberLogin.tsx` (or add a server route) once the lookup is shared |
| Generator delivery | FAQ "What do you deliver?", generator and furniture panels | Furniture and large generators | First brief ("large generators"); confirm it still applies |
| Delivery details | Furniture panel | "Delivery areas, days and any charge are confirmed when you buy." No areas, days or fees are stated | Add them to the furniture panel (`data/products.json`, panels.furniture) once confirmed |
| Camera and generator panels | Product panels | What the products do in general terms, with no models or figures | No datasheets were supplied. Send them and the panels can show figures like the inverter does |

All datasheet figures (SPI-8K-UP, 3000W power station, ACDC solar AC) come from the supplied Namkoo documents and are labelled as examples, not live stock.

## Support page (`/support`, `lib/support.ts`)

Drafted 2026-10-28 from the store's current site: `pages/warranty` (policy dated 19 March 2026), `pages/returns`, `pages/service` and `pages/faq`. Each line below is the store's own policy, shortened, unless it says otherwise. Confirm before launch.

| What | On the page | Source, and what was left out |
| --- | --- | --- |
| Warranty periods | Solar panels 10 years (manufacturer performance warranty typically 25 years on top); inverters and batteries 5 years; LED fixtures and drivers 3 years (output below 70% covered); electrical hardware 1 year; other hardware 6 months | Warranty policy. **Inverters: the store policy says 5 years, the Namkoo SPI datasheet (inverter panel) says 24 months.** The site shows both, labelled: the store's 5 years here (its note says the manufacturer's warranty is separate), "24-month manufacturer warranty" on the inverter panel. Confirm both. The lead covers "the products below" rather than the policy's "all products sold", since no period is given for generators, power stations, solar AC, cameras or furniture. The policy's "Installation labour 1 year" is left out |
| When periods start | "From the date of purchase" | The policy says "purchase or professional installation, whichever is later"; installation is left out |
| Not covered | Accidents, misuse; changes or repairs by others; wear; lightning, surges, flooding; missing serial number; consumables such as fuses; software unless a hardware fault causes it | Warranty policy. Left out: "installation not performed or supervised by a Jontai Energy technician", and the claim that products are "rated for tropical coastal environments" |
| Making a claim | Get in touch or come by; bring the receipt and serial number; photos help; an answer within 5 business days; do not repair it first | Warranty policy. Left out: on-site inspection by a technician |
| Remedies | "We decide on the remedy": repair, replace or refund; a replacement keeps the rest of the warranty or 90 days; "the repair and its transport within Aruba cost you nothing"; Aruban statutory rights (Burgerlijk Wetboek van Aruba) | Warranty policy ("at our discretion"; "reasonable labour and transport costs within Aruba"). Labour is reworded as the repair, so it cannot read as paying for someone's installation |
| Returns | 14 days with the receipt, unused and in its packaging; refund to the original payment method or exchange; no restocking fee when unopened; opened but unused "may be exchanged"; wrong item replaced, transport covered; installed or special-order items not returnable | Returns page. The page says "we may check it" where the source says a technician inspects |
| Refund times | "Cash refunds are paid in store once approved; card refunds take 3 to 7 business days" | Returns page, which says both "within 3 business days for cash" and "issued on the spot"; confirm which |
| Service | In store only: bring the product and receipt, free diagnosis when it may be under warranty, a quote first outside warranty, every repair tested, a 90-day workmanship guarantee, updates by phone or WhatsApp | Service page. Left out: certified technicians, on-site visits, preventive maintenance, and the list of repair kinds |
| Furniture | "Ask about the warranty / returns when you buy" | Not in any policy; add the furniture terms once known |
| Questions | Visit's four questions, then warranty claims, returns, repairs and joining Rewards, each answered from the lines above | The old FAQ's answers were not used: dollar prices, US tax credits, installation crews, financing and efficiency figures |

## Quote requests by email

The quote page (`/quote`) sends each request to the store by email through Resend (resend.com), with Reply-To set to the visitor so a reply goes straight to them. To switch it on, set `RESEND_API_KEY` and `QUOTE_FROM` (an address on a domain verified in Resend) where the site is hosted; `QUOTE_TO` overrides the inbox, which defaults to jontai@qq.com. See `.env.example`. Until then the page does not pretend to send: it says it could not, and opens the same message in the visitor's own email app instead.

## Bundle offers (round 9, sample)

The header's "Bundle offers" panel (`lib/bundles.ts`) shows three sample bundles: Starter Solar Kit (solar panels, a hybrid inverter and a power station) 20% off, Home Security Bundle (two solar cameras) 15% off, Outdoor Lighting Pack (a street lamp, garden lights and an LED floodlight) 15% off. None of these is confirmed by the owner; the panel says "Sample offers. Ask in store for this month's bundles." No prices are shown. Replace the names, contents and savings with the store's real bundles, or remove the panel.

## Illustrative material to replace

| What | Where | Replace with |
| --- | --- | --- |
| Valley (still and a 5 s Kling 3.0 loop), grass, the first view's solar-array island and the six product islands (rounds 9 and 10, Higgsfield, `public/sky`; prompts and job ids in `tools/sky/prompts.md`) | The home page's first view (valley, grass, array island) and the six ranges further down | Illustrations of the kind of product carried, set on floating islands in a green valley; the page says "Illustrations, not specific stock" under the first view and in the ranges' introduction. Screen readouts on the inverter and power station are decoration. The lighting island's bulb was turned the right way up into its socket in code (tools/sky/fix-bulb.mjs); its colour on the page comes from the 2700K to 6500K slider, not from the picture. Swap in the store's own product photos cut out on transparent backgrounds, same file names |
| 3D products (round 9, `public/models/showroom.v1.glb`, built in Blender from `tools/blender/products`) | Not on the home page since the switch to the valley; kept for `/lab` | Modelled after the catalogue pictures, so they show the kind of product carried, not specific stock |
| Catalogue pictures (GPT Image, `public/catalog`) | The product panel for each category | Studio-style illustrations of the kinds of products carried; the panels, AC, inverter, power station, generator, camera, sofa and chair follow the store's photos, the LED items and the site camera are representative. The LED strip (`led-strip.webp`, 2026-10-28) is a three.js render made for this site, not GPT Image. The home page labels them "Illustration, not specific stock"; the panel says "Pictures show the kind of products we carry". Swap in real product photos any time, same file names, square, on a plain light background so the stage colour still meets their edges |

Removed on purpose: the Blender day film of the home page (retired 2026-10-27 for the type-led redesign; `tools/blender/film` stays in the repo, unshipped), the Seedance staircase clip of a store interior (the owner said it looked nothing like the real store) and the earlier real-time 3D models.

## Not shown anywhere on purpose

Prices, stock levels, reviews, customer counts, founding dates, awards, energy savings, installation services. Warranty periods appear only on the Support page, from the store's policy (above), besides the inverter datasheet's 24 months. The panel copy names silicon cells without claiming a cell type, because no supplied document states one.
