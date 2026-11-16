'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import { scrollTargets } from '@/components/providers/scrollTargets';
import { GHOST_OPACITY, heldPosition, rangeIndexFromHash, restProgress, settleOn } from '@/lib/wheel';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MOTION = '(prefers-reduced-motion: no-preference)';
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** The drum: its radius in name heights, and the turn between two names (wider on phones, where the names are
 *  smaller). Neighbours sit one and a half to two name heights apart (Bob: "more seperated"), at every size. */
const RADIUS = 3.4;
const STEP = 26;
const STEP_PHONE = 31;
/** How long the scroll must be still, in ms, before the wheel settles on a name. */
const SETTLE = 170;

/**
 * Turns the wheel as the page scrolls (Wheel): the drum of names, the foot of the one in front, and the name in front
 * marked as current (its arrow shows then). Clicking a name turns the
 * wheel to it; clicking the name in front opens its products. As What we sell arrives it grows from a rounded card out
 * to the screen's edges. With reduced motion none of this runs and the still rows show instead (wheel.css).
 * Round 54, "better scrolling feel": a short rest on each name and a long, gentle turn (lib/wheel), and when the scroll
 * stops part way through a turn the page glides on to the next name the way it was going, as a phone's date picker
 * clicks into place. The names are set large; one too wide for the screen, in the language shown, is set down to fit
 * (its own --wn-fit), the others keep their size.
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
    const ghosts = [...wheel.querySelectorAll<HTMLElement>('.wheel__ghost')];
    const num = sell.querySelector<HTMLElement>('.sell__num');
    const ids = names.map((n) => n.dataset.id ?? '');
    const n = names.length;

    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      // "A. The big number": the 6 counts up from 0 the first time it comes into view (Bob: "more prominent and creative").
      const final = Number(num?.textContent) || 0;
      let counting: gsap.core.Tween | undefined;
      if (num && final) {
        const state = { v: 0 };
        num.textContent = '0';
        counting = gsap.to(state, {
          v: final,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            num.textContent = String(Math.round(state.v));
          },
          scrollTrigger: { trigger: num, start: 'top 80%', once: true },
        });
      }

      wheel.dataset.held = 'true';
      let front = -1;
      let em = 100;

      // Each name as large as the width allows: one too wide (its words and its arrow) is set down to fit.
      const band = wheel.querySelector<HTMLElement>('.wheel__band');
      const fit = () => {
        names.forEach((el) => {
          el.style.setProperty('--wn-fit', '1');
          const room = el.clientWidth;
          const name = el.firstElementChild as HTMLElement | null;
          const go = el.querySelector<HTMLElement>('.wn__go');
          const w = (name?.offsetWidth ?? 0) + (go ? go.offsetWidth + parseFloat(getComputedStyle(go).marginLeft) : 0);
          if (room && w > room) el.style.setProperty('--wn-fit', Math.max(0.5, (room / w) * 0.98).toFixed(4));
        });
        em = parseFloat(getComputedStyle(band ?? names[0] ?? wheel).fontSize) || em;
      };

      const draw = (progress: number) => {
        const pos = heldPosition(progress, n);
        const radius = em * RADIUS;
        const step = window.innerWidth < 760 ? STEP_PHONE : STEP;
        names.forEach((el, k) => {
          const d = k - pos;
          const a = Math.abs(d);
          el.style.visibility = a > 2.7 ? 'hidden' : '';
          el.style.transform = `translateY(-50%) translateZ(${-radius}px) rotateX(${(-d * step).toFixed(3)}deg) translateZ(${radius}px)`;
          el.style.opacity = Math.max(0, 1 - a * 0.4).toFixed(3);
        });
        // The range in front's two products, faint, either side: in as the wheel reaches it, out as it turns on, drifting
        // with the turn (GHOST_OPACITY at most: Bob, "Fainter than the mock-up").
        ghosts.forEach((g) => {
          const d = Number(g.dataset.k) - pos;
          const a = Math.abs(d);
          g.style.opacity = (GHOST_OPACITY * Math.max(0, 1 - a * 1.6)).toFixed(3);
          g.style.transform = `translateY(${(d * 9).toFixed(2)}vh) scale(${(1 - Math.min(1, a) * 0.06).toFixed(3)})`;
        });
        const now = Math.round(pos);
        if (now !== front) {
          front = now;
          feet.forEach((f, k) => (f.dataset.on = String(k === now)));
          names.forEach((b, k) => (k === now ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        }
      };

      fit();
      const turn = ScrollTrigger.create({
        trigger: wheel,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (st) => draw(st.progress),
        onRefresh: (st) => {
          fit();
          draw(st.progress);
        },
      });
      draw(turn.progress);
      // A new language changes the names' widths; a font arriving changes them too.
      const words = new MutationObserver(() => {
        fit();
        draw(turn.progress);
      });
      words.observe(wheel.querySelector('.wheel__names') ?? wheel, { subtree: true, childList: true, characterData: true });
      void document.fonts?.ready.then(() => {
        fit();
        draw(turn.progress);
      });

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

      // Stopped part way through a turn, the page glides on to the next name the way it was going. Not while a finger
      // is still on the screen, and never outside the wheel's turns (lib/wheel settleOn).
      let still = 0;
      let touching = false;
      let lastY = window.scrollY;
      let way = 0;
      const settle = () => {
        still = 0;
        if (touching || turn.end <= turn.start) return;
        const k = settleOn((window.scrollY - turn.start) / (turn.end - turn.start), n, way);
        if (k < 0) return;
        const l = lenisRef.current;
        if (l) l.scrollTo(restAt(k), { duration: 0.75 });
        else window.scrollTo({ top: restAt(k), behavior: 'smooth' });
      };
      const onScroll = () => {
        const y = window.scrollY;
        if (y !== lastY) way = Math.sign(y - lastY);
        lastY = y;
        window.clearTimeout(still);
        still = window.setTimeout(settle, SETTLE);
      };
      const onTouch = (e: TouchEvent) => {
        touching = e.type === 'touchstart';
        if (!touching) onScroll();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('touchstart', onTouch, { passive: true });
      window.addEventListener('touchend', onTouch, { passive: true });
      window.addEventListener('touchcancel', onTouch, { passive: true });

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
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('touchend', onTouch);
        window.removeEventListener('touchcancel', onTouch);
        window.clearTimeout(still);
        words.disconnect();
        targets.forEach((id) => scrollTargets.delete(id));
        cancelAnimationFrame(arrival);
        turn.kill();
        grow.kill();
        delete wheel.dataset.held;
        sell.style.removeProperty('--sx');
        sell.style.removeProperty('--sr');
        names.forEach((el) => el.removeAttribute('style'));
        ghosts.forEach((el) => el.removeAttribute('style'));
        counting?.scrollTrigger?.kill();
        counting?.kill();
        if (num && final) num.textContent = String(final);
      };
    });
    return () => mm.revert();
  });
  return null;
}
