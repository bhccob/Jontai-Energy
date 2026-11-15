// The words round 54 adds to the site, in one place so the dictionaries can be checked against them (round54.test).
// Strings with {0} holes are translator patterns (lib/i18n), the rest are plain strings.

export const FIRST_VIEW = {
  title: ['Aruba sunlight,', 'made useful.'],
  lead: 'Solar, backup power, lighting, cooling, security cameras and furniture, from one family-owned store in Oranjestad.',
  primary: 'Visit the store',
  secondary: 'See what we sell',
};

export const FACT_LABELS = ['Hours', 'The store', 'What we sell', 'Jontai Rewards'];
export const FACT_STORE = { strong: 'Cumana 73', rest: ', Oranjestad' };
export const FACT_RANGES = { strong: 'Six ranges', rest: ', one store' };

/** Our solution: one sentence in fragments, the six promises marked as keys (bold green as it fills). */
export const SOLUTION: { text: string; key?: true }[] = [
  { text: 'At Jontai, your home makes' },
  { text: 'its own power', key: true },
  { text: ", so the island's blackouts do not stop your day. We" },
  { text: 'fix what we sell', key: true },
  { text: ', even years later. Our prices are' },
  { text: 'hard to beat', key: true },
  { text: ', for the same quality or better. We sell' },
  { text: 'far more than solar', key: true },
  { text: '.' },
  { text: 'Every customer matters', key: true },
  { text: ', long after the sale. And our family' },
  { text: 'keeps learning', key: true },
  { text: ", to bring tomorrow's ideas home." },
];

/** Whether a fragment of the sentence follows the one before it with a space (not before , or .). */
export const spaceBefore = (text: string) => !/^[,.]/.test(text);

/** The sentence as one line of text. */
export const solutionText = () => SOLUTION.map((f, i) => (i && spaceBefore(f.text) ? ' ' : '') + f.text).join('');

export const SOLUTION_KICKER = 'Our solution';
export const SOLUTION_POINTS = ['Your own power', 'We fix what we sell', 'Prices hard to beat', 'More than solar', 'Every customer matters', 'Always learning'];

export const WHEEL_COPY = {
  title: ['Six ranges.', 'One store.'],
  line: 'One product stands for each range. Keep scrolling to go through them.',
  seeAll: 'See all {0} {1} products',
  hover: 'See all {0}',
  delivery: 'How delivery works',
  end: ['Every product,', 'one by one.'],
  endButton: 'See all products',
  also: 'Also SD cards, small solar lights, solar doorbells and WiFi mesh.',
  askUs: 'Ask us',
  pictures: 'Pictures are illustrations, not specific stock.',
};

export const FOOTER_COPY = {
  ask: ['Questions?', 'A person answers.'],
  line: 'Call, send a message or come by Cumana 73. Someone at the store reads every message.',
  message: 'Send a message',
  heads: ['Pages', 'Help', 'Follow', 'Contact'],
  pages: ['What we sell', 'All products', 'Rewards', 'Request a quote', 'Visit'],
  help: ['Support', 'Questions', 'Large-item delivery'],
  service: 'Jontai Energy sells and delivers; it does not install.',
};

export const CATALOG_COPY = {
  title: ['All', 'products'],
  line: 'Everything on the shelf at Cumana 73, one by one. Pick one to see what it is and ask for a quote.',
  search: 'Search products',
  others: 'Others',
  all: 'All',
  empty: 'Nothing matches that. Try another word, or ask us.',
  othersLine: 'Smaller things we sell, and anything else you ask us for.',
};

export const MENU_COPY = { products: 'All products', solution: 'Our solution' };

/** The open-now line in two parts for the first view's Hours fact (lib/firstView hoursFact): the state, then the time. */
export const HOURS_COPY = {
  open: 'Open now',
  closed: 'Closed now',
  until: ', until {0}',
  opensAt: ', opens at {0}',
  opensTomorrow: ', opens tomorrow at {0}',
};
