// Real Google reviews of Jontai Energy (Google Maps listing, read 2026-11-11). The texts are the reviewers' own words,
// with only spacing and one spelling slip ("legth") tidied; a cut is marked with an ellipsis. Names are shortened to a
// first name and an initial. The rating and count are the listing's own; update them together with the date.

export interface Review {
  name: string;
  stars: 1 | 2 | 3 | 4 | 5;
  when: string;
  text: string;
}

export const GOOGLE_RATING = { score: 4.5, count: 73, read: 'November 2026' } as const;

export const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/Jontai+Energy/@12.5193289,-70.0126666,17z';

export const REVIEWS: Review[] = [
  {
    name: 'Justin Q.',
    stars: 5,
    when: '2 years ago',
    text: 'Very good solar products. Very easy to use. The staffs are very attentive and friendly.',
  },
  {
    name: 'Giovanni W.',
    stars: 4,
    when: '5 years ago',
    text: 'Place has a lot of variety in regards to lighting. Mostly specified on LED lights, they have bulbs, strips, solar and much more. There is a gentleman there who can assist you very well. They cut the strips to the length you need. … Highly recommended!!!',
  },
  {
    name: 'Jacky M.',
    stars: 5,
    when: '6 years ago',
    text: 'If you want to save money and buy quality products. Go to them. Solar power products in every way and things.',
  },
  {
    name: 'Dennys B.',
    stars: 5,
    when: '2 years ago',
    text: 'They have amazing products and best prices.',
  },
];
