import type { CSSProperties } from 'react';
import { Words } from '@/components/ui/Split';
import { SolutionDeck } from '@/components/home/SolutionDeck';
import { FIRST_VIEW, SOLUTION_CARDS, SOLUTION_KICKER, SOLUTION_SUB, solutionPieces } from '@/lib/homeCopy';
import { cardCount, cardNumber, cardTone, stackTilt } from '@/lib/solutionDeck';

/**
 * Our solution (round 54). The line runs large across the top, "Your home makes **its own power.** / We stand behind
 * it.", rising word by word (data-words, PageMotion), with a short line and Visit the store beside it, as Rewards' top
 * is laid out (Bob: "Line on top"). Under it six tall cards, after Bob's "more simple card design view, something like
 * squared-media where its more cinematic and have animation and seem more like business, do not copy exact": each card
 * only a number, the promise and one plain line, on one of three greens. Design 3, the slide (Bob: "maybe design 3"):
 * on wide screens the section holds still while the cards run across the screen on a strip as the page scrolls, each
 * leaning away from the middle and standing straight as it passes it, with a count and a rule under them. On tablets
 * and phones they stack into a deck, each new card sliding over the last (SolutionDeck, lib/solutionDeck). Reduced
 * motion: the cards in rows, or the deck, still. No people, names or photos (Bob: remove Bob and Chakho).
 */
export function Solution() {
  const n = SOLUTION_CARDS.length;
  return (
    <section id="solution" className="solution" aria-labelledby="solution-title">
      <div className="solution__track">
        <div className="solution__stage">
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
          <div className="solution__deck">
            <ol className="solution__cards">
              {SOLUTION_CARDS.map((c, i) => (
                <li key={c.title} className="solution__slot" style={{ '--i': i, '--lean': `${stackTilt(i)}deg` } as CSSProperties}>
                  <div className={`solution__card solution__card--${cardTone(i)}`}>
                    <span className="solution__num" aria-hidden="true">
                      {cardNumber(i)}
                    </span>
                    <div className="solution__body">
                      <h3 className="solution__title">{c.title}</h3>
                      <p className="solution__text">{c.line}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="solution__meter" aria-hidden="true">
              <span className="solution__count">{cardCount(0, n)}</span>
              <span className="solution__rule">
                <span className="solution__fill" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <SolutionDeck />
    </section>
  );
}
