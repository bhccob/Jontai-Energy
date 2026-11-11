import type { CSSProperties, ReactNode } from 'react';
import { ChatsCircle, HouseLine, Truck } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { HOME_COPY } from '@/lib/products';

const ICONS = [HouseLine, Truck, ChatsCircle];

/** A small picture set into the sentence, between its words, that grows in as the sentence fills (Novair's idea). */
function Pic({ src, i }: { src: string; i: number }) {
  return (
    <span className="why__pic" aria-hidden="true" data-reveal style={{ '--i': i } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={140} height={100} loading="lazy" decoding="async" />
    </span>
  );
}

/** One run of the sentence, split into words that fill in with the scroll (PageMotion, data-fill). */
const Run = ({ text, soft }: { text: string; soft?: boolean }): ReactNode => (
  <span className={soft ? 'soft' : undefined}>
    <Words text={text} />
  </span>
);

/**
 * What sets the store apart, after Novair's "why us": one sentence about the two floors, filled in word by word as it
 * scrolls, with the products set into it as small pictures; then the three things the store does differently, in
 * columns with an icon each. All from the store's own words (data/products.json, statement).
 */
export function Why() {
  const { statement } = HOME_COPY;
  const [ground, upstairs] = statement.strong.split('. ');
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
        <Run text={ground.split(' ')[0]} /> <Pic src="/sky/island-solar-700.webp" i={0} /> <Run text={`${ground.split(' ').slice(1).join(' ')}.`} />{' '}
        <Run text={upstairs.split(' ')[0]} /> <Pic src="/sky/island-furniture-700.webp" i={1} /> <Run text={upstairs.split(' ').slice(1).join(' ')} />{' '}
        <Run text={statement.soft.replace(/ at .*/, '')} soft /> <Pic src="/sky/island-light-700.webp" i={2} />{' '}
        <Run text={statement.soft.replace(/^.* (at .*)$/, '$1')} soft />
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
    </section>
  );
}
