import type { CSSProperties } from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS, dayVars } from '@/lib/islands';
import { QUOTE_ACTION } from '@/lib/quote';
import { ArchipelagoMotion } from './ArchipelagoMotion';
import { IslandWalk } from './IslandWalk';
import { LampSlider } from './LampSlider';

/** Where each island floats around the title in the archipelago: centre in % of the screen, width in vw, and how near
 *  it is (nearer islands move more with the pointer and scatter further). Kept clear of the words in the middle. */
const ISLES: Record<string, { x: number; y: number; w: number; depth: number }> = {
  solar: { x: 13, y: 24, w: 15, depth: 0.8 },
  cooling: { x: 87, y: 22, w: 12.5, depth: 0.5 },
  backup: { x: 10, y: 72, w: 13, depth: 1 },
  light: { x: 74, y: 80, w: 8.5, depth: 0.65 },
  security: { x: 91, y: 64, w: 7.5, depth: 0.45 },
  upstairs: { x: 30, y: 86, w: 11, depth: 0.9 },
};

/**
 * What we sell, in two movements. First an archipelago: the six ranges float as islands around the title on the deep
 * green, lean away from the pointer by their depth, lift and name themselves under it, and take you to their range
 * when picked; scrolled on, they scatter outward and the morning comes up (ArchipelagoMotion). Then the walk through
 * one Aruban day, the air going from the pale mist of the day to the deep green after dark and back (IslandWalk). On
 * phones, with reduced motion or without scripts, the archipelago is a plain index and the islands stack.
 */
export function Islands() {
  return (
    <section id="products" className="islands" aria-labelledby="islands-title">
      <div className="archipelago" data-expand>
        <div className="archipelago__inner">
          <header className="archipelago__head">
            <h2 id="islands-title" className="air-display archipelago__title" data-words>
              <span>
                <Words text="Six ranges," />
              </span>{' '}
              <span>
                <Words text="one store." />
              </span>
            </h2>
            <p className="archipelago__lead" data-reveal>
              One Aruban day, from the morning sun on the panels to the weekend upstairs. Pick an island, or scroll on. Pictures are
              illustrations, not specific stock.
            </p>
          </header>
          <ul className="archipelago__isles">
            {ISLANDS.map((it, i) => {
              const p = ISLES[it.id];
              return (
                <li key={it.id} style={{ '--x': `${p.x}%`, '--y': `${p.y}%`, '--w': p.w, '--i': i } as CSSProperties} data-depth={p.depth}>
                  <a href={`#${it.id}`} className="isle">
                    <span className="isle__float">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/sky/island-${it.image}-700.webp`} alt="" width={it.size[0]} height={it.size[1]} loading="lazy" decoding="async" />
                    </span>
                    <span className="isle__name">{it.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="archipelago__dawn" aria-hidden="true" />
        </div>
        <ArchipelagoMotion />
      </div>

      <div className="islands__rail" style={dayVars(ISLANDS[0].day) as CSSProperties}>
        <div className="islands__air" aria-hidden="true">
          <div className="islands__glow" />
        </div>
        <div className="islands__track">
          {ISLANDS.map((it, i) => (
            <article
              key={it.id}
              id={it.id}
              className="island"
              aria-labelledby={`${it.id}-title`}
              tabIndex={-1}
              data-lamp={it.lamp ? 'true' : undefined}
              style={{ ...dayVars(it.day), ...(it.lamp ? { '--bx': `${it.lamp.x}%`, '--by': `${it.lamp.y}%`, '--br': `${it.lamp.r}%` } : {}) } as CSSProperties}
            >
              <div className="island__text">
                <p className="island__when">
                  <span className="island__count">{String(i + 1).padStart(2, '0')}</span> {it.day.label}
                </p>
                <h3 id={`${it.id}-title`} className="air-display island__name">
                  {it.name}
                </h3>
                <p className="island__line">{it.line}</p>
                {it.lamp && <LampSlider />}
                {it.facts && (
                  <dl className="island__facts">
                    {it.facts.map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd className="figure">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {it.note && <p className="island__note">{it.note}</p>}
                <div className="island__actions">
                  {it.actions.map((a) => (
                    <OpenCategoryButton key={a.panel} id={a.panel} className="textlink">
                      {a.label} <ArrowRight size={18} weight="bold" aria-hidden="true" />
                    </OpenCategoryButton>
                  ))}
                  <a href={`/quote?for=${it.quote}`} className="textlink">
                    {QUOTE_ACTION}
                  </a>
                </div>
              </div>
              <figure className="island__pic" aria-hidden="true">
                <div className="island__float">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/sky/island-${it.image}-1200.webp`}
                    srcSet={`/sky/island-${it.image}-700.webp 700w, /sky/island-${it.image}-1200.webp 1200w`}
                    sizes="(max-width: 60rem) 86vw, 44vw"
                    alt=""
                    width={it.size[0]}
                    height={it.size[1]}
                    loading="lazy"
                    decoding="async"
                  />
                  {it.lamp && (
                    // The bulb's light in the slider's colour: a halo around the glass, the glass itself tinted, a bright core.
                    <span className="lamp">
                      <span className="lamp__halo" />
                      <span className="lamp__glass lamp__glass--tint">
                        <span className="lamp__tint" />
                      </span>
                      <span className="lamp__glass lamp__glass--core">
                        <span className="lamp__core" />
                      </span>
                    </span>
                  )}
                </div>
              </figure>
            </article>
          ))}
        </div>
        <IslandWalk items={ISLANDS.map(({ id, name, day }) => ({ id, name, day }))} />
      </div>
    </section>
  );
}
