import type { CSSProperties, ReactNode } from 'react';
import { SOLUTION_CARDS } from '@/lib/homeCopy';
import { storyLayout } from '@/lib/story';
import { wheelItems } from '@/lib/wheel';
import { StoryMeter } from './StoryMeter';
import { StoryMotion } from './StoryMotion';

const LAYOUT = storyLayout(wheelItems().length, SOLUTION_CARDS.length);

/**
 * What we sell and Our solution on one stage (round 56, Design 1, Bob approved it on 2026-11-16 over a 3D walk through
 * the store): one track as long as the beats (--len screens, lib/story) and one held screen in it, with no cut between
 * the two sections. Wheel and Solution keep their own markup and copy; while the stage holds (StoryMotion sets
 * data-held where lib/story's SCENE_MEDIA matches) their parts are laid into this screen's grid (story.css): the
 * heading on the left the whole way, the names, the sentence and the promises on the right. The deep green and the
 * soft warm light are layers behind them. Without it, the two sections stand one after the other, still. It slides up
 * over the first view as What we sell did (.cover, .sell). #products is its top.
 */
export function Story({ children }: { children: ReactNode }) {
  return (
    <div id="products" className="sell story" style={{ '--len': LAYOUT.total } as CSSProperties}>
      <div className="story__pin">
        <span className="story__deep" aria-hidden="true" />
        <span className="story__glow" aria-hidden="true" />
        {children}
        <StoryMeter ranges={LAYOUT.ranges} promises={LAYOUT.promises} />
      </div>
      <StoryMotion />
    </div>
  );
}
