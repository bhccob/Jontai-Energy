import { Heart, LightbulbFilament, Lightning, SquaresFour, Tag, Wrench } from '@phosphor-icons/react/dist/ssr';
import { Words } from '@/components/ui/Split';
import { SOLUTION_KICKER, SOLUTION_POINTS, solutionPieces } from '@/lib/homeCopy';
import { SolutionMotion } from './SolutionMotion';

/** One icon for each point, in the points' order. */
const ICONS = [Lightning, Wrench, Tag, SquaresFour, Heart, LightbulbFilament];

/**
 * Our solution (round 54, Bob picked "A. The sentence"; it takes the place of Why Jontai). One paragraph holds the
 * screen and fills in word by word as the page scrolls, the six promises turning bold green; when it is full the six
 * points rise in under it. Each fragment is its own Words unit, so Spanish and Chinese fill in the same way. No people,
 * names or photos (Bob: remove Bob and Chakho).
 */
export function Solution() {
  return (
    <section id="solution" className="solution" aria-labelledby="solution-title">
      <div className="solution__pin">
        <h2 id="solution-title" className="solution__kick">
          {SOLUTION_KICKER}
        </h2>
        <p className="solution__text">
          {solutionPieces().map((f) => (
            <span key={f.text} className={f.key ? 'solution__key' : undefined}>
              <Words text={f.text} />
            </span>
          ))}
        </p>
        <ul className="solution__points">
          {SOLUTION_POINTS.map((p, i) => {
            const Icon = ICONS[i];
            return (
              <li key={p}>
                <Icon size={24} weight="regular" aria-hidden="true" />
                <span>{p}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <SolutionMotion />
    </section>
  );
}
