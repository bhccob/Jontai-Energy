import type { CSSProperties } from 'react';
import { Words } from '@/components/ui/Split';
import { HOME_COPY } from '@/lib/products';
import { StatementLight } from './StatementLight';

/**
 * One clear sentence about the store, filled in word by word as it scrolls up, and three ruled points under it. The
 * first, Family-owned, names the team page to come.
 */
export function Statement() {
  const { statement } = HOME_COPY;
  return (
    <section className="statement" aria-labelledby="statement-title">
      <p id="statement-title" className="label" data-reveal>
        {statement.label}
      </p>
      <p className="statement__big" data-fill>
        <Words text={statement.strong} />{' '}
        <span className="soft">
          <Words text={statement.soft} />
        </span>
      </p>
      <ul className="statement__points">
        {statement.points.map((p, i) => (
          <li key={p.label} id={p.id} style={{ '--i': i } as CSSProperties}>
            <span className="rule" data-line />
            <span className="label" data-reveal>
              {p.label}
            </span>
            <p data-reveal>{p.text}</p>
            {p.team && (
              // The team page is a later feature: named here, not a link until it exists.
              <p className="team" data-reveal>
                Meet the team<span className="visually-hidden">,</span> <span className="team__soon">Coming soon</span>
              </p>
            )}
          </li>
        ))}
      </ul>
      <StatementLight />
    </section>
  );
}
