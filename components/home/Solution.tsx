import type { CSSProperties } from 'react';
import { Heart, LightbulbFilament, Lightning, SquaresFour, Tag, Wrench } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { FIRST_VIEW, SOLUTION_CARDS, SOLUTION_KICKER, SOLUTION_SUB, solutionPieces } from '@/lib/homeCopy';

/** One icon for each promise, in the cards' order. */
const ICONS = [Lightning, Wrench, Tag, SquaresFour, Heart, LightbulbFilament];

/**
 * Our solution (round 54). Bob picked the simple cards of direction C ("C is looking best but iwant more simple
 * cards"), then, with the line held beside them "not quite right", the line on top and the cards in a 3 x 2 grid. The
 * line runs large across the top on two lines, "Your home makes **its own power.** / We stand behind it.", rising word
 * by word (data-words, PageMotion), with a short line and Visit the store beside it, as Rewards' top is laid out. Under
 * it six simple cards, three to a row: a small icon, the promise and one plain line, on a soft green ground with small
 * corners, no numbers and nothing to press; each row fades up in turn (data-reveal). Two to a row on tablets, one on
 * phones. No people, names or photos (Bob: remove Bob and Chakho).
 */
export function Solution() {
  return (
    <section id="solution" className="solution" aria-labelledby="solution-title">
      <div className="solution__head">
        <h2 id="solution-title" className="solution__kick">
          {SOLUTION_KICKER}
        </h2>
        <p className="solution__line" data-words>
          {solutionPieces().map((f) => (
            <span key={f.text} className={f.key ? 'solution__key' : f.newLine ? 'solution__then' : undefined}>
              <Words text={f.text} />
            </span>
          ))}
        </p>
        <div className="solution__aside" data-reveal>
          <p className="solution__sub">{SOLUTION_SUB}</p>
          <a href="#visit" className="textlink solution__visit">
            {FIRST_VIEW.primary}
          </a>
        </div>
      </div>
      <ul className="solution__cards">
        {SOLUTION_CARDS.map((c, i) => {
          const Icon = ICONS[i];
          return (
            <li key={c.title} className="solution__card" data-reveal style={{ '--i': i % 3 } as CSSProperties}>
              <Icon size={30} weight="regular" aria-hidden="true" />
              <h3 className="solution__title">{c.title}</h3>
              <p className="solution__text">{c.line}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
