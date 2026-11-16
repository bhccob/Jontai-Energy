import type { CSSProperties } from 'react';
import { Words } from '@/components/ui/Split';
import { SolutionScenes } from '@/components/home/SolutionScenes';
import { FIRST_VIEW, SOLUTION_CARDS, SOLUTION_KICKER, SOLUTION_SUB, solutionPieces } from '@/lib/homeCopy';
import { promiseNumber } from '@/lib/solutionScenes';

/**
 * Our solution, one promise at a time (round 55). Bob said the panels "look like a game" (framed cards, icons in
 * circles, outlined numbers, a 02 / 06 bar); of three mock-ups without cards he picked "B. One promise at a time".
 * The section holds on the forest green while the sentence shows first, "Your home makes **its own power.** / We stand
 * behind it.", and then each promise fills the screen in turn, like title cards in a film: its number in narrow mint
 * figures, the promise very large, its one line under it. The six names stand in a column on the right and mark the one
 * shown; the store line and Visit the store sit at the foot. SolutionScenes holds it (lib/solutionScenes); with
 * reduced motion, on short screens or without scripts the sentence and the six rows stand still, all readable. No
 * people, names or photos (Bob: remove Bob and Chakho).
 */
export function Solution() {
  return (
    <section
      id="solution"
      className="solution"
      data-tone="dark"
      aria-labelledby="solution-title"
      style={{ '--scenes': SOLUTION_CARDS.length + 1 } as CSSProperties}
    >
      <div className="solution__track">
        <div className="solution__stage">
          <h2 id="solution-title" className="solution__kick">
            {SOLUTION_KICKER}
          </h2>
          <div className="solution__scenes">
            <div className="solution__open" data-on="true">
              <p className="solution__line" data-words>
                {solutionPieces().map((f) => (
                  <span key={f.text} className={f.key ? 'solution__key' : f.newLine ? 'solution__then' : undefined}>
                    <Words text={f.text} />
                  </span>
                ))}
              </p>
            </div>
            <ol className="solution__promises">
              {SOLUTION_CARDS.map((c, i) => (
                <li key={c.title} className="solution__promise">
                  <span className="solution__num" aria-hidden="true">
                    {promiseNumber(i)}
                  </span>
                  <h3 className="solution__title">{c.title}</h3>
                  <p className="solution__text">{c.line}</p>
                </li>
              ))}
            </ol>
          </div>
          {/* Where you are: the six names, the one shown marked. For the eye only; the promises themselves are read. */}
          <ol className="solution__index" aria-hidden="true">
            {SOLUTION_CARDS.map((c) => (
              <li key={c.title}>{c.title}</li>
            ))}
          </ol>
          <div className="solution__foot">
            <p className="solution__sub">{SOLUTION_SUB}</p>
            <a href="#visit" className="textlink solution__visit">
              {FIRST_VIEW.primary}
            </a>
          </div>
        </div>
      </div>
      <SolutionScenes />
    </section>
  );
}
