import type { CSSProperties } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { Words } from '@/components/ui/Split';
import { ISLANDS } from '@/lib/islands';
import { WHEEL_COPY } from '@/lib/homeCopy';
import { nameParts, restProgress, wheelItems, type WheelItem } from '@/lib/wheel';
import { WheelMotion } from './WheelMotion';

const ITEMS = wheelItems();
const N = ITEMS.length;
const two = (n: number) => String(n).padStart(2, '0');
/** The panels a range opens (Furniture: how delivery works). */
const actionsOf = (id: string) => ISLANDS.find((r) => r.id === id)?.actions ?? [];

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

/** "See all 9 Solar products", and for Furniture how delivery works. */
function Acts({ item }: { item: WheelItem }) {
  return (
    <>
      <a href={item.href} className="btn wheel__go">
        <span>{item.label}</span>
        <span className="wheel__arrow" aria-hidden="true">
          <ArrowUpRight size={18} weight="bold" />
        </span>
      </a>
      {actionsOf(item.id).map((a) => (
        <OpenCategoryButton key={a.panel} id={a.panel} className="textlink wheel__delivery">
          {a.label}
        </OpenCategoryButton>
      ))}
    </>
  );
}

/**
 * What we sell (round 54, Bob picked "D. The wheel", then: "maybe six ranges products should not include the image? and
 * include others"): one held screen on deep green where the names of the six ranges and Others stand large on a drum,
 * like a phone's date picker, and turn one at a time as the page scrolls, resting on each. The name in front leads to
 * its products on the All products page, as does the button under it. After Others the page lets go into "Every
 * product, one by one." Without scripts, or with reduced motion, they are still rows instead (wheel.css). The anchors
 * the menu and the footer use (#solar ... #upstairs, #delivery, #others) sit where the wheel rests on each.
 */
export function Wheel() {
  return (
    <div id="products" className="sell">
      <header className="sell__head">
        <h2 id="sell-title" className="sell__title" data-words>
          <span>
            <Words text={`${WHEEL_COPY.title[0]} `} />
          </span>
          <b>
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
            <div className="wheel__names">
              <span className="wheel__band" aria-hidden="true" />
              {ITEMS.map((it, k) => (
                <button key={it.id} type="button" className="wn" data-k={k} data-id={it.id} data-href={it.href}>
                  <Name name={it.name} />
                </button>
              ))}
            </div>
            <div className="wheel__feet">
              {ITEMS.map((it, k) => (
                <div key={it.id} className="wheel__foot" data-k={k} data-on={k === 0}>
                  <Acts item={it} />
                  <span className="wheel__no">
                    <b>{two(k + 1)}</b>
                    {` / ${two(N)}`}
                  </span>
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
              <div className="wrow__acts">
                <Acts item={it} />
              </div>
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
