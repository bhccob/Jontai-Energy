import { pad2 } from '@/lib/story';

const ticks = (n: number, side: string) =>
  Array.from({ length: n }, (_, i) => (
    <span key={`${side}${i}`} className="meter__tick">
      <i />
    </span>
  ));

/**
 * The small count above the line under the heading ("01 / 07", later "01 / 06") and the thin bar at the foot of the
 * stage: seven ticks, a gap, six ticks, each filling as its item passes (Design 1, round 56). Bob removed "a 02 / 06 bar"
 * from Our solution in round 55 because it looked like a game, then approved Design 1 with these in it. They live here
 * alone, so dropping <StoryMeter /> from Story takes both away in one edit; StoryMotion draws them only when they are
 * there. For the eye only.
 */
export function StoryMeter({ ranges, promises }: { ranges: number; promises: number }) {
  return (
    <div className="meter" aria-hidden="true">
      <p className="meter__count">{`01 / ${pad2(ranges)}`}</p>
      <div className="meter__rail">
        {ticks(ranges, 'r')}
        <span className="meter__gap" />
        {ticks(promises, 'p')}
      </div>
    </div>
  );
}
