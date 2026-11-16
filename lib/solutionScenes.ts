// Our solution, one promise at a time (round 55). Bob: "Our solution section need better design it looks like a game";
// of three mock-ups without cards (public/mockups/r55/options.html) he picked "B. One promise at a time": the section
// holds, the sentence shows first, then each of the six promises fills the screen in turn. The script (SolutionScenes)
// holds it only where SCENE_MEDIA matches; everywhere else the sentence and the six rows stand still (air.css).

/** Where the section holds: motion allowed, and a screen tall enough for a promise set large. */
export const SCENE_MEDIA = '(prefers-reduced-motion: no-preference) and (min-height: 34rem)';

/** A promise's number: 01 to 06. */
export const promiseNumber = (i: number) => String(i + 1).padStart(2, '0');

/**
 * Which scene shows (0, the sentence, to count - 1, the last promise) for how far the held section has scrolled, from
 * 0 to 1. Each scene holds an equal share; the last one holds to the end, and outside the hold the nearer end shows.
 */
export function sceneAt(progress: number, count: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(count - 1, Math.floor(p * count));
}
