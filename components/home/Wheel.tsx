import type { CSSProperties } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { WHEEL_COPY } from '@/lib/homeCopy';
import { nameParts, restProgress, wheelGhosts, wheelItems, type WheelItem } from '@/lib/wheel';
import { WheelMotion } from './WheelMotion';

const ITEMS = wheelItems();
const N = ITEMS.length;

/** A name, light then bold, translated in the wheel's own place. The space sits inside the light part, so Chinese can
 *  drop it. */
function Name({ name }: { name: string }) {
  const [light, bold] = nameParts(name);
  return (
    <span data-i18n-ctx="wheel">
      {light && <span className="wn__light">{`${light} `}</span>}
      <b>{bold}</b>
    </span>
  );
}

/** "See Solar products" and a small arrow: all the foot says (Bob: "just have to say see .... products"). */
function Go({ item }: { item: WheelItem }) {
  return (
    <a href={item.href} className="wheel__go">
      <span>{item.label}</span>
      <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
    </a>
  );
}

/**
 * What we sell (round 54, Bob picked "D. The wheel", then: "maybe six ranges products should not include the image? and
 * include others"): one held screen on deep green where the names of the six ranges and Others stand large on a drum,
 * like a phone's date picker, and turn one at a time as the page scrolls, resting on each. The name in front leads to
 * its products on the All products page (an arrow beside it says so), as does "See ... products" under it. One deep
 * green, no colour per range (Bob: "i dont want so much color pallete"). After Others the page lets go into "Every
 * product, one by one." Without scripts, or with reduced motion, they are still rows instead (wheel.css). The anchors
 * the menu and the footer use (#solar ... #upstairs, #delivery, #others) sit where the wheel rests on each; how
 * delivery works opens from Furniture's products on the All products page.
 */
export function Wheel() {
  return (
    <div id="products" className="sell">
      {/* "A. The big number" (Bob: "6+ ranges, one store gotta be more prominent and creative shown"): the 6 the height
          of the screen with a mint +, counted up as it comes in (WheelMotion), and the words beside it. The heading
          itself says "6+ ranges. One store." to a screen reader; the big figure is for the eye. */}
      <header className="sell__head">
        <span className="sell__big" aria-hidden="true">
          <span className="sell__num">{WHEEL_COPY.count}</span>
          <span className="sell__plus">+</span>
        </span>
        <h2 id="sell-title" className="sell__title">
          <span className="sell__sr">{`${WHEEL_COPY.count}+ `}</span>
          <span className="sell__ranges" data-words>
            <Words text={WHEEL_COPY.ranges} />
          </span>{' '}
          <b className="sell__store" data-words>
            <Words text={WHEEL_COPY.title[1]} />
          </b>
        </h2>
        <p className="sell__line" data-reveal>
          {WHEEL_COPY.line}
        </p>
      </header>

      <section className="wheel" aria-labelledby="sell-title" style={{ '--n': N } as CSSProperties}>
        {ITEMS.map((it, k) => (
          <span key={it.id} id={it.id} className="wheel__anchor" style={{ '--k': k, '--rest': restProgress(k, N) } as CSSProperties} />
        ))}
        <span id="delivery" className="wheel__anchor" style={{ '--k': N - 2, '--rest': restProgress(N - 2, N) } as CSSProperties} />

        {/* The held screen */}
        <div className="wheel__held">
          <div className="wheel__pin">
            {/* Two of the range in front's own products, faint, either side of its name, changing as the wheel turns
                (Bob: "a transparent or not very visible placed products for each product when scroll"; WheelMotion). */}
            <div className="wheel__ghosts" aria-hidden="true">
              {ITEMS.map((it, k) => {
                const ghosts = wheelGhosts(it.id);
                if (!ghosts.length) return null;
                return (
                  <div key={it.id} className="wheel__ghost" data-k={k}>
                    {ghosts.map((g) => {
                      const [small, large] = g.files ?? [640, 1200];
                      const src = (w: number) => `/sky/range-${g.image}-${w}.webp`;
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={g.id}
                          src={src(large)}
                          srcSet={`${src(small)} ${small}w, ${src(large)} ${large}w`}
                          sizes="(max-width: 40rem) 40vw, 30vw"
                          width={g.size[0]}
                          height={g.size[1]}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="wheel__names">
              <span className="wheel__band" aria-hidden="true" />
              {ITEMS.map((it, k) => (
                <button key={it.id} type="button" className="wn" data-k={k} data-id={it.id} data-href={it.href}>
                  <Name name={it.name} />
                  {/* The name in front leads to its products: this arrow says so (Bob: "something indicating that its
                      clickable"). */}
                  <span className="wn__go" aria-hidden="true">
                    <ArrowUpRight weight="bold" />
                  </span>
                </button>
              ))}
            </div>
            <div className="wheel__feet">
              {ITEMS.map((it, k) => (
                <div key={it.id} className="wheel__foot" data-k={k} data-on={k === 0}>
                  <Go item={it} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The same seven, still: without scripts or with reduced motion */}
        <ol className="wheel__still">
          {ITEMS.map((it) => (
            <li key={it.id} className="wrow">
              <h3 className="wrow__name">
                <Name name={it.name} />
              </h3>
              <Go item={it} />
            </li>
          ))}
        </ol>
      </section>

      <div className="sell__end">
        <p className="sell__end-title" data-words>
          <span>
            <Words text={`${WHEEL_COPY.end[0]} `} />
          </span>
          <b>
            <Words text={WHEEL_COPY.end[1]} />
          </b>
        </p>
        <a href="/products" className="btn wheel__all">
          {WHEEL_COPY.endButton}
        </a>
      </div>
      <WheelMotion />
    </div>
  );
}
