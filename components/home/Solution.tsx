import { Words } from '@/components/ui/Split';
import { FIRST_VIEW, SOLUTION_CARDS, SOLUTION_KICKER, SOLUTION_SUB, solutionPieces } from '@/lib/homeCopy';

/**
 * Our solution. Round 55: Bob said the panels "look like a game" (framed cards, icons in circles, outlined numbers, a
 * 02 / 06 bar) and picked "B. One promise at a time". Round 56 (Design 1): it shares What we sell's held screen (Story,
 * StoryMotion, lib/story). After the handoff the sentence, "Your home makes **its own power.** We stand behind it.",
 * stands where the wheel was and lights word by word with the scroll; then the six promise names turn on the same wheel
 * (.solution__names, for the eye), each promise's one line under the heading on the left, and the wheel opens into a
 * still list with the store line and Visit the store under it. Its own heading is read once, before the sentence;
 * every promise is read with its line, in order. With reduced motion, on a short screen or without scripts the
 * sentence and the six rows stand still, all readable (air.css). No cards, frames, icons or outlined numbers; no
 * people, names or photos (Bob: remove Bob and Chakho).
 */
export function Solution() {
  return (
    <section id="solution" className="solution" data-tone="dark" aria-labelledby="solution-title">
      <h2 id="solution-title" className="solution__kick">
        {SOLUTION_KICKER}
      </h2>
      <p className="solution__line">
        {solutionPieces().map((f) => (
          <span key={f.text} className={f.key ? 'solution__key' : f.newLine ? 'solution__then' : undefined}>
            <Words text={f.text} />
          </span>
        ))}
      </p>
      {/* The six on the stage's wheel. For the eye only: the promises themselves are read below, each with its line. */}
      <div className="solution__names" aria-hidden="true">
        {SOLUTION_CARDS.map((c) => (
          <span key={c.title} className="sn">
            <span>{c.title}</span>
          </span>
        ))}
      </div>
      <ol className="solution__promises">
        {SOLUTION_CARDS.map((c) => (
          <li key={c.title} className="solution__promise">
            <h3 className="solution__title">{c.title}</h3>
            <p className="solution__text">{c.line}</p>
          </li>
        ))}
      </ol>
      <div className="solution__foot">
        <p className="solution__sub">{SOLUTION_SUB}</p>
        <a href="#visit" className="textlink solution__visit">
          {FIRST_VIEW.primary}
        </a>
      </div>
    </section>
  );
}
