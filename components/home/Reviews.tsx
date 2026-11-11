'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from '@phosphor-icons/react';
import { Words } from '@/components/ui/Split';
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL, REVIEWS } from '@/lib/reviews';

/** The reviews three times round the wheel, so it can turn for ever without a gap. */
const COPIES = 3;
const RING = Array.from({ length: COPIES }, () => REVIEWS).flat();
const N = RING.length;
/** Degrees between two cards on the wheel, and the whole wheel's span. */
const STEP = 13;
const SPAN = N * STEP;
/** Degrees a second the wheel turns by itself. */
const DRIFT = 3.2;

/** An angle folded into the window -SPAN/2 .. SPAN/2. */
const fold = (a: number) => ((((a + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2;

/**
 * What customers say, in their own words, from Google (lib/reviews), on a wheel after squared-media's arc, made to move
 * (Bob, round 13): the cards turn slowly and endlessly round a point far below, fading in at one edge and out at the
 * other; the one passing the middle stands upright and lights. Grab and throw it, and it glides on and settles; point
 * at it and it slows to a stop on the nearest card; click a card, the arrows or the buttons to bring one to the middle.
 * Reduced motion: it holds still and moves only when asked, without gliding.
 */
export function Reviews() {
  const arc = useRef<HTMLDivElement>(null);
  const turn = useRef<(by: number) => void>(() => {});
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = arc.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.review'));
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = { angle: 0, speed: calm ? 0 : DRIFT, fling: 0 };
    let hovering = false;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let nearest = -1;
    let snap: gsap.core.Tween | null = null;

    const paint = () => {
      let best = 0;
      let bestA = Infinity;
      cards.forEach((c, i) => {
        const a = fold(i * STEP + s.angle);
        const d = Math.abs(a);
        c.style.transform = `rotate(${a.toFixed(2)}deg)`;
        c.style.opacity = String(gsap.utils.clamp(0, 1, 1 - (d - 16) / 26));
        c.style.zIndex = String(100 - Math.round(d));
        if (d < bestA) {
          bestA = d;
          best = i;
        }
      });
      if (best !== nearest) {
        cards[nearest]?.removeAttribute('data-at');
        cards[best].setAttribute('data-at', '');
        nearest = best;
        setAt(best % REVIEWS.length);
      }
    };

    // The angle that puts the card nearest to `angle` exactly in the middle.
    const centred = (angle: number) => Math.round(angle / STEP) * STEP;
    const glideTo = (target: number) => {
      snap?.kill();
      if (calm) {
        s.angle = target;
        paint();
        return;
      }
      snap = gsap.to(s, { angle: target, duration: 0.9, ease: 'power3.out', onUpdate: paint });
    };
    turn.current = (by: number) => glideTo(centred(s.angle) + by * STEP);

    const tick = (_t: number, dt: number) => {
      if (dragging || snap?.isActive()) return;
      const sec = dt / 1000;
      if (Math.abs(s.fling) > 0.5) {
        s.angle += s.fling * sec;
        s.fling *= Math.pow(0.04, sec);
        if (Math.abs(s.fling) <= 0.5 && hovering) glideTo(centred(s.angle));
      } else if (!hovering && !calm) {
        s.speed += (DRIFT - s.speed) * Math.min(1, sec * 2);
        s.angle -= s.speed * sec;
      }
      paint();
    };
    gsap.ticker.add(tick);
    paint();

    const enter = () => {
      hovering = true;
      if (!dragging && Math.abs(s.fling) <= 0.5) glideTo(centred(s.angle));
    };
    const leave = () => {
      hovering = false;
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      snap?.kill();
      s.fling = 0;
      lastX = e.clientX;
      lastT = performance.now();
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const da = (e.clientX - lastX) * 0.09;
      s.angle += da;
      s.fling = (da / Math.max(1, now - lastT)) * 1000;
      lastX = e.clientX;
      lastT = now;
      paint();
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.releasePointerCapture?.(e.pointerId);
      if (calm || Math.abs(s.fling) < 8) {
        s.fling = 0;
        glideTo(centred(s.angle));
      }
    };
    // A click (not a drag) on a card brings it to the middle.
    const click = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.review');
      if (!card) return;
      const i = cards.indexOf(card);
      const a = fold(i * STEP + s.angle);
      if (Math.abs(a) > 2) glideTo(s.angle - a);
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click);
    return () => {
      gsap.ticker.remove(tick);
      snap?.kill();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click);
    };
  }, []);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') turn.current(-1);
    if (e.key === 'ArrowLeft') turn.current(1);
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

      <div ref={arc} className="reviews__arc" role="region" aria-label="Customer reviews from Google, use the arrow keys to turn" tabIndex={0} onKeyDown={onKey}>
        {RING.map((r, i) => (
          <figure key={i} className="review" aria-hidden={i >= REVIEWS.length || undefined} style={{ '--i': i } as CSSProperties}>
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
                <span className="review__when">{r.when}, on Google</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="reviews__nav">
        <button type="button" className="reviews__btn" aria-label="Previous review" onClick={() => turn.current(1)}>
          <ArrowLeft size={18} weight="bold" aria-hidden="true" />
        </button>
        <span className="reviews__dots" aria-hidden="true">
          {REVIEWS.map((_, i) => (
            <i key={i} data-on={at === i || undefined} />
          ))}
        </span>
        <button type="button" className="reviews__btn reviews__btn--next" aria-label="Next review" onClick={() => turn.current(-1)}>
          <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>
      <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="reviews__google">
        <span className="reviews__score">{GOOGLE_RATING.score.toFixed(1)}</span> out of 5 · {GOOGLE_RATING.count} reviews on Google{' '}
        <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}
