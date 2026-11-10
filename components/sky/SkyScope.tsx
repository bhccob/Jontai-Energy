import type { ReactNode } from 'react';

/**
 * The open-air part of the home page (round 9, nature direction): one green valley in morning mist holds still behind
 * these sections while they scroll over it, and leaves with them (clipped). Green is the page's main colour (Bob,
 * 2026-11-10). Phones get a portrait slice of the same valley.
 */
export function SkyScope({ children }: { children: ReactNode }) {
  return (
    <div className="sky-scope">
      <div className="sky" aria-hidden="true">
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
      </div>
      {children}
    </div>
  );
}
