import type { ReactNode } from 'react';
import { Stage } from './Stage';

/**
 * The night part of the home page: the stage sticks behind these sections while they scroll over it, and leaves with
 * them, so what follows covers nothing. On narrow screens the still picture sits in the flow after the first view.
 */
export function StageScope({ children }: { children: ReactNode }) {
  return (
    <div className="stage-scope night">
      <Stage />
      {children}
    </div>
  );
}
