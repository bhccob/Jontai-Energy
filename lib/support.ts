// The Support page's content (round 2, 2026-10-28). Taken from the store's current site (pages/faq, pages/warranty,
// pages/returns, pages/service; the warranty policy is dated 19 March 2026), without what contradicts the owner's facts:
// installation services and their labour warranty, technicians and on-site visits, prices, financing and efficiency
// figures. The old FAQ's own answers were generic (dollar prices, US tax credits), so the questions here are the store's
// facts as the rest of the site states them. Everything is listed in docs/content-placeholders.md to confirm.

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
    a: 'A licensed electrician for inverters and panels, and an HVAC technician for solar air conditioners, as the manufacturers require. Jontai Energy sells and delivers; it does not install.',
  },
  { q: 'What do you deliver?', a: 'Large items, such as furniture from the second floor and large generators. Ask about delivery when you buy.' },
  { q: 'Can I see products before I buy?', a: 'Yes. Everything is on the floor at Cumana 73, with furniture one flight up.' },
  { q: 'Are prices online?', a: 'No. Request a quote and the store replies by email with current prices and what is in stock, or ask in store.' },
  {
    q: 'How do I claim under warranty?',
    a: 'Call, WhatsApp or email us, or bring the product and its receipt to the store. We assess every claim within 5 business days.',
  },
  {
    q: 'Can I return something?',
    a: 'Yes, within 14 days with the receipt, if it is unused and in its original packaging. A faulty product is handled under the warranty.',
  },
  {
    q: 'Do you repair what you sell?',
    a: 'Bring it in with the receipt. The diagnosis is free when the fault may be under warranty; outside warranty, a repair is quoted before any work starts.',
  },
  {
    q: 'How do I join Rewards?',
    a: 'Open your membership in store at Cumana 73 and collect your loyalty card. The code on the card is your member login.',
  },
];

export const WARRANTY = {
  lead: 'Our store warranty covers the products below against defects in materials and workmanship in normal use. Manufacturer warranties pass on to you, and where a manufacturer offers better terms than ours, theirs apply and we help you claim.',
  periods: [
    { what: 'Solar panels', period: '10 years', note: "The product. The manufacturer's performance warranty, typically 25 years, comes on top." },
    {
      what: 'Inverters and batteries',
      period: '5 years',
      note: "Manufacturing defects in normal use. The manufacturer's own warranty is separate, as each product's datasheet gives it.",
    },
    { what: 'LED fixtures and drivers', period: '3 years', note: 'Including light output that falls below 70% of new within the period.' },
    { what: 'Electrical hardware', period: '1 year', note: 'Cables, breakers and switchgear.' },
    { what: 'Other hardware', period: '6 months', note: 'Mounting accessories and small parts.' },
  ],
  from: 'Periods run from the date of purchase. For furniture, and anything not listed here, ask about the warranty when you buy.',
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
  remedy:
    'When a claim is accepted we decide on the remedy: a repair, a replacement with the same or an equivalent model, or a refund if neither is possible. A replacement keeps the rest of the original warranty, or 90 days, whichever is longer. The repair and its transport within Aruba cost you nothing.',
  law: 'All of this comes on top of your rights under Aruban law (the Burgerlijk Wetboek van Aruba): what you buy must match the sale, and if it does not, you can ask for repair, replacement, a lower price or to undo the sale.',
};

export const RETURNS = {
  lead: 'Bring back a standard-stock product within 14 days with the receipt, unused and in its original packaging, for an exchange or a refund to the original payment method.',
  can: [
    { title: 'Unopened', line: 'In its sealed packaging, within 14 days: a refund or an exchange, with no restocking fee.' },
    { title: 'Opened but unused', line: 'With no sign of use or fitting, within 14 days, it may be exchanged. We may check it first.' },
    { title: 'Faulty', line: 'Assessed, then repaired, replaced or refunded under the warranty and your legal rights.' },
    { title: 'The wrong item', line: 'If we gave you the wrong product, we replace it and cover the transport.' },
  ] satisfies Point[],
  cannot: [
    'Products that have been installed, wired or mounted, unless a manufacturing defect is confirmed',
    'Custom or special-order items, such as cut cable lengths, unless they arrive faulty',
    'Products that are not faulty, after 14 days',
  ],
  steps: [
    { title: 'Bring the product and receipt', line: 'Come by in opening hours. No appointment needed.' },
    { title: 'A quick check', line: 'We look at its condition and, if it may be faulty, whether the store policy, the warranty or the law applies.' },
    { title: 'Exchange or refund', line: 'Where it qualifies: the same or an equivalent product, or your money back to the original payment method.' },
    {
      title: 'Done',
      line: 'Cash refunds are paid in store once approved; card refunds take 3 to 7 business days, depending on your bank. If it needs repair or more review, we confirm the next step in writing.',
    },
  ] satisfies Point[],
  furniture: 'For furniture, ask about returns when you buy.',
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
