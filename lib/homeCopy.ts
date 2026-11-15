// The words round 54 adds to the site, in one place so the dictionaries can be checked against them (round54.test).
// Strings with {0} holes are translator patterns (lib/i18n), the rest are plain strings.
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_STEP_AFL, formatAfl, formatPoints } from './loyalty.ts';

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

/** The fragments as the page sets them: each carries the space before it, so no space stands in a node of its own
 *  (the translator leaves such a node alone, and in Chinese it would show between the characters). */
export const solutionPieces = () => SOLUTION.map((f, i) => ({ ...f, text: (i && spaceBefore(f.text) ? ' ' : '') + f.text }));

/** The sentence as one line of text. */
export const solutionText = () => SOLUTION.map((f, i) => (i && spaceBefore(f.text) ? ' ' : '') + f.text).join('');

export const SOLUTION_KICKER = 'Our solution';
export const SOLUTION_POINTS = ['Your own power', 'We fix what we sell', 'Prices hard to beat', 'More than solar', 'Every customer matters', 'Always learning'];

export const WHEEL_COPY = {
  title: ['Six ranges.', 'One store.'],
  line: 'Six ranges and more. Keep scrolling to go through them.',
  see: 'See all {0} products',
  seeOthers: 'See all other products',
  delivery: 'How delivery works',
  end: ['Every product,', 'one by one.'],
  endButton: 'See all products',
  askUs: 'Ask us',
  pictures: 'Pictures are illustrations, not specific stock.',
};

// Round 54, view only (Bob: "i want them to not be like a site that you can shop but only to view"): no search, no
// counts, no quote; a product opens its short info (INFO_COPY).
export const CATALOG_COPY = {
  title: ['All', 'products'],
  line: 'Everything on the shelf at Cumana 73, one by one. Pick one to read what it is.',
  others: 'Others',
  all: 'All',
  othersLine: 'Smaller things we sell, and anything else you ask us for.',
};

/** The short info a product opens on the All products page (round 54). */
export const INFO_COPY = {
  close: 'Close',
  prev: 'Previous product',
  next: 'Next product',
  ask: 'Ask us about it',
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

/** Rewards, laid out calmer (round 54): a plan's figure is its number in bold, then "back" or "off". */
export const REWARDS_COPY = {
  homeLine: `For every ${formatAfl(REWARD_STEP_AFL)} you spend, a voucher to spend on anything in the store.`,
  businessLine: `Reach ${formatPoints(BUSINESS_GOAL)} and everything is ${BUSINESS_DISCOUNT}% off until the account's anniversary.`,
  back: 'back',
  off: 'off',
};
