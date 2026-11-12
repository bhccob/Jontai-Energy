import type { CSSProperties } from 'react';
import { HOME_COPY } from '@/lib/products';
import { HeroSkyMotion } from './HeroSkyMotion';
import { SunClock } from './SunClock';

/** When each part of the entrance starts, in ms (sky.css, hero-rise). */
const at = (d: number) => ({ '--d': d }) as CSSProperties;
/**
 * Where the camera flies in as the first view scrolls away (HeroSkyMotion), in % of the main island's picture: the
 * Jontai loyalty card, so the flight goes into the card and comes out in Rewards (round 28). Every island grows from
 * this one point, so nothing slides (Bob, round 26: "so the island dont move").
 */
const ZOOM = { x: 60.5, y: 24.7 };

/**
 * The festoon bulbs behind the set that show, in % of the main island's picture (round 29); each glows when the lights
 * come on. The three behind the card are left dark, so no glow spills over it.
 */
const BULBS = [
  [36.5, 13],
  [40, 14.1],
  [43.2, 14.8],
  [46.1, 15.3],
  [84.2, 14.8],
  [86.8, 14.1],
  [89.3, 13],
] as const;

/**
 * The small islands round the main one (Bob, round 26: "more sub floating islands"), cut from one picture by
 * tools/sky/hero-islands.mjs. `depth` runs from far (0) to near (1): how far each one drifts with the pointer. Placed
 * in sky.css (.hero__small--<name>).
 */
const SMALL = [
  { name: 'lantern', height: 656, depth: 0.35 },
  { name: 'tree', height: 713, depth: 0.55 },
  { name: 'meadow', height: 550, depth: 0.8 },
  { name: 'chair', height: 589, depth: 1 },
] as const;

/**
 * The first view, kept to a few things (Bob, rounds 11 and 12: "too cluttered"): the live line about the sun over the
 * store, the owner's line in thin wide capitals, one sentence that says what the store is, one way in. Under it an
 * island of pale limestone and grass floats in front of JONTAI, whose letters show the moving valley (SkyScope): a
 * small solar panel, a floodlight and a camera, each on its own low stand, round the Jontai loyalty card, with festoon
 * lights behind, Aruban grass, an aloe and two small boulders (rounds 28 and 29); the floodlight and the bulbs power on
 * once the islands have arrived. Four small islands float round it at different depths (round 26). On wide screens
 * the scroll is one camera moving in (HeroSkyMotion): the islands settle and grow from one point, the card, the sky's
 * own white mist rises through them, and Rewards comes up out of the white.
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
            {hero.primary}
          </a>
          <a href="#products" className="hero__more">
            {hero.secondary}
          </a>
        </div>
      </div>

      <div className="hero__stage">
        <figure className="hero__island" aria-hidden="true" data-zoom-x={ZOOM.x} data-zoom-y={ZOOM.y}>
          <div className="hero__float">
            <div className="hero__lean">
              {/* Sized for the camera's move in, so it stays sharp as it grows (HeroSkyMotion). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero__day"
                src="/sky/island-set-1200.webp"
                srcSet="/sky/island-set-700.webp 700w, /sky/island-set-1200.webp 1200w"
                sizes="(max-width: 60rem) 78vw, 64vw"
                alt=""
                width={1200}
                height={981}
                fetchPriority="high"
                decoding="async"
              />
              {/* The lights, powering on (sky.css): the floodlight's LED face, the glow round it, the light it throws
                  down onto the card and the grass, and the festoon bulbs one after another. */}
              <span className="hero__beam" />
              <span className="hero__pool" />
              <span className="hero__halo" />
              <span className="hero__led" />
              {BULBS.map(([x, y], i) => (
                <span key={i} className="hero__bulb" style={{ left: `${x}%`, top: `${y}%`, '--i': i } as CSSProperties} />
              ))}
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
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* The sky's own white mist, which rises as the camera moves in; Rewards comes up out of it (HeroSkyMotion). */}
      <div className="hero__mist" aria-hidden="true" />
      <HeroSkyMotion />
    </section>
  );
}
