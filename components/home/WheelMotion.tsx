'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import { scrollTargets } from '@/components/providers/scrollTargets';
import { WHEEL_TINT, heldPosition, rangeIndexFromHash, restProgress } from '@/lib/wheel';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MOTION = '(prefers-reduced-motion: no-preference)';
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Turns the wheel as the page scrolls (Wheel): the drum of names, the wash of the range's colour, the foot of the range in
 * front, and the name in front marked as current. Clicking a name turns the
 * wheel to it; clicking the name in front opens its products. As What we sell arrives it grows from a rounded card out
 * to the screen's edges. With reduced motion none of this runs and the still rows show instead (wheel.css).
 */
export function WheelMotion() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(() => {
    const sell = document.getElementById('products');
    const wheel = sell?.querySelector<HTMLElement>('.wheel');
    const pin = wheel?.querySelector<HTMLElement>('.wheel__pin');
    if (!sell || !wheel || !pin) return;
    const names = [...wheel.querySelectorAll<HTMLButtonElement>('.wn')];
    const feet = [...wheel.querySelectorAll<HTMLElement>('.wheel__foot')];
    const ids = names.map((n) => n.dataset.id ?? '');
    const n = names.length;

    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      wheel.dataset.held = 'true';
      let front = -1;

      const draw = (progress: number) => {
        const pos = heldPosition(progress, n);
        const phone = window.innerWidth < 760;
        const radius = phone ? 170 : 380;
        const step = phone ? 24 : 19;
        names.forEach((el, k) => {
          const d = k - pos;
          const a = Math.abs(d);
          el.style.visibility = a > 3.3 ? 'hidden' : '';
          el.style.transform = `translateY(-50%) translateZ(${-radius}px) rotateX(${(-d * step).toFixed(3)}deg) translateZ(${radius}px)`;
          el.style.opacity = Math.max(0, 1 - a * 0.34).toFixed(3);
        });
        const i = Math.min(n - 2, Math.floor(pos));
        const t = pos - i;
        const from = WHEEL_TINT[ids[i]];
        const to = WHEEL_TINT[ids[i + 1]];
        if (from && to) pin.style.setProperty('--tint', from.map((c, j) => Math.round(c + (to[j] - c) * t)).join(' '));
        const now = Math.round(pos);
        if (now !== front) {
          front = now;
          feet.forEach((f, k) => (f.dataset.on = String(k === now)));
          names.forEach((b, k) => (k === now ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        }
      };

      const turn = ScrollTrigger.create({
        trigger: wheel,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => draw(st.progress),
        onRefresh: (st) => draw(st.progress),
      });
      draw(turn.progress);

      // What we sell grows out to the screen's edges as it arrives.
      const grow = ScrollTrigger.create({
        trigger: sell,
        start: 'top bottom',
        end: 'top top',
        onUpdate: (st) => {
          const k = 1 - easeOut(st.progress);
          sell.style.setProperty('--sx', `${(k * window.innerWidth * 0.04).toFixed(1)}px`);
          sell.style.setProperty('--sr', `${(k * 44).toFixed(1)}px`);
        },
      });

      // A name turns the wheel to its range; the one in front opens its products.
      const restAt = (k: number) => turn.start + restProgress(k, n) * (turn.end - turn.start);
      const onClick = (e: MouseEvent) => {
        const k = Number((e.currentTarget as HTMLElement).dataset.k);
        if (k === front) {
          window.location.assign((e.currentTarget as HTMLElement).dataset.href ?? '/products');
          return;
        }
        const l = lenisRef.current;
        if (l) l.scrollTo(restAt(k), { duration: 1.4 });
        else window.scrollTo({ top: restAt(k), behavior: 'smooth' });
      };
      names.forEach((b) => b.addEventListener('click', onClick));

      // The menu's and the footer's range links land where the wheel rests on their range: in-page through
      // scrollTargets (SmoothScroll), and from another page once the wheel has its held height.
      const targets = [...ids, 'delivery'];
      targets.forEach((id) => scrollTargets.set(id, () => restAt(rangeIndexFromHash(id, ids))));
      const arrived = rangeIndexFromHash(window.location.hash, ids);
      let arrival = 0;
      if (arrived >= 0) {
        arrival = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          const y = restAt(arrived);
          const l = lenisRef.current;
          if (l) l.scrollTo(y, { immediate: true, force: true });
          else window.scrollTo(0, y);
        });
      }

      return () => {
        names.forEach((b) => b.removeEventListener('click', onClick));
        targets.forEach((id) => scrollTargets.delete(id));
        cancelAnimationFrame(arrival);
        turn.kill();
        grow.kill();
        delete wheel.dataset.held;
        sell.style.removeProperty('--sx');
        sell.style.removeProperty('--sr');
        names.forEach((el) => el.removeAttribute('style'));
      };
    });
    return () => mm.revert();
  });
  return null;
}
