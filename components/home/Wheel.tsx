import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { SOLUTION_CARDS, SOLUTION_KICKER, WHEEL_COPY } from '@/lib/homeCopy';
import { nameParts, wheelItems, type WheelItem } from '@/lib/wheel';

const ITEMS = wheelItems();

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

/** "See all 9 Solar products" and a small arrow (Bob: "just have to say see .... products"). */
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
 * include others"): the names of the six ranges and Others on a drum, like a phone's date picker, turning one at a time
 * as the page scrolls and resting on each. One deep green, no colour per range (Bob: "i dont want so much color
 * pallete"). Round 55, "C. One screen with the wheel": the heading holds on the left, the names turn on the right, and
 * under the heading the range in front says what it is and links to its products.
 *
 * Round 56 (Design 1): 7 ranges, Others the seventh, and What we sell shares one held screen with Our solution (Story,
 * StoryMotion, lib/story). The heading is that screen's left side the whole way: the kicker, the big figure and the
 * word under it each hold a second line that rolls up at the handoff (What we sell to Our solution, 7 to 6, ranges. to
 * promises.), while "One store." stays. After Others the wheel opens into a still list of the seven, and "Every
 * product, one by one." (.sell__end) shows under the heading. Without scripts, with reduced motion or on a short screen
 * the heading stands on top and the seven are still rows, each with its line, then the same band (wheel.css). The
 * menu's and the footer's range links (#solar ... #upstairs, #delivery, #others) land on the still rows, and on the
 * wheel's rest for each while it is held (StoryMotion); how delivery works opens from Furniture's products on the All
 * products page.
 */
export function Wheel() {
  return (
    <section className="wheel" aria-labelledby="sell-title">
      {/* The left of the stage. The heading reads "7 ranges. One store." to a screen reader once; the kicker, the figure
          and the rolling word are for the eye (Our solution has its own heading). */}
      <header className="sell__head">
        <p className="sell__kick roll" aria-hidden="true">
          <span className="roll__strip">
            <span>{WHEEL_COPY.kicker}</span>
            <span>{SOLUTION_KICKER}</span>
          </span>
        </p>
        <span className="sell__big roll" aria-hidden="true">
          <span className="roll__strip">
            <span className="sell__num">{WHEEL_COPY.count}</span>
            <span>{SOLUTION_CARDS.length}</span>
          </span>
        </span>
        <h2 id="sell-title" className="sell__title">
          <span className="sell__sr">{WHEEL_COPY.title[0]}</span>{' '}
          <span className="sell__ranges roll" aria-hidden="true">
            <span className="roll__strip">
              <span>{WHEEL_COPY.ranges}</span>
              <span>{WHEEL_COPY.promises}</span>
            </span>
          </span>{' '}
          <b className="sell__store">{WHEEL_COPY.title[1]}</b>
        </h2>
        <p className="sell__line">{WHEEL_COPY.line}</p>
      </header>

      {/* Under the heading while the wheel turns: what the range in front is, and the way to its products. */}
      <div className="wheel__feet">
        {ITEMS.map((it, k) => (
          <div key={it.id} className="wheel__foot" data-k={k}>
            <p className="wheel__about">{it.line}</p>
            <Go item={it} />
          </div>
        ))}
      </div>

      {/* The drum of names, on the right of the stage. */}
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

      {/* The same seven, still: without scripts, with reduced motion, on a short screen. */}
      <ol className="wheel__still">
        {ITEMS.map((it) => (
          <li key={it.id} id={it.id} className="wrow">
            {it.id === 'upstairs' && <span id="delivery" className="wrow__anchor" />}
            <h3 className="wrow__name">
              <Name name={it.name} />
            </h3>
            <p className="wrow__about">{it.line}</p>
            <Go item={it} />
          </li>
        ))}
      </ol>

      {/* After the seven: a band under the still rows; on the stage, the line under the heading once the wheel has
          opened into its list. */}
      <div className="sell__end">
        <p className="sell__end-title">
          <span>{`${WHEEL_COPY.end[0]} `}</span>
          <b>{WHEEL_COPY.end[1]}</b>
        </p>
        <a href="/products" className="btn wheel__all">
          {WHEEL_COPY.endButton}
        </a>
      </div>
    </section>
  );
}
