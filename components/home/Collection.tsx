import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS, OTHERS, shownIn } from '@/lib/islands';
import { contactHref } from '@/lib/message';
import { QUOTE_ACTION } from '@/lib/quote';
import { CollectionMotion } from './CollectionMotion';
import { RangeProducts } from './RangeProducts';

/**
 * What we sell, laid out like a business's catalogue (round 39, Bob: "more business design and scrolling not too game
 * like"): the title and a few words, then the six ranges one under the other on thin rules. Each range has its number,
 * its name in wide capitals, its line, the figures that matter and its links on the left (they stay in view while its
 * products pass), and its products on the right, two to four (Bob: "add more product like solar street lamp and solar
 * fans"), each in its own rectangle of dark glass (round 20) with its name and line under it, two in view; a range with
 * more slides sideways for the rest (round 40, ProductRail). A product leads to its own page (round 41). The page scrolls normally: no row held for the scroll, no leaning frames, no pointer that follows, only a soft
 * rise as things arrive (CollectionMotion). The bulb hangs from the top of its frame.
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
            >
              <div className="range__info">
                <p className="range__count">
                  {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </p>
                <h3 id={`${it.id}-title`} className="range__name">
                  {it.name}
                </h3>
                {/* Broad, about the range (round 44): what a product is, its figures and its model are on its page. */}
                <p className="range__line">{it.line}</p>
                {it.note && <p className="range__note">{it.note}</p>}
                <div className="range__actions">
                  {it.actions?.map((a) => (
                    <OpenCategoryButton key={a.panel} id={a.panel} className="textlink">
                      {a.label}
                    </OpenCategoryButton>
                  ))}
                  <a href={`/quote?for=${it.quote}`} className="textlink">
                    {QUOTE_ACTION}
                  </a>
                </div>
              </div>
              {/* Two in view, more sliding sideways (round 40); any without a picture yet as words under them. */}
              <RangeProducts products={shownIn(it)} labelledBy={`${it.id}-title`} />
            </article>
          ))}

          {/* Others (round 23, a row of its own; round 51, Bob: "put \"others\" SD cards ... small solar lights, solar door
              bells, wifi mesh - dont need to use pics"): what we sell outside the six as a ruled list of words, then a
              way to ask for anything else. */}
          <article id="other" className="range range--other" aria-labelledby="other-title" tabIndex={-1}>
            <div className="range__info">
              <p className="range__count">+ / {String(n).padStart(2, '0')}</p>
              <h3 id="other-title" className="range__name">
                Others
              </h3>
              <p className="range__line">Smaller things we sell, and anything else you ask us for.</p>
            </div>
            <div className="range__other">
              <ul className="others" aria-labelledby="other-title">
                {OTHERS.map((o) => (
                  <li key={o.name} className="others__item">
                    <span className="others__name">{o.name}</span>
                    <span className="others__line">{o.line}</span>
                  </li>
                ))}
              </ul>
              <p className="range__line">Looking for something that is not listed? Ask us, and a person at the store tells you what is in stock.</p>
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
