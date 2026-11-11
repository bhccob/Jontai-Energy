import type { ReactNode } from 'react';
import { SkyVideo } from './SkyVideo';

/**
 * The open-air first view (round 9, nature direction): one green valley in morning mist holds still behind it while it
 * scrolls, and leaves with it (clipped). The still paints first; the moving valley fades in over it (SkyVideo). The
 * light follows the sun over Oranjestad (html[data-daypart], set by SunClock). Phones get a portrait slice.
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
      </div>
      {children}
    </div>
  );
}
