import type { CSSProperties } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { FitText } from '@/components/ui/FitText';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { OpenStatus } from './OpenStatus';
import { SunClock } from './SunClock';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * The first view, in layers like a landscape: the moving valley at the back (SkyScope), the name JONTAI standing in it
 * across the whole width, the solar island floating in front of the name, and the grass nearest the eye over its foot.
 * The owner's line in thin wide capitals at the top left, under a live line about the sun over the store; what it sells
 * and whether it is open on the right; who and where with two ways in. The entrance is CSS (sky.css); HeroSkyMotion
 * pulls the layers apart as it scrolls away.
 */
export function Hero() {
  const { hero } = HOME_COPY;
  const [first, ...rest] = hero.title.split(', ');
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero__eyebrow" data-hero style={at(40)}>
        <SunClock />
      </div>

      <h1 id="hero-title" className="hero__display">
        <span className="hero__mask">
          <span className="hero__line" data-hero-line style={at(120)}>
            {rest.length ? `${first},` : first}
          </span>
        </span>{' '}
        {rest.length > 0 && (
          <span className="hero__mask">
            <span className="hero__line hero__line--two" data-hero-line style={at(240)}>
              {rest.join(', ')}
            </span>
          </span>
        )}
      </h1>

      <div className="hero__aside" data-hero style={at(560)}>
        <p>{hero.aside}</p>
        <OpenStatus className="hero__status" />
      </div>

      <div className="hero__foot" data-hero style={at(700)}>
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

      {/* The name stands in the valley, its foot in the grass; decorative, the header already says it. */}
      <div className="hero__word">
        <FitText text="JONTAI" chars />
      </div>

      <figure className="hero__island" aria-hidden="true">
        <div className="hero__float">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sky/island-array-1200.webp"
            srcSet="/sky/island-array-700.webp 700w, /sky/island-array-1200.webp 1200w"
            sizes="(max-width: 60rem) 92vw, 46vw"
            alt=""
            width={1200}
            height={903}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </figure>

      {/* Out-of-focus grass close to the eye, in front of the island and the name. */}
      <div className="hero__grass" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sky/grass-front-1280.webp"
          srcSet="/sky/grass-front-1280.webp 1280w, /sky/grass-front-2560.webp 2560w"
          sizes="100vw"
          alt=""
          width={1280}
          height={304}
          decoding="async"
        />
      </div>

      <p className="hero__note" data-hero style={at(1100)}>
        {hero.note}
      </p>
      <HeroSkyMotion />
    </section>
  );
}
