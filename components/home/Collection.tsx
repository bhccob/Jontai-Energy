import type { CSSProperties } from 'react';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS } from '@/lib/islands';
import { LAMP_STILLS } from '@/lib/kelvin';
import { contactHref } from '@/lib/message';
import { QUOTE_ACTION } from '@/lib/quote';
import { CollectionMotion } from './CollectionMotion';
import { LampSlider } from './LampSlider';

/** How wide a picture shows: most of the width when the ranges stack, about a quarter of the screen in the row. */
const SIZES = '(max-width: 60rem) 76vw, 22vw';

/**
 * What we sell, as a collection after Novair's featured work (Bob, round 12): the title and a few words on the left,
 * then the six ranges, each in an upright frame of dark glass (round 20), small and at its own height (round 19), with
 * its number, its name in wide capitals and the figures that matter beside it, the way a portfolio lists date, client
 * and format. On wide screens with motion the row holds still and the scroll carries it sideways (CollectionMotion); a
 * frame leans toward the pointer, its island grows, and a round "View" follows the pointer. Picking one opens it.
 * Lighting keeps its bulb and the 2700K to 6500K slider. Elsewhere the ranges stack, taking turns left and right.
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
                {QUOTE_ACTION}
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
              data-lamp={it.lamp ? 'true' : undefined}
              style={{ '--i': i } as CSSProperties}
            >
              <div className="piece__frame">
                <OpenCategoryButton id={it.actions[0].panel} className="piece__open">
                  <span className="visually-hidden">{it.actions[0].label}</span>
                  <span className="piece__float" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/sky/island-${it.image}-1200.webp`}
                      srcSet={`/sky/island-${it.image}-700.webp 700w, /sky/island-${it.image}-1200.webp 1200w`}
                      sizes={SIZES}
                      alt=""
                      width={it.size[0]}
                      height={it.size[1]}
                      loading="lazy"
                      decoding="async"
                    />
                    {it.lamp && (
                      // The bulb lit from inside at five temperatures, baked from the photo (tools/sky/bulb-light.mjs),
                      // stacked over the picture; the slider fades in the warmer or cooler ones (--lamp-n, LampSlider).
                      // Under them, its halo in the air and on the post, painted in the slider's colour (--glow).
                      <span className="lamp">
                        <span className="lamp__halo" />
                        {LAMP_STILLS.map((k, j) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={k}
                            className="lamp__k"
                            src={`/sky/island-${it.image}-k${k}-1200.webp`}
                            srcSet={`/sky/island-${it.image}-k${k}-700.webp 700w, /sky/island-${it.image}-k${k}-1200.webp 1200w`}
                            sizes={SIZES}
                            alt=""
                            width={it.size[0]}
                            height={it.size[1]}
                            loading="lazy"
                            decoding="async"
                            style={j === 0 ? undefined : { opacity: `var(--lamp-${j}, 0)` }}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                </OpenCategoryButton>
              </div>
              <div className="piece__meta">
                <p className="piece__count">
                  {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </p>
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
                      {a.label}
                    </OpenCategoryButton>
                  ))}
                  <a href={`/quote?for=${it.quote}`} className="textlink">
                    {QUOTE_ACTION}
                  </a>
                </div>
              </div>
            </article>
          ))}

          {/* Anything outside the six (Bob, round 23: "other" in the ranges): its own frame, a plus in place of a picture. */}
          <article id="other" className="piece piece--other" aria-labelledby="other-title" tabIndex={-1} style={{ '--i': n } as CSSProperties}>
            <div className="piece__frame">
              <a href={contactHref('question')} className="piece__open piece__open--other">
                <span className="visually-hidden">Ask about something else</span>
                <span className="piece__plus" aria-hidden="true">
                  +
                </span>
              </a>
            </div>
            <div className="piece__meta">
              <p className="piece__count">+ / {String(n).padStart(2, '0')}</p>
              <h3 id="other-title" className="piece__name">
                Other
              </h3>
              <p className="piece__line">Looking for something that is not one of these six? Ask us, and a person at the store tells you what is in stock.</p>
              <div className="piece__actions">
                <a href={contactHref('question')} className="textlink">
                  Ask us
                </a>
                <a href="/quote?for=other" className="textlink">
                  {QUOTE_ACTION}
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
      <CollectionMotion />
    </section>
  );
}
