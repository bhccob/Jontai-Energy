import type { CSSProperties } from 'react';
import { ChatsCircle, HouseLine, Truck } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { HOME_COPY } from '@/lib/products';
import { WhyStore } from './WhyStore';

const ICONS = [HouseLine, Truck, ChatsCircle];

/** One run of the sentence, split into words that fill in with the scroll (PageMotion, data-fill). A `floor` makes it
 *  a key word: underlined, and under the pointer it lights its floor of the store beside it (WhyStore). */
function Run({ text, soft, floor }: { text: string; soft?: boolean; floor?: 'ground' | 'upstairs' | 'street' }) {
  const words = <Words text={text} />;
  return (
    <span className={soft ? 'soft' : undefined}>
      {floor ? (
        <span className="why__key" data-key={floor}>
          {words}
        </span>
      ) : (
        words
      )}
    </span>
  );
}

/**
 * What sets the store apart, after Novair's "why us" (redesigned in round 20): the sentence about the two floors,
 * filled in word by word as it scrolls, and beside it the store itself in two floors of glass with its ranges standing
 * on them (WhyStore); the key words and the floors light each other. Then the three things the store does
 * differently, each with its number in thin outlined capitals and its icon in a small glass lens. All from the store's
 * own words (data/products.json, statement).
 */
export function Why() {
  const { statement } = HOME_COPY;
  const [ground, upstairs] = statement.strong.split('. ');
  const [g1, ...gRest] = ground.split(' ');
  const [u1, ...uRest] = upstairs.split(' ');
  const soft = statement.soft.replace(/ at .*/, '');
  const place = statement.soft.replace(/^.* at (.*)$/, '$1');
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
          <Run text={g1} floor="ground" /> <Run text={`${gRest.join(' ')}.`} /> <Run text={u1} floor="upstairs" /> <Run text={uRest.join(' ')} />{' '}
          <Run text={`${soft} at`} soft /> <Run text={place} soft floor="street" />
        </p>
        <WhyStore />
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
