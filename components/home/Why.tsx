import type { CSSProperties } from 'react';
import { ChatsCircle, HouseLine, Truck } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { ISLANDS } from '@/lib/islands';
import { HOME_COPY } from '@/lib/products';
import { STORE } from '@/lib/store';

const ICONS = [HouseLine, Truck, ChatsCircle];

/**
 * The store in three figures, all from its own details: its floors, its ranges (lib/islands) and the days it opens
 * (lib/store hours: Monday to Saturday, and Sunday).
 */
const FACTS = [
  { n: 2, label: 'Floors', line: 'Power, light and cooling downstairs, furniture one flight up.' },
  { n: ISLANDS.length, label: 'Ranges', line: ISLANDS.map((i) => i.name.toLowerCase()).join(', ').replace(/^./, (c) => c.toUpperCase()) + '.' },
  { n: 7, label: 'Days a week', line: STORE.hours.map((h) => `${h.days}, ${h.time}`).join('. ') + '.' },
];

/** A digit that rolls up from 0 to `n` the first time it is seen (air.css, .tally__roll); without motion it just shows. */
function Roll({ n }: { n: number }) {
  return (
    <span className="tally__num" aria-hidden="true">
      <span className="tally__zero">0</span>
      <span className="tally__roll" style={{ '--n': n } as CSSProperties}>
        <span>
          {Array.from({ length: n + 1 }, (_, i) => (
            <span key={i}>{i}</span>
          ))}
        </span>
      </span>
    </span>
  );
}

/**
 * What sets the store apart, after Novair's "why us" (round 21: no products here, they have their own section, and no
 * pictures on hover): the sentence about the two floors, filled in word by word as it scrolls, and beside it the store
 * in three big figures that roll up as they arrive. Then the three things the store does differently, each with its
 * number in thin outlined capitals and its icon in a small glass lens. All from the store's own words.
 */
export function Why() {
  const { statement } = HOME_COPY;
  return (
    <section id="why" className="why" aria-labelledby="why-title">
      <div className="why__top">
        <h2 id="why-title" className="why__kicker" data-reveal>
          <span>(01)</span> Why Jontai
        </h2>
        <p className="why__side" data-reveal>
          {statement.label}. A family store for power, light and the home.
        </p>
      </div>
      <div className="why__main">
        <p className="why__big" data-fill>
          <span>
            <Words text={statement.strong} />
          </span>{' '}
          <span className="soft">
            <Words text={statement.soft} />
          </span>
        </p>
        <dl className="tally">
          {FACTS.map((f, i) => (
            <div key={f.label} className="tally__row" data-reveal style={{ '--i': i } as CSSProperties}>
              <dt>
                <Roll n={f.n} />
                <span className="tally__label">
                  <span className="visually-hidden">{f.n} </span>
                  {f.label}
                </span>
              </dt>
              <dd>{f.line}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ul className="why__points">
        {statement.points.map((p, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={p.label} id={p.id} style={{ '--i': i } as CSSProperties}>
              <span className="rule" data-line />
              <span className="why__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="why__point">
                <span className="why__lens" aria-hidden="true">
                  <Icon size={22} weight="light" />
                </span>
                <h3 className="why__name" data-reveal>
                  {p.label}
                </h3>
                <p data-reveal>{p.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
