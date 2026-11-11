import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { SunClock } from './SunClock';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * The first view, kept to a few things on a plain deep green (Bob, rounds 11 and 12: "too cluttered"): the live line
 * about the sun over the store, the owner's line in thin wide capitals, one sentence that says what the store is, one
 * way in. Under it the solar island floats in front of JONTAI, whose letters show the moving valley (SkyScope).
 * HeroSkyMotion pulls the layers apart as Rewards slides over.
 */
export function Hero() {
  const { hero } = HOME_COPY;
  const [first, ...rest] = hero.title.split(', ');
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero__top">
        <div className="hero__eyebrow" data-hero style={at(380)}>
          <SunClock />
        </div>
        <h1 id="hero-title" className="hero__display">
          <span className="hero__mask">
            <span className="hero__line" data-hero-line style={at(520)}>
              {rest.length ? `${first},` : first}
            </span>
          </span>{' '}
          {rest.length > 0 && (
            <span className="hero__mask">
              <span className="hero__line" data-hero-line style={at(640)}>
                {rest.join(', ')}
              </span>
            </span>
          )}
        </h1>
        <p className="hero__lead" data-hero style={at(900)}>
          {hero.lead}
        </p>
        <div className="hero__actions" data-hero style={at(1040)}>
          <a href="#visit" className="btn btn--primary">
            {hero.primary} <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </a>
          <a href="#products" className="hero__more">
            {hero.secondary} <ArrowDown size={16} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hero__stage">
        <figure className="hero__island" aria-hidden="true">
          <div className="hero__float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sky/island-array-1200.webp"
              srcSet="/sky/island-array-700.webp 700w, /sky/island-array-1200.webp 1200w"
              sizes="(max-width: 60rem) 88vw, 40vw"
              alt=""
              width={1200}
              height={903}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </figure>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <HeroSkyMotion />
    </section>
  );
}
