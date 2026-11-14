import type { CSSProperties } from 'react';
import { FitText } from '@/components/ui/FitText';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { OpenStatus } from './OpenStatus';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * The first view, kept to a few things (Bob, rounds 11 and 12: "too cluttered"): whether the store is open now, as a
 * plain line of text (round 43, Bob on the "Bon bini" time pill: "looks like its ai generated"), the owner's line in thin
 * wide capitals, one sentence that says what the store is, one way in, and under them JONTAI across the foot of the
 * screen, fading into the valley (rounds 39 and 41). The floating islands that stood here from round 26 are gone (round
 * 38, Bob: "less game like"). As the page scrolls the first view holds still and Rewards slides up over it like a sheet
 * (round 37, HeroSkyMotion).
 */
export function Hero() {
  const { hero } = HOME_COPY;
  const [first, ...rest] = hero.title.split(', ');
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero__top">
        <div className="hero__eyebrow" data-hero style={at(380)}>
          <OpenStatus />
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
            {hero.primary}
          </a>
          <a href="#products" className="hero__more">
            {hero.secondary}
          </a>
        </div>
      </div>

      {/* JONTAI in solid forest ink on a thin rule across the foot (round 39), its letters rising one by one. */}
      <div className="hero__mark">
        <FitText text="JONTAI" chars className="hero__name" />
      </div>

      <HeroSkyMotion />
    </section>
  );
}
