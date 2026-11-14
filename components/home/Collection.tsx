import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS } from '@/lib/islands';
import { contactHref } from '@/lib/message';
import { QUOTE_ACTION } from '@/lib/quote';
import { CollectionMotion } from './CollectionMotion';
import { LampSwitch } from './LampSwitch';
import { ProductRail } from './ProductRail';
import { ProductTile } from './ProductTile';

/**
 * What we sell, laid out like a business's catalogue (round 39, Bob: "more business design and scrolling not too game
 * like"): the title and a few words, then the six ranges one under the other on thin rules. Each range has its number,
 * its name in wide capitals, its line, the figures that matter and its links on the left (they stay in view while its
 * products pass), and its products on the right, two to four (Bob: "add more product like solar street lamp and solar
 * fans"), each in its own rectangle of dark glass (round 20) with its name and line under it, two in view; a range with
 * more slides sideways for the rest (round 40, ProductRail). A product leads to its own page (round 41). The page scrolls normally: no row held for the scroll, no leaning frames, no pointer that follows, only a soft
 * rise as things arrive (CollectionMotion). Lighting keeps its bulb and its two light colours (LampSwitch).
 */
export function Collection() {
  const n = ISLANDS.length;
  return (
    <section id="products" className="collection" aria-labelledby="collection-title">
      <div className="collection__inner">
        <header className="collection__head">
          <div>
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
          </div>
          <div className="collection__intro">
            <p className="collection__lead">
              Solar, backup power, cooling, lighting and security on the ground floor, furniture one flight up. Pictures are
              illustrations, not specific stock.
            </p>
            <a href="/quote" className="collection__all">
              {QUOTE_ACTION}
            </a>
          </div>
        </header>

        <div className="ranges">
          {ISLANDS.map((it, i) => (
            <article
              key={it.id}
              id={it.id}
              className="range"
              aria-labelledby={`${it.id}-title`}
              tabIndex={-1}
              data-lamp={it.lamp ? 'true' : undefined}
            >
              <div className="range__info">
                <p className="range__count">
                  {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </p>
                <h3 id={`${it.id}-title`} className="range__name">
                  {it.name}
                </h3>
                <p className="range__line">{it.line}</p>
                {it.facts && (
                  <dl className="range__facts">
                    {it.facts.map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {it.lamp && <LampSwitch />}
                {it.note && <p className="range__note">{it.note}</p>}
                <div className="range__actions">
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
              {it.products.length > 2 ? (
                // More than two (round 40): two in view, the rest scroll sideways (ProductRail).
                <ProductRail count={it.products.length} labelledBy={`${it.id}-title`}>
                  {it.products.map((p) => (
                    <li key={p.id} className="product" data-bulb={p.bulb || undefined}>
                      <ProductTile p={p} />
                    </li>
                  ))}
                </ProductRail>
              ) : (
                <ul className="range__products" aria-labelledby={`${it.id}-title`}>
                  {it.products.map((p) => (
                    <li key={p.id} className="product" data-bulb={p.bulb || undefined}>
                      <ProductTile p={p} />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}

          {/* Anything outside the six (Bob, round 23: "other" in the ranges): a row of its own, words only. */}
          <article id="other" className="range range--other" aria-labelledby="other-title" tabIndex={-1}>
            <div className="range__info">
              <p className="range__count">+ / {String(n).padStart(2, '0')}</p>
              <h3 id="other-title" className="range__name">
                Other
              </h3>
            </div>
            <div className="range__other">
              <p className="range__line">Looking for something that is not one of these six? Ask us, and a person at the store tells you what is in stock.</p>
              <div className="range__actions">
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
