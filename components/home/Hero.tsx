import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { SunClock } from './SunClock';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/**
 * Where the scroll flies into the island (HeroSkyMotion), in % of the picture: the porch bulb, lit once the sun has set,
 * whose light becomes Rewards (Bob, round 26: "Sunset, lights on"). The bulb and the window's light are baked by
 * tools/sky/home-lights.mjs; the glows sit on them (sky.css).
 */
const ZOOM = { x: 39.6, y: 28.4 };

/**
 * The first view, kept to a few things on a plain deep green (Bob, rounds 11 and 12: "too cluttered"): the live line
 * about the sun over the store, the owner's line in thin wide capitals, one sentence that says what the store is, one
 * way in. Under it the home on the island floats in front of JONTAI, whose letters show the moving valley (SkyScope):
 * a small Aruban home with the store's things on and around it (round 26). On wide screens the scroll brings the
 * sunset (HeroSkyMotion): golden hour, then dusk over the valley and the house, the window and the porch bulb switch on,
 * and the flight goes into the bulb, whose light floods the screen and becomes Rewards.
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
        <figure className="hero__island" aria-hidden="true" data-zoom-x={ZOOM.x} data-zoom-y={ZOOM.y}>
          <div className="hero__float">
            <div className="hero__lean">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero__day"
                src="/sky/island-home-1200.webp"
                srcSet="/sky/island-home-700.webp 700w, /sky/island-home-1200.webp 1200w"
                sizes="(max-width: 60rem) 78vw, 40vw"
                alt=""
                width={1200}
                height={1125}
                fetchPriority="high"
                decoding="async"
              />
              {/* The sunset over the house: golden hour, then dusk (multiplied over it, inside its outline). */}
              <span className="hero__tint hero__tint--gold" />
              <span className="hero__tint hero__tint--night" />
              {/* Its lights, which stay bright once the rest has gone dark, and the glow round them. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero__lights"
                src="/sky/island-home-lights-1200.webp"
                srcSet="/sky/island-home-lights-700.webp 700w, /sky/island-home-lights-1200.webp 1200w"
                sizes="(max-width: 60rem) 78vw, 40vw"
                alt=""
                width={1200}
                height={1125}
                fetchPriority="low"
                decoding="async"
              />
              <span className="hero__glow hero__glow--window" />
              <span className="hero__glow hero__glow--bulb" />
            </div>
          </div>
        </figure>
      </div>
      {/* The bulb's light that floods the screen, then the white Rewards starts in (HeroSkyMotion). */}
      <div className="hero__flood" aria-hidden="true" />
      <div className="hero__mist" aria-hidden="true" />
      <HeroSkyMotion />
    </section>
  );
}
