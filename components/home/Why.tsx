import type { CSSProperties } from 'react';
import { ChatsCircle, HouseLine, Truck } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { HOME_COPY } from '@/lib/products';
import { WhyHover } from './WhyHover';

const ICONS = [HouseLine, Truck, ChatsCircle];

/** One run of the sentence, split into words that fill in with the scroll (PageMotion, data-fill). A `pic` makes it a
 *  key word: underlined, and under the pointer it calls up its picture (WhyHover). */
function Run({ text, soft, pic }: { text: string; soft?: boolean; pic?: string }) {
  const words = <Words text={text} />;
  return (
    <span className={soft ? 'soft' : undefined}>
      {pic ? (
        <span className="why__key" data-pic={pic}>
          {words}
        </span>
      ) : (
        words
      )}
    </span>
  );
}

/**
 * What sets the store apart, after Novair's "why us": one sentence about the two floors, filled in word by word as it
 * scrolls. Its key words are underlined; point at one and its picture rises beside the pointer and follows it (the
 * pictures no longer sit inside the sentence, Bob round 13). Then the three things the store does differently, in
 * columns with an icon each. All from the store's own words (data/products.json, statement).
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
      <p className="why__big" data-fill>
        <Run text={g1} pic="/sky/island-solar-700.webp" /> <Run text={`${gRest.join(' ')}.`} /> <Run text={u1} pic="/sky/island-furniture-700.webp" />{' '}
        <Run text={uRest.join(' ')} /> <Run text={`${soft} at`} soft /> <Run text={place} soft pic="/sky/island-array-700.webp" />
      </p>
      <ul className="why__points">
        {statement.points.map((p, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={p.label} id={p.id} style={{ '--i': i } as CSSProperties}>
              <span className="rule" data-line />
              <span className="why__num">{String(i + 1).padStart(2, '0')}</span>
              <Icon className="why__icon" size={30} weight="light" aria-hidden="true" />
              <h3 className="why__name" data-reveal>
                {p.label}
              </h3>
              <p data-reveal>{p.text}</p>
            </li>
          );
        })}
      </ul>
      <WhyHover />
    </section>
  );
}
