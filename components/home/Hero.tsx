import type { CSSProperties } from 'react';
import { FACT_LABELS, FACT_RANGES, FACT_STORE, FIRST_VIEW, spaceBefore } from '@/lib/homeCopy';
import { REWARDS_FACT, type Fact } from '@/lib/firstView';
import { HeroSkyMotion } from './HeroSkyMotion';
import { OpenStatus } from './OpenStatus';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/** A fact's line: what matters in bold, then the rest of it (with a space unless it starts with a comma). */
const Line = ({ fact }: { fact: Fact }) => (
  <>
    <b>{fact.strong}</b>
    {fact.rest && spaceBefore(fact.rest) ? ' ' : ''}
    {fact.rest}
  </>
);

/**
 * The first view (round 54, Bob: "C and rewards slides over"): still and light, with no scene and no big JONTAI. The
 * line in the site's mix of light and bold, one sentence that says what the store is, two ways in, and four facts on a
 * ruled line across the foot: the hours (live), the store, what it sells and what Rewards gives back. The words rise in
 * once as the page opens; when the page scrolls the first view holds still and Rewards slides up over it like a sheet
 * (round 37, HeroSkyMotion). Before it, rounds 39 to 53: JONTAI across the foot in forest ink.
 */
export function Hero() {
  const [light, bold] = FIRST_VIEW.title;
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero__top">
        <h1 id="hero-title" className="hero__display">
          <span className="hero__mask">
            <span className="hero__line" data-hero-line style={at(380)}>
              {light}
            </span>
          </span>{' '}
          <span className="hero__mask">
            <b className="hero__line" data-hero-line style={at(500)}>
              {bold}
            </b>
          </span>
        </h1>
        <p className="hero__lead" data-hero style={at(760)}>
          {FIRST_VIEW.lead}
        </p>
        <div className="hero__actions" data-hero style={at(900)}>
          <a href="#visit" className="btn btn--primary">
            {FIRST_VIEW.primary}
          </a>
          <a href="#products" className="btn btn--ghost">
            {FIRST_VIEW.secondary}
          </a>
        </div>
      </div>

      <dl className="hero__facts" data-hero style={at(1060)}>
        <div className="hero__fact">
          <dt>{FACT_LABELS[0]}</dt>
          <dd>
            <OpenStatus variant="fact" />
          </dd>
        </div>
        <div className="hero__fact">
          <dt>{FACT_LABELS[1]}</dt>
          <dd>
            <Line fact={FACT_STORE} />
          </dd>
        </div>
        <div className="hero__fact">
          <dt>{FACT_LABELS[2]}</dt>
          <dd>
            <Line fact={FACT_RANGES} />
          </dd>
        </div>
        <div className="hero__fact">
          <dt>{FACT_LABELS[3]}</dt>
          <dd>
            <Line fact={REWARDS_FACT} />
          </dd>
        </div>
      </dl>

      <HeroSkyMotion />
    </section>
  );
}
