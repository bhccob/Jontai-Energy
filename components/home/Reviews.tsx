'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowUpRight, Star } from '@phosphor-icons/react';
import { Words } from '@/components/ui/Split';
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL, REVIEWS } from '@/lib/reviews';

/** Each review shows twice round the arc, so there are always neighbours on both sides. */
const RING = [...REVIEWS, ...REVIEWS];
const N = RING.length;
/** Seconds each review holds the middle before the next comes round, unless someone is reading or pointing. */
const DWELL = 6;

/**
 * What customers say, in their own words, from Google (lib/reviews), on an arc after squared-media's: the review in the
 * middle stands upright, its neighbours lean away down the curve. Previous and next turn the arc, as do the arrow keys
 * and a swipe; it turns by itself every few seconds while no one is pointing at it, never with reduced motion. Only
 * the middle review is read out; the copies round the arc are hidden from assistive tech.
 */
export function Reviews() {
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const drag = useRef<{ x: number } | null>(null);
  const go = useCallback((d: number) => setAt((a) => (a + d + N) % N), []);

  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(() => go(1), DWELL * 1000);
    return () => window.clearTimeout(id);
  }, [at, held, go]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  const down = (e: PointerEvent) => {
    drag.current = { x: e.clientX };
  };
  const up = (e: PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <section id="reviews" className="reviews" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="reviews__title" data-words>
        <span>
          <Words text="What customers say." />
        </span>{' '}
        <span className="soft">
          <Words text="In their own words." />
        </span>
      </h2>

      <div
        className="reviews__arc"
        role="group"
        aria-roledescription="carousel"
        aria-label="Customer reviews from Google"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => {
          setHeld(false);
          drag.current = null;
        }}
        onPointerDown={down}
        onPointerUp={up}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        {RING.map((r, i) => {
          // Where this card sits round the arc: 0 in the middle, negative to the left, positive to the right.
          let o = i - at;
          if (o > N / 2) o -= N;
          if (o < -N / 2) o += N;
          return (
            <figure key={i} className="review" data-at={o === 0 || undefined} aria-hidden={o !== 0} style={{ '--o': o, '--d': Math.abs(o) } as CSSProperties}>
              <div className="review__stars" aria-label={`${r.stars} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} size={16} weight={s < r.stars ? 'fill' : 'regular'} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="review__text">{r.text}</blockquote>
              <figcaption className="review__who">
                <span className="review__initial" aria-hidden="true">
                  {r.name[0]}
                </span>
                <span>
                  <span className="review__name">{r.name}</span>
                  <span className="review__when">
                    {r.when}, on Google
                  </span>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="reviews__nav">
        <button type="button" className="reviews__btn" onClick={() => go(-1)}>
          Previous
        </button>
        <span className="reviews__dots" aria-hidden="true">
          {REVIEWS.map((_, i) => (
            <i key={i} data-on={at % REVIEWS.length === i || undefined} />
          ))}
        </span>
        <button type="button" className="reviews__btn reviews__btn--next" onClick={() => go(1)}>
          Next
        </button>
      </div>
      <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="reviews__google">
        {GOOGLE_RATING.score.toFixed(1)} out of 5 · {GOOGLE_RATING.count} reviews on Google <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}
