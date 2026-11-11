import type { CSSProperties } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { bundleQuestion } from '@/lib/bundles';
import { REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl } from '@/lib/loyalty';

interface Row {
  title: string;
  text: string;
  tags: string[];
  href: string;
  external?: boolean;
}

/** What the store offers besides the products, each line in its own words from the rest of the site. */
const ROWS: Row[] = [
  {
    title: 'Six ranges, two floors',
    text: 'Solar, backup power, lighting, cooling and security cameras on the ground floor, furniture one flight up.',
    tags: ['Solar', 'Backup power', 'Lighting', 'Cooling', 'Security', 'Furniture'],
    href: '#products',
  },
  {
    title: 'Quotes and messages',
    text: 'Buy at the counter, ask for a quote or send us a message. No cart, no checkout.',
    tags: ['At the counter', 'Quote request', 'Message'],
    href: '/quote',
  },
  {
    title: 'Large-item delivery',
    text: 'Large-item delivery available. Ask us about furniture delivery.',
    tags: ['Furniture', 'Large items'],
    href: '#upstairs',
  },
  {
    title: 'Jontai Rewards',
    text: `Every full ${formatAfl(REWARD_STEP_AFL)} you spend adds a ${formatAfl(REWARD_PER_STEP_AFL)} voucher to your card.`,
    tags: ['Store credit', 'Members'],
    href: '#rewards',
  },
  {
    title: 'Bundle offers',
    text: "Kits that cost less together. Sample offers; ask in store for this month's bundles.",
    tags: ['Solar kits', 'Security', 'Outdoor lighting'],
    href: bundleQuestion(),
  },
  {
    title: 'Support after you buy',
    text: 'Warranty, returns and the questions people ask most, from the store’s own policy.',
    tags: ['Warranty', 'Returns', 'Questions'],
    href: '/support',
  },
];

/**
 * What the store offers, as Novair lists its services: a numbered row each, the name in wide capitals, a line, a few
 * tags and a round arrow. Under the pointer a row's name slides along and its arrow fills; the whole row is the link.
 */
export function Offer() {
  return (
    <section id="offer" className="offer-list" aria-labelledby="offer-title">
      <div className="offer-list__top">
        <p className="offer-list__kicker">
          <span>(03)</span> What we offer
        </p>
        <h2 id="offer-title" className="air-display offer-list__title" data-words>
          <span>
            <Words text="More than" />
          </span>{' '}
          <span>
            <Words text="the shelf." />
          </span>
        </h2>
        <p className="offer-list__side" data-reveal>
          Products you can see and touch, and the people and promises that come with them.
        </p>
      </div>
      <ol className="offer-list__rows">
        {ROWS.map((r, i) => (
          <li key={r.title} style={{ '--i': i } as CSSProperties}>
            <a href={r.href} className="offer-row" {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span className="offer-row__num">({String(i + 1).padStart(2, '0')})</span>
              <span className="offer-row__title">{r.title}</span>
              <span className="offer-row__body">
                <span className="offer-row__text">{r.text}</span>
                <span className="offer-row__tags">
                  {r.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
              </span>
              <span className="offer-row__go" aria-hidden="true">
                <ArrowUpRight size={20} weight="regular" />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
