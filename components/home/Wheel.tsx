import type { CSSProperties } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS, PRODUCTS, hasPicture, shownIn, type Island, type Pictured } from '@/lib/islands';
import { WHEEL_COPY } from '@/lib/homeCopy';
import { contactHref } from '@/lib/message';
import { WHEEL_PICKS, nameParts, rangeHref, restProgress } from '@/lib/wheel';
import { RangePicture } from '@/components/products/RangePicture';
import { WheelMotion } from './WheelMotion';

const N = ISLANDS.length;
const two = (n: number) => String(n).padStart(2, '0');
const SIZES = '(max-width: 47.5rem) 84vw, 46vw';

/** The product that stands for a range. */
function pickOf(range: Island): Pictured {
  const p = PRODUCTS.find((x) => x.id === WHEEL_PICKS[range.id]);
  if (!p || !hasPicture(p)) throw new Error(`No pictured pick for ${range.id}`);
  return p;
}

/** A range's name, light then bold, translated in the wheel's own place. */
function Name({ name }: { name: string }) {
  const [light, bold] = nameParts(name);
  return (
    <span data-i18n-ctx="wheel">
      {light && <span className="wn__light">{light} </span>}
      <b>{bold}</b>
    </span>
  );
}

/** "See all 9 Solar products": one sentence, so the translator's pattern can reorder it. */
const seeAll = (range: Island) =>
  WHEEL_COPY.seeAll.replace('{0}', String(shownIn(range).length)).replace('{1}', range.name);

/**
 * What we sell (round 54, Bob picked "D. The wheel"): one held screen on deep green. The six range names stand on a drum
 * like a phone's date picker and turn one at a time as the page scrolls, resting on each; one product stands for each
 * range and slides past in step. Each range leads to its products on the All products page three ways: the big button,
 * the picture and the name in front. After Furniture the page lets go into "Every product, one by one." Without
 * scripts, or with reduced motion, the six are still rows instead (wheel.css). The anchors the menu and the footer use
 * (#solar ... #upstairs, #delivery) sit where the wheel rests on each range.
 */
export function Wheel() {
  return (
    <div id="products" className="sell" aria-labelledby="sell-title">
      <header className="sell__head">
        <h2 id="sell-title" className="sell__title" data-words>
          <span>
            <Words text={WHEEL_COPY.title[0]} />
          </span>{' '}
          <b>
            <Words text={WHEEL_COPY.title[1]} />
          </b>
        </h2>
        <p className="sell__line" data-reveal>
          {WHEEL_COPY.line}
        </p>
      </header>

      <section className="wheel" aria-labelledby="sell-title">
        {ISLANDS.map((r, k) => (
          <span key={r.id} id={r.id} className="wheel__anchor" style={{ '--k': k, '--rest': restProgress(k, N) } as CSSProperties} />
        ))}
        <span id="delivery" className="wheel__anchor" style={{ '--k': N - 1, '--rest': restProgress(N - 1, N) } as CSSProperties} />

        {/* The held screen */}
        <div className="wheel__held">
          <div className="wheel__pin">
            <div className="wheel__names">
              <span className="wheel__band" aria-hidden="true" />
              {ISLANDS.map((r, k) => (
                <button key={r.id} type="button" className="wn" data-k={k} data-id={r.id}>
                  <Name name={r.name} />
                </button>
              ))}
            </div>
            <div className="wheel__stage">
              {ISLANDS.map((r, k) => {
                const p = pickOf(r);
                return (
                  <div key={r.id} className={`ws${p.bulb ? ' ws--hang' : ''}`} data-k={k}>
                    <a href={rangeHref(r.id)} aria-label={seeAll(r)}>
                      <span className="ws__fig">
                        <RangePicture p={p} sizes={SIZES} eager={k === 0} />
                        <span className="ws__floor" aria-hidden="true" />
                      </span>
                      <span className="ws__tag" aria-hidden="true">
                        {WHEEL_COPY.hover.replace('{0}', r.name)} <ArrowUpRight size={15} weight="bold" />
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>
            <div className="wheel__feet">
              {ISLANDS.map((r, k) => (
                <div key={r.id} className="wheel__foot" data-k={k} data-on={k === 0}>
                  <a href={rangeHref(r.id)} className="btn wheel__go">
                    <span>{seeAll(r)}</span>
                    <span className="wheel__arrow" aria-hidden="true">
                      <ArrowUpRight size={18} weight="bold" />
                    </span>
                  </a>
                  <span className="wheel__no">
                    <b>{two(k + 1)}</b> / {two(N)}
                  </span>
                  {r.actions?.map((a) => (
                    <OpenCategoryButton key={a.panel} id={a.panel} className="textlink wheel__delivery">
                      {a.label}
                    </OpenCategoryButton>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The same six, still: without scripts or with reduced motion */}
        <ol className="wheel__still">
          {ISLANDS.map((r) => {
            const p = pickOf(r);
            return (
              <li key={r.id} className={`wrow${p.bulb ? ' wrow--hang' : ''}`}>
                <h3 className="wrow__name">
                  <Name name={r.name} />
                </h3>
                <a href={rangeHref(r.id)} className="wrow__pic" aria-label={seeAll(r)}>
                  <RangePicture p={p} sizes={SIZES} />
                </a>
                <a href={rangeHref(r.id)} className="btn wheel__go">
                  <span>{seeAll(r)}</span>
                  <span className="wheel__arrow" aria-hidden="true">
                    <ArrowUpRight size={18} weight="bold" />
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="sell__end">
        <p className="sell__end-title" data-words>
          <span>
            <Words text={WHEEL_COPY.end[0]} />
          </span>{' '}
          <b>
            <Words text={WHEEL_COPY.end[1]} />
          </b>
        </p>
        <a href="/products" className="btn wheel__all">
          {WHEEL_COPY.endButton}
        </a>
        <p className="sell__also">
          {WHEEL_COPY.also} <a href={contactHref('question')}>{WHEEL_COPY.askUs}</a>
          {'.'} <span>{WHEEL_COPY.pictures}</span>
        </p>
      </div>
      <WheelMotion />
    </div>
  );
}
