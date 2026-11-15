import { Heart, LightbulbFilament, Lightning, SquaresFour, Tag, Wrench } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { FIRST_VIEW, SOLUTION_CARDS, SOLUTION_KICKER, SOLUTION_SUB, solutionPieces } from '@/lib/homeCopy';

/** One icon for each promise, in the cards' order. */
const ICONS = [Lightning, Wrench, Tag, SquaresFour, Heart, LightbulbFilament];

/**
 * Our solution (round 54, direction C; Bob: "C is looking best but iwant more simple cards"). One line, "Your home
 * makes its own power. We stand behind it.", stays in view on the left with a short line under it and Visit the store,
 * while six simple cards pass on the right: a small icon, the promise and one plain line, on a soft green ground with
 * small corners, no numbers and nothing to press. The line rises word by word (data-words, PageMotion) and each card
 * fades up as it comes into view (data-reveal). On phones the line sits above the cards. No people, names or photos
 * (Bob: remove Bob and Chakho).
 */
export function Solution() {
  return (
    <section id="solution" className="solution" aria-labelledby="solution-title">
      <div className="solution__body">
        <div className="solution__side">
          <h2 id="solution-title" className="solution__kick">
            {SOLUTION_KICKER}
          </h2>
          <p className="solution__line" data-words>
            {solutionPieces().map((f) => (
              <span key={f.text} className={f.key ? 'solution__key' : undefined}>
                <Words text={f.text} />
              </span>
            ))}
          </p>
          <p className="solution__sub">{SOLUTION_SUB}</p>
          <a href="#visit" className="textlink solution__visit">
            {FIRST_VIEW.primary}
          </a>
        </div>
        <ul className="solution__cards">
          {SOLUTION_CARDS.map((c, i) => {
            const Icon = ICONS[i];
            return (
              <li key={c.title} className="solution__card" data-reveal>
                <Icon size={30} weight="regular" aria-hidden="true" />
                <h3 className="solution__title">{c.title}</h3>
                <p className="solution__text">{c.line}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
