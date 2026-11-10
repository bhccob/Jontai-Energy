import type { CSSProperties } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { HOME_COPY } from '@/lib/products';
import { OpenStatus } from './OpenStatus';
import { RangeIndex } from './RangeIndex';

/** When each part of the entrance starts, in ms (stage.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * The first view, after hours: whether the store is open now, what Jontai Energy sells and where it is, two ways in,
 * and the six ranges along the bottom. The products themselves stand on the stage behind (StageScope), on the right.
 * The entrance is CSS (stage.css), so it plays as the page paints, with or without scripts.
 */
export function Hero() {
  const { hero } = HOME_COPY;
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <OpenStatus className="hero__status" data-hero />
        <h1 id="hero-title" className="hero__title">
          <Words text={hero.title} />
        </h1>
        <p className="hero__lead" data-hero style={at(480)}>
          {hero.lead}
        </p>
        <div className="actions" data-hero style={at(580)}>
          <a href="#visit" className="btn btn--primary">
            {hero.primary} <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </a>
          <a href="#products" className="btn btn--ghost">
            {hero.secondary}
          </a>
        </div>
      </div>
      <p className="hero__note" data-hero style={at(1100)}>
        {hero.note}
      </p>
      <RangeIndex />
    </section>
  );
}
