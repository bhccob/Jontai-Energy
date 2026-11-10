'use client';

import { stageBus } from '@/components/stage/stageBus';
import { RANGES } from '@/lib/shots';

/** Where each range's link lands. Security sits in the Lighting and cameras chapter until it has a stop of its own. */
const ANCHOR: Record<string, string> = { security: 'light' };

/**
 * The six ranges on one ruled line along the bottom of the first view. Pointing at a name, or tabbing to it, moves the
 * stage's key light onto that product; following it goes to the range.
 */
export function RangeIndex() {
  const spot = (id: string | null) => () => stageBus.setSpot(id);
  return (
    <nav className="ranges" aria-label="What we sell">
      <ul>
        {RANGES.map((r, i) => (
          <li key={r.id} data-hero style={{ ['--i' as string]: i }}>
            <a href={`#${ANCHOR[r.id] ?? r.id}`} onPointerEnter={spot(r.id)} onPointerLeave={spot(null)} onFocus={spot(r.id)} onBlur={spot(null)}>
              {r.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
