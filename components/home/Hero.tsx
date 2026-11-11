import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { SunClock } from './SunClock';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;
/** The outline a tint is multiplied inside: the island's own picture (sky.css, .hero__tint). */
const outline = (src: string) => ({ '--mask': `url(${src})` }) as CSSProperties;

/**
 * Where the scroll flies into the main island (HeroSkyMotion), in % of the picture: its lamp's bulb, lit once the sun
 * has set, whose light becomes Rewards (Bob, round 26: "Sunset, lights on"). The bulb's light is baked by
 * tools/sky/hero-islands.mjs; the glow sits on it (sky.css).
 */
const ZOOM = { x: 83, y: 11.4 };

/**
 * The small islands round the main one (Bob, round 26: "more sub floating islands"), cut from one picture by
 * tools/sky/hero-islands.mjs. `depth` runs from far (0) to near (1): how far each one drifts with the pointer and how
 * fast it rushes past as the scroll flies in. `lamp` is where a garden light's glass is, in % of the picture, for the
 * glow it gives at dusk. Placed in sky.css (.hero__small--<name>).
 */
const SMALL = [
  { name: 'lantern', height: 656, depth: 0.35, lamp: { x: 50.5, y: 20 } },
  { name: 'tree', height: 713, depth: 0.55 },
  { name: 'meadow', height: 550, depth: 0.8, lamp: { x: 68, y: 19 } },
  { name: 'panel', height: 617, depth: 1 },
] as const;

/**
 * The first view, kept to a few things (Bob, rounds 11 and 12: "too cluttered"): the live line about the sun over the
 * store, the owner's line in thin wide capitals, one sentence that says what the store is, one way in. Under it a
 * round, mossy island with three solar panels and a lamp floats in front of JONTAI, whose letters show the moving
 * valley (SkyScope), with four small islands round it at different depths (round 26). On wide screens the scroll
 * brings the sunset (HeroSkyMotion): golden hour, then dusk over the valley and the islands, the garden lights and the
 * lamp switch on, the small islands rush past, and the flight goes into the lamp's bulb, whose light floods the screen
 * and becomes Rewards.
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
                src="/sky/island-main-1200.webp"
                srcSet="/sky/island-main-700.webp 700w, /sky/island-main-1200.webp 1200w"
                sizes="(max-width: 60rem) 78vw, 40vw"
                alt=""
                width={1200}
                height={1172}
                fetchPriority="high"
                decoding="async"
              />
              {/* The sunset over the island: golden hour, then dusk, multiplied inside its outline. */}
              <span className="hero__tint" style={outline('/sky/island-main-700.webp')} />
              {/* The lamp's bulb, which stays bright once the rest has gone dark, and the glow round it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero__lights"
                src="/sky/island-main-lights-1200.webp"
                srcSet="/sky/island-main-lights-700.webp 700w, /sky/island-main-lights-1200.webp 1200w"
                sizes="(max-width: 60rem) 78vw, 40vw"
                alt=""
                width={1200}
                height={1172}
                fetchPriority="low"
                decoding="async"
              />
              <span className="hero__glow hero__glow--bulb" />
            </div>
          </div>
        </figure>
      </div>

      {SMALL.map((s) => (
        <div key={s.name} className={`hero__small hero__small--${s.name}`} data-depth={s.depth} aria-hidden="true">
          <div className="hero__drift">
            <div className="hero__arrive">
              <div className="hero__bob">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="hero__day"
                  src={`/sky/island-small-${s.name}-640.webp`}
                  srcSet={`/sky/island-small-${s.name}-360.webp 360w, /sky/island-small-${s.name}-640.webp 640w`}
                  sizes="(max-width: 60rem) 26vw, 14vw"
                  alt=""
                  width={640}
                  height={s.height}
                  decoding="async"
                />
                <span className="hero__tint" style={outline(`/sky/island-small-${s.name}-360.webp`)} />
                {'lamp' in s && (
                  <span className="hero__glow hero__glow--lamp" style={{ left: `${s.lamp.x}%`, top: `${s.lamp.y}%` }} />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* The bulb's light that floods the screen, then the white Rewards starts in (HeroSkyMotion). */}
      <div className="hero__flood" aria-hidden="true" />
      <div className="hero__mist" aria-hidden="true" />
      <HeroSkyMotion />
    </section>
  );
}
