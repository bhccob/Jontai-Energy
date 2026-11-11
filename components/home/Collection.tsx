import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS } from '@/lib/islands';
import { QUOTE_ACTION } from '@/lib/quote';
import { CollectionMotion } from './CollectionMotion';
import { LampSlider } from './LampSlider';

/** The ranges seen after dark keep a dark frame, so the bulb's light and the camera's night read. */
const NIGHT = new Set(['light', 'security']);

/**
 * What we sell, as a collection after Novair's featured work (Bob, round 12): the title and a few words on the left,
 * then the six ranges as tall frames at staggered heights, each with its number, its name in wide capitals and the
 * figures that matter under it, the way a portfolio lists date, client and format. On wide screens with motion the row
 * holds still and the scroll carries it sideways (CollectionMotion); a frame leans toward the pointer, its picture
 * grows, and a round "View" follows the pointer over it. Picking a frame opens that range. Lighting keeps its bulb
 * and the 2700K to 6500K slider. Elsewhere the frames stack.
 */
export function Collection() {
  const n = ISLANDS.length;
  return (
    <section id="products" className="collection" aria-labelledby="collection-title">
      <div className="collection__pin">
        <div className="collection__track">
          <header className="collection__head">
            <p className="collection__kicker">
              <span>(02)</span> What we sell
            </p>
            <h2 id="collection-title" className="air-display collection__title" data-words>
              <span>
                <Words text="Six ranges," />
              </span>{' '}
              <span>
                <Words text="one store." />
              </span>
            </h2>
            <p className="collection__lead">
              Solar, backup power, cooling, lighting and security on the ground floor, furniture one flight up. Pictures are
              illustrations, not specific stock.
            </p>
            <div className="collection__foot">
              <p className="collection__count">
                Ranges <span>/ {String(n).padStart(2, '0')}</span>
              </p>
              <a href="/quote" className="collection__all">
                {QUOTE_ACTION} <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </header>

          {ISLANDS.map((it, i) => (
            <article
              key={it.id}
              id={it.id}
              className="piece"
              aria-labelledby={`${it.id}-title`}
              tabIndex={-1}
              data-night={NIGHT.has(it.id) || undefined}
              data-lamp={it.lamp ? 'true' : undefined}
              style={{ '--i': i, ...(it.lamp ? { '--bx': `${it.lamp.x}%`, '--by': `${it.lamp.y}%`, '--br': `${it.lamp.r}%` } : {}) } as CSSProperties}
            >
              <div className="piece__frame">
                <span className="piece__count">
                  {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </span>
                <OpenCategoryButton id={it.actions[0].panel} className="piece__open">
                  <span className="visually-hidden">{it.actions[0].label}</span>
                  <span className="piece__float" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/sky/island-${it.image}-1200.webp`}
                      srcSet={`/sky/island-${it.image}-700.webp 700w, /sky/island-${it.image}-1200.webp 1200w`}
                      sizes="(max-width: 60rem) 80vw, 26vw"
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
                  </span>
                </OpenCategoryButton>
              </div>
              <div className="piece__meta">
                <h3 id={`${it.id}-title`} className="piece__name">
                  {it.name}
                </h3>
                <p className="piece__line">{it.line}</p>
                {it.facts && (
                  <dl className="piece__facts">
                    {it.facts.map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {it.lamp && <LampSlider />}
                {it.note && <p className="piece__note">{it.note}</p>}
                <div className="piece__actions">
                  {it.actions.map((a) => (
                    <OpenCategoryButton key={a.panel} id={a.panel} className="textlink">
                      {a.label} <ArrowRight size={16} weight="bold" aria-hidden="true" />
                    </OpenCategoryButton>
                  ))}
                  <a href={`/quote?for=${it.quote}`} className="textlink">
                    {QUOTE_ACTION}
                  </a>
                </div>
              </div>
            </article>
          ))}

          <a href="/quote" className="collection__end">
            <span className="collection__ring" aria-hidden="true">
              <ArrowUpRight size={26} weight="light" />
            </span>
            <span className="collection__end-text">
              Ask about
              <br />
              any range
            </span>
          </a>
        </div>
      </div>
      <CollectionMotion />
    </section>
  );
}
