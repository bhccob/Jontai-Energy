'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { scrollTargets } from '@/components/providers/scrollTargets';
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
}

/**
 * The island walk. On wide screens with motion the rail holds still and the scroll moves the islands sideways, one at a
 * time: each holds to be read, then the next drifts in from the right and a little below while the last one lifts away
 * up and to the left, and its words arrive with it as one block (never faded). A scroll that rests mid-drift settles
 * onto the next island in the direction it was going. The names along the bottom show where you are and jump there.
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
    const n = slides.length;
    const held = (i: number) => i * (HOLD + MOVE);
    const total = held(n - 1) + HOLD;

    const walk = () => {
      section.dataset.walk = 'true';
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
          },
        },
      });
      for (let i = 1; i < n; i++) {
        const at = held(i - 1) + HOLD;
        tl.fromTo(track, { xPercent: -((i - 1) * 100) / n }, { xPercent: -(i * 100) / n, duration: MOVE, ease: 'power1.inOut', immediateRender: i === 1 }, at);
        if (pics[i]) tl.fromTo(pics[i], { xPercent: 22, yPercent: 14, scale: 0.86 }, { xPercent: 0, yPercent: 0, scale: 1, duration: MOVE, ease: 'power2.out' }, at);
        if (pics[i - 1]) tl.fromTo(pics[i - 1], { xPercent: 0, yPercent: 0, scale: 1 }, { xPercent: -16, yPercent: -18, scale: 0.9, duration: MOVE, ease: 'power2.in', immediateRender: false }, at);
      }
      const st = tl.scrollTrigger as ScrollTrigger;
      const y = (at: number) => st.start + ((st.end - st.start) * at) / total;
      rests.current = () => ({ holds: items.map((_, i) => [y(held(i)), y(held(i) + HOLD)]), end: st.end });
      items.forEach((it, i) => scrollTargets.set(it.id, () => y(held(i) + HOLD / 2)));
      return () => {
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

/** Mid-drift from `from` to `to`: on in the direction the scroll was going once PUSH of the way in, else back. */
function between(from: number, to: number, y: number, dir: number) {
  const q = (y - from) / (to - from);
  if (dir > 0) return q > PUSH ? to : from;
  if (dir < 0) return q < 1 - PUSH ? from : to;
  return q < 0.5 ? from : to;
}
