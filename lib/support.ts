// The Support page's content (round 2, 2026-10-28), with the store's policies as Bob gave them on 2026-11-11 (round
// 23): the store does not install; every product is checked before it is sold; the wrong item is exchanged after a
// check, with no cash refunds and any difference as store credit; only solar batteries carry a warranty, one year;
// Rewards apply at the counter with the card, and logging in only shows the points. The rest comes from the store's
// earlier site, without prices, financing, efficiency figures or work on site.

export interface Question {
  q: string;
  a: string;
}

export interface Point {
  title: string;
  line: string;
}

/** The questions people ask. Visit shows the first four. */
export const QUESTIONS: Question[] = [
  {
    q: 'Who installs what I buy?',
    a: 'Jontai Energy is a retail store and does not install the products it sells. Please arrange installation with a qualified installer or electrician of your choice.',
  },
  { q: 'What do you deliver?', a: 'Large items, such as furniture from the second floor and large generators. Ask about delivery when you buy.' },
  {
    q: 'Can I see products before I buy?',
    a: 'Yes. Every product is checked in store before it is sold, and you are welcome to see it at Cumana 73 first, with furniture one flight up.',
  },
  { q: 'Are prices online?', a: 'No. Request a quote and the store replies by email with current prices and what is in stock, or ask in store.' },
  {
    q: 'How do I claim under warranty?',
    a: 'Solar batteries carry a one-year warranty. Bring the battery and its receipt to the store, or call, email or send us a message, and we will assess it.',
  },
  {
    q: 'Can I return something?',
    a: 'If you received the wrong item, bring it back with the receipt. We check the product first and then exchange it for the right one. We do not give cash refunds; any difference in price is given as store credit.',
  },
  {
    q: 'Do you repair what you sell?',
    a: 'Bring it in with the receipt. The diagnosis is free when the fault may be under warranty; outside warranty, a repair is quoted before any work starts.',
  },
  {
    q: 'How do I join Rewards?',
    a: 'Open your membership in store at Cumana 73 and collect your loyalty card. Bring the card when you shop and your rewards apply at the counter. Logging in is only to see your points.',
  },
];

export const WARRANTY = {
  lead: 'Solar batteries bought from Jontai Energy carry a one-year store warranty against defects in materials and workmanship in normal use. Other products are sold without a store warranty.',
  periods: [{ what: 'Solar batteries', period: '1 year', note: 'Defects in materials and workmanship in normal use.' }],
  from: 'The warranty runs for one year from the date of purchase. All other products, including panels, inverters, lighting, cameras, air conditioners and furniture, do not carry a store warranty.',
  excluded: [
    'Accidents, misuse or neglect',
    'Changes, repairs or tampering by anyone else',
    'Normal wear, such as scratches and fading',
    'Lightning, power surges, flooding and other acts of nature',
    'A removed or unreadable serial number',
    'Parts that wear out in normal use, such as fuses',
    'Software or settings, unless a hardware fault causes it',
  ],
  claim: [
    { title: 'Get in touch', line: 'Call, email or send us a message from the contact page, or come by the store.' },
    { title: 'Bring the receipt', line: 'The original receipt or invoice, and the serial number where there is one.' },
    { title: 'Show us the fault', line: 'Photos or a short video help us assess it faster.' },
    { title: 'Hear back within 5 business days', line: 'We assess the claim and tell you the outcome and the next step.' },
  ] satisfies Point[],
  caution: 'Please do not repair it yourself or have someone else try first: that can void the warranty.',
  remedy: 'When a claim is accepted, we repair the battery or replace it with the same or an equivalent model.',
  law: 'All of this comes on top of your rights under Aruban law (the Burgerlijk Wetboek van Aruba): what you buy must match the sale, and if it does not, you can ask for repair, replacement, a lower price or to undo the sale.',
};

export const RETURNS = {
  lead: 'Received the wrong item? Bring it back with the receipt. We check the product first, then exchange it for the right one. Jontai Energy does not give cash refunds: if the right item costs less, the difference is given as store credit.',
  can: [
    { title: 'The wrong item', line: 'Checked in store, then exchanged for the item you meant to buy.' },
    { title: 'A difference in price', line: 'Given as store credit, to spend on anything in the store.' },
    { title: 'A faulty solar battery', line: 'Handled under its one-year warranty.' },
  ] satisfies Point[],
  cannot: ['Cash refunds: any difference is given as store credit', 'Products that have been installed, wired or mounted'],
  steps: [
    { title: 'Bring the product and receipt', line: 'Come by in opening hours. No appointment needed.' },
    { title: 'We check it', line: 'Every product is checked before an exchange.' },
    { title: 'Exchange', line: 'You take home the right item.' },
    { title: 'Store credit for any difference', line: 'If the right item costs less, the difference stays with you as store credit.' },
  ] satisfies Point[],
  furniture: 'For furniture, ask about exchanges when you buy.',
};

export const SERVICE = {
  lead: 'Bought it from us and something is wrong? Bring it in with the receipt. We find out what is going on and tell you the next step: a repair, a replacement part, a warranty claim or a return.',
  covers: 'Solar panels, inverters, batteries, LED fixtures and the other hardware we sell.',
  steps: [
    { title: 'Bring it in', line: 'Come by in opening hours with the product and its receipt. No appointment needed.' },
    { title: 'Free diagnosis under warranty', line: 'If the fault may be covered, the diagnosis costs nothing. Outside warranty, you get a quote before any work starts.' },
    { title: 'A clear plan', line: 'We confirm the repair, how long it should take and any cost. The timing depends on the fault and on parts.' },
    { title: 'Pick up and see it work', line: 'Every repaired unit is tested before you take it home, and repairs carry a 90-day workmanship guarantee.' },
  ] satisfies Point[],
  updates: 'We keep you posted by phone or WhatsApp. If a repair takes longer than expected, we tell you why and what your options are.',
};
