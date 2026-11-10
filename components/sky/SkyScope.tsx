import type { ReactNode } from 'react';

/**
 * The open-air part of the home page (round 9, nature direction): one sky holds still behind these sections while
 * they scroll over it, and leaves with them (clipped, as the stage was). Phones get a portrait slice of the same sky.
 */
export function SkyScope({ children }: { children: ReactNode }) {
  return (
    <div className="sky-scope">
      <div className="sky" aria-hidden="true">
        <picture>
          <source media="(max-width: 40rem)" srcSet="/sky/sky-day-phone.webp" width={900} height={1468} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="sky__img"
            src="/sky/sky-day-1920.webp"
            srcSet="/sky/sky-day-1920.webp 1920w, /sky/sky-day-3200.webp 3200w"
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
