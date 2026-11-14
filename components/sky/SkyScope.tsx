import type { ReactNode } from 'react';
import { SkyVideo } from './SkyVideo';

/**
 * The first view's backdrop (round 12, Bob: the valley and grass made it "cluttered"): the moving valley at the back (the
 * still, then the loop), under a pale morning green that screens it to soft light with the faintest movement. Until
 * round 39 the letters of JONTAI were windows in that green onto the valley; the name is solid ink in the first view now
 * (Hero). Held still behind the first view while it scrolls (sticky), clipped to it. Phones get a portrait slice of the
 * valley.
 */
export function SkyScope({ children }: { children: ReactNode }) {
  return (
    <div className="sky-scope">
      <div className="sky" aria-hidden="true">
        <div className="sky__media">
          <picture>
            <source media="(max-width: 40rem)" srcSet="/sky/valley-green-phone.webp" width={900} height={1468} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="sky__img"
              src="/sky/valley-green-1920.webp"
              srcSet="/sky/valley-green-1920.webp 1920w, /sky/valley-green-3200.webp 3200w"
              sizes="100vw"
              alt=""
              width={1920}
              height={824}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <SkyVideo />
        </div>
        <div className="sky__ink" />
      </div>
      {children}
    </div>
  );
}
