import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { FitText } from '@/components/ui/FitText';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { SunClock } from './SunClock';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * The first view, kept to a few things (Bob, round 11: "too cluttered"): the live line about the sun over the store,
 * the owner's line in thin wide capitals, one sentence that says what the store is, one way in. Under it the landscape:
 * the moving valley at the back (SkyScope), JONTAI standing in it across the whole width, the solar island floating in
 * front of the name and the grass nearest the eye. The valley opens like a window as the page arrives (sky.css), and
 * HeroSkyMotion pulls the layers apart as the next section slides over.
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
              sizes="(max-width: 60rem) 88vw, 36vw"
              alt=""
              width={1200}
              height={903}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </figure>
        {/* The name stands in the valley behind the island; decorative, the header already says it. */}
        <div className="hero__word">
          <FitText text="JONTAI" chars />
        </div>
      </div>

      {/* Out-of-focus grass close to the eye, over the foot of the name and the island's shadow. */}
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
      <div className="hero__shade" aria-hidden="true" />
      <HeroSkyMotion />
    </section>
  );
}
