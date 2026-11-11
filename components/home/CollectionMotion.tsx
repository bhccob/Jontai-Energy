'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { scrollTargets } from '@/components/providers/scrollTargets';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Wide and tall enough for the frames to stand side by side at their staggered heights. */
const ROOMY = '(min-width: 961px) and (min-height: 600px)';
const MOTION = '(prefers-reduced-motion: no-preference)';
const POINTER = '(hover: hover) and (pointer: fine)';

/**
 * The collection's motion. On wide screens the row holds still and the scroll carries it sideways, each picture drifting
 * a little against its frame so the frames read as windows; a link to a range (/#cooling) lands with its frame in the
 * middle. With a fine pointer a frame leans toward it, and a round "View" follows the pointer while it is over a picture.
 */
export function CollectionMotion() {
  const ref = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const lenisNow = useRef(lenis);
  useEffect(() => {
    lenisNow.current = lenis;
  }, [lenis]);

  useGSAP(() => {
    const section = ref.current?.closest<HTMLElement>('.collection');
    const pin = section?.querySelector<HTMLElement>('.collection__pin');
    const track = section?.querySelector<HTMLElement>('.collection__track');
    if (!section || !pin || !track) return;
    const pieces = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.piece'));
    const mm = gsap.matchMedia();

    mm.add(`${ROOMY} and ${MOTION}`, () => {
      section.dataset.row = 'true';
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: pin, pin: true, start: 'top top', end: () => `+=${distance()}`, scrub: 0.4, invalidateOnRefresh: true },
      });
      const st = tween.scrollTrigger as ScrollTrigger;
      // The pictures sway with the speed of the scroll and settle when it stops.
      const sways = pieces.map((p) => {
        const img = p.querySelector('.piece__float img');
        return img ? gsap.quickTo(img, 'skewX', { duration: 0.6, ease: 'power3' }) : null;
      });
      const sway = ScrollTrigger.create({
        trigger: pin,
        start: () => st.start,
        end: () => st.end,
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-8, 8, self.getVelocity() / -250);
          sways.forEach((s) => s?.(v));
        },
        onLeave: () => sways.forEach((s) => s?.(0)),
        onLeaveBack: () => sways.forEach((s) => s?.(0)),
      });
      let still = 0;
      const settle = () => {
        window.clearTimeout(still);
        still = window.setTimeout(() => sways.forEach((s) => s?.(0)), 120);
      };
      window.addEventListener('scroll', settle, { passive: true });
      // Each picture drifts against its frame while the row moves.
      pieces.forEach((p) => {
        const img = p.querySelector('.piece__float');
        if (img) gsap.fromTo(img, { xPercent: 5 }, { xPercent: -5, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      // Links to a range land with its frame in the middle of the screen.
      pieces.forEach((p) =>
        scrollTargets.set(p.id, () => {
          const centre = p.offsetLeft + p.offsetWidth / 2 - window.innerWidth / 2;
          return st.start + Math.min(distance(), Math.max(0, centre));
        }),
      );
      ScrollTrigger.refresh();
      const arrived = scrollTargets.get(decodeURIComponent(location.hash.slice(1)));
      if (arrived && pieces.some((p) => p.id === decodeURIComponent(location.hash.slice(1)))) {
        if (lenisNow.current) lenisNow.current.scrollTo(arrived(), { immediate: true, force: true });
        else window.scrollTo(0, arrived());
      }
      return () => {
        pieces.forEach((p) => scrollTargets.delete(p.id));
        delete section.dataset.row;
        sway.kill();
        window.removeEventListener('scroll', settle);
        window.clearTimeout(still);
      };
    });

    mm.add(`${MOTION} and ${POINTER}`, () => {
      const cursor = document.createElement('span');
      cursor.className = 'view-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = 'View';
      section.appendChild(cursor);
      const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
      const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
      const undo: (() => void)[] = [];
      pieces.forEach((p) => {
        const frame = p.querySelector<HTMLElement>('.piece__frame');
        if (!frame) return;
        const rx = gsap.quickTo(frame, 'rotationY', { duration: 0.8, ease: 'power3' });
        const ry = gsap.quickTo(frame, 'rotationX', { duration: 0.8, ease: 'power3' });
        gsap.set(frame, { transformPerspective: 1100 });
        const move = (e: PointerEvent) => {
          const b = frame.getBoundingClientRect();
          const fx = (e.clientX - b.left) / b.width;
          const fy = (e.clientY - b.top) / b.height;
          rx((fx - 0.5) * 8);
          ry(-(fy - 0.5) * 6);
          // The light inside the frame follows the pointer.
          frame.style.setProperty('--lx', `${Math.round(fx * 100)}%`);
          frame.style.setProperty('--ly', `${Math.round(fy * 100)}%`);
          cx(e.clientX);
          cy(e.clientY);
        };
        const enter = (e: PointerEvent) => {
          gsap.set(cursor, { x: e.clientX, y: e.clientY });
          cursor.dataset.on = 'true';
        };
        const leave = () => {
          rx(0);
          ry(0);
          frame.style.removeProperty('--lx');
          frame.style.removeProperty('--ly');
          delete cursor.dataset.on;
        };
        frame.addEventListener('pointerenter', enter);
        frame.addEventListener('pointermove', move);
        frame.addEventListener('pointerleave', leave);
        undo.push(() => {
          frame.removeEventListener('pointerenter', enter);
          frame.removeEventListener('pointermove', move);
          frame.removeEventListener('pointerleave', leave);
        });
      });
      return () => {
        undo.forEach((u) => u());
        cursor.remove();
      };
    });
  });

  return <span ref={ref} hidden />;
}
