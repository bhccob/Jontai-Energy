'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { scrollTargets } from '@/components/providers/scrollTargets';
import { DAY_INK, dayVars, type Day } from '@/lib/islands';
import { useSettle } from './useSettle';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for an island and its words side by side. */
const ROOMY = '(min-width: 961px) and (min-height: 560px)';
const MOTION = '(prefers-reduced-motion: no-preference)';
/** Screens of scroll each island holds still for, to be read. */
const HOLD = 0.75;
/** Screens of scroll the drift from one island to the next takes. */
const MOVE = 0.95;
/** Mid-drift, how far in (either way) a resting scroll must be to carry on to the next island. */
const PUSH = 0.12;
/** Just short of the walk, how near (a share of the screen) a resting scroll must stop to settle onto the first island. */
const NEAR = 0.22;

interface Item {
  id: string;
  name: string;
  day: Day;
}

/**
 * The island walk. On wide screens with motion the rail holds still and the scroll moves the islands sideways, one at a
 * time: each holds to be read, then the next drifts in from the right and a little below while the last one lifts away
 * up and to the left, and its words arrive with it as one block (never faded). A scroll that rests mid-drift settles
 * onto the next island in the direction it was going. The air between them changes colour through the day and the
 * light moves with it. The names along the bottom show where you are and jump there.
 * Elsewhere the islands stack and this adds nothing but the names.
 */
export function IslandWalk({ items }: { items: Item[] }) {
  const nav = useRef<HTMLElement>(null);
  const rests = useRef<(() => { holds: [number, number][]; end: number }) | null>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();
  const lenisNow = useRef(lenis);
  useEffect(() => {
    lenisNow.current = lenis;
  }, [lenis]);

  useGSAP(() => {
    const rail = nav.current?.closest<HTMLElement>('.islands__rail');
    const section = rail?.closest<HTMLElement>('.islands');
    const track = rail?.querySelector<HTMLElement>('.islands__track');
    if (!rail || !section || !track) return;
    const slides = gsap.utils.toArray<HTMLElement>(track.children);
    const pics = slides.map((s) => s.querySelector<HTMLElement>('.island__pic'));
    const words = slides.map((s) => gsap.utils.toArray<HTMLElement>(s.querySelectorAll('.island__text > *')));
    const n = slides.length;
    const held = (i: number) => i * (HOLD + MOVE);
    const total = held(n - 1) + HOLD;

    // The colour of the air between two moments of the day, written straight onto the rail (GSAP reads unset custom
    // properties as transparent, so they are mixed here instead).
    const air = { k: 0 };
    const drift = gsap.parseEase('power1.inOut');
    const paint = () => {
      const a = Math.max(0, Math.min(n - 1, Math.floor(air.k)));
      const b = Math.min(n - 1, a + 1);
      const t = air.k - a;
      const [da, db] = [items[a].day, items[b].day];
      rail.style.setProperty('--day-bg', mix(da.bg, db.bg, t));
      rail.style.setProperty('--day-ink', mix(DAY_INK[da.ink], DAY_INK[db.ink], t));
      rail.style.setProperty('--day-glow', mix(da.glow, db.glow, t));
      rail.style.setProperty('--day-x', `${da.at[0] + (db.at[0] - da.at[0]) * t}%`);
      rail.style.setProperty('--day-y', `${da.at[1] + (db.at[1] - da.at[1]) * t}%`);
    };

    const walk = () => {
      section.dataset.walk = 'true';
      air.k = 0;
      paint();
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: rail,
          pin: true,
          start: 'top top',
          end: () => `+=${total * window.innerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const at = self.progress * total;
            setActive(Math.min(n - 1, Math.max(0, Math.round((at - HOLD / 2) / (HOLD + MOVE)))));
            // The air follows the scroll itself: still through each hold, blending through each drift.
            const i = Math.floor(at / (HOLD + MOVE));
            const into = at - i * (HOLD + MOVE);
            air.k = Math.min(n - 1, i + (into > HOLD ? drift((into - HOLD) / MOVE) : 0));
            paint();
          },
        },
      });
      for (let i = 1; i < n; i++) {
        const at = held(i - 1) + HOLD;
        tl.fromTo(track, { xPercent: -((i - 1) * 100) / n }, { xPercent: -(i * 100) / n, duration: MOVE, ease: 'power1.inOut', immediateRender: i === 1 }, at);
        if (pics[i]) tl.fromTo(pics[i], { xPercent: 22, yPercent: 14, scale: 0.86 }, { xPercent: 0, yPercent: 0, scale: 1, duration: MOVE, ease: 'power2.out' }, at);
        if (pics[i - 1]) tl.fromTo(pics[i - 1], { xPercent: 0, yPercent: 0, scale: 1 }, { xPercent: -16, yPercent: -18, scale: 0.9, duration: MOVE, ease: 'power2.in', immediateRender: false }, at);
        // The words come in layers: the label first, the name, then the rest, each a little further behind.
        tl.fromTo(words[i], { x: (k: number) => 80 + k * 46 }, { x: 0, duration: MOVE, ease: 'power3.out', stagger: 0.03, immediateRender: i === 1 }, at);
        tl.fromTo(words[i - 1], { x: 0 }, { x: (k: number) => -40 - k * 22, duration: MOVE, ease: 'power2.in', stagger: 0.02, immediateRender: false }, at);
      }
      // The last island's hold, as time on the timeline: without it the timeline would end with the last drift and the
      // scroll would stretch it over the hold too, so every island would sit off its own stretch of scroll.
      tl.to({}, { duration: HOLD }, held(n - 1));
      const st = tl.scrollTrigger as ScrollTrigger;
      const y = (at: number) => st.start + ((st.end - st.start) * at) / total;
      rests.current = () => ({ holds: items.map((_, i) => [y(held(i)), y(held(i) + HOLD)]), end: st.end });
      items.forEach((it, i) => scrollTargets.set(it.id, () => y(held(i) + HOLD / 2)));
      return () => {
        rail.removeAttribute('style');
        Object.entries(dayVars(items[0].day)).forEach(([k, v]) => rail.style.setProperty(k, v));
        items.forEach((it) => scrollTargets.delete(it.id));
        rests.current = null;
        delete section.dataset.walk;
      };
    };

    const mm = gsap.matchMedia();
    mm.add(`${ROOMY} and ${MOTION}`, () => {
      let undo: (() => void) | undefined;
      const ctx = gsap.context(() => {
        undo = walk();
      });
      ScrollTrigger.refresh();
      // A link from elsewhere to one of the islands (/#cooling) lands on it.
      const arrived = scrollTargets.get(decodeURIComponent(location.hash.slice(1)));
      if (arrived) {
        if (lenisNow.current) lenisNow.current.scrollTo(arrived(), { immediate: true, force: true });
        else window.scrollTo(0, arrived());
      }
      return () => {
        ctx.revert();
        undo?.();
      };
    });
  });

  // Settle: within an island's hold the scroll stays; mid-drift it goes on to the next (or back) in the direction it
  // was moving; just short of the walk it locks onto the first island.
  useSettle((y, dir) => {
    const walk = rests.current?.();
    if (!walk) return null;
    const near = window.innerHeight * NEAR;
    const { holds, end } = walk;
    if (y < holds[0][0]) return y >= holds[0][0] - near ? holds[0][0] : null;
    if (y > end) return null;
    for (let i = 0; i < holds.length; i++) {
      const [a, b] = holds[i];
      if (y <= b) return y >= a ? null : between(holds[i - 1][1], a, y, dir);
    }
    return null;
  });

  return (
    <nav ref={nav} className="islands__index" aria-label="Ranges">
      <ul>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} aria-current={i === active ? 'true' : undefined}>
              {it.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Two colours mixed, t from 0 to 1 (hex or rgba, as lib/islands writes them). */
function mix(a: string, b: string, t: number) {
  const ca = gsap.utils.splitColor(a) as number[];
  const cb = gsap.utils.splitColor(b) as number[];
  const c = [0, 1, 2, 3].map((j) => {
    const x = ca[j] ?? 1;
    return x + ((cb[j] ?? 1) - x) * t;
  });
  return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${c[3].toFixed(3)})`;
}

/** Mid-drift from `from` to `to`: on in the direction the scroll was going once PUSH of the way in, else back. */
function between(from: number, to: number, y: number, dir: number) {
  const q = (y - from) / (to - from);
  if (dir > 0) return q > PUSH ? to : from;
  if (dir < 0) return q < 1 - PUSH ? from : to;
  return q < 0.5 ? from : to;
}
