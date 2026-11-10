import type { CSSProperties } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { OpenStatus } from './OpenStatus';
import { RangeIndex } from './RangeIndex';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * The first view, in open air: the owner's line in huge thin capitals across the sky, the solar island floating over
 * it, what the store sells and whether it is open on the right, who and where with two ways in at the bottom left,
 * and the six ranges along the bottom. The entrance is CSS (sky.css); HeroSkyMotion adds the scroll depth.
 */
export function Hero() {
  const { hero } = HOME_COPY;
  const [first, ...rest] = hero.title.split(', ');
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero__display">
        <span className="hero__line" data-hero style={at(100)}>
          {rest.length ? `${first},` : first}
        </span>{' '}
        {rest.length > 0 && (
          <span className="hero__line hero__line--two" data-hero style={at(240)}>
            {rest.join(', ')}
          </span>
        )}
      </h1>

      <div className="hero__aside" data-hero style={at(520)}>
        <p>{hero.aside}</p>
        <OpenStatus className="hero__status" />
      </div>

      <figure className="hero__island" aria-hidden="true">
        <div className="hero__float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sky/island-solar-1400.webp"
            srcSet="/sky/island-solar-800.webp 800w, /sky/island-solar-1400.webp 1400w"
            sizes="(max-width: 40rem) 92vw, 46vw"
            alt=""
            width={1400}
            height={1293}
            decoding="async"
          />
        </div>
      </figure>

      <div className="hero__foot" data-hero style={at(680)}>
        <p className="hero__lead">{hero.lead}</p>
        <div className="actions">
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
      <HeroSkyMotion />
    </section>
  );
}
