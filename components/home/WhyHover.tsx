'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * The key words of the "why" sentence call up their pictures: point at "Power" and the solar island rises beside the
 * pointer, tilting as it follows; leave and it sinks away. One floating picture, swapped per word. Fine pointers and
 * motion only; elsewhere the words are simply underlined.
 */
export function WhyHover() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = ref.current?.closest<HTMLElement>('.why');
    if (!section) return;
    const mm = gsap.matchMedia();
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const float = document.createElement('span');
      float.className = 'why__float';
      float.setAttribute('aria-hidden', 'true');
      const img = document.createElement('img');
      img.alt = '';
      float.appendChild(img);
      section.appendChild(float);
      const x = gsap.quickTo(float, 'x', { duration: 0.6, ease: 'power3' });
      const y = gsap.quickTo(float, 'y', { duration: 0.6, ease: 'power3' });
      const r = gsap.quickTo(float, 'rotation', { duration: 0.8, ease: 'power3' });
      let lastX = 0;
      const keys = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.why__key'));
      const undo: (() => void)[] = [];
      keys.forEach((k) => {
        const enter = (e: PointerEvent) => {
          img.src = k.dataset.pic ?? '';
          gsap.set(float, { x: e.clientX, y: e.clientY });
          lastX = e.clientX;
          gsap.to(float, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)', overwrite: 'auto' });
        };
        const move = (e: PointerEvent) => {
          x(e.clientX);
          y(e.clientY);
          r(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
          lastX = e.clientX;
        };
        const leave = () => {
          r(0);
          gsap.to(float, { scale: 0.4, opacity: 0, duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
        };
        k.addEventListener('pointerenter', enter);
        k.addEventListener('pointermove', move);
        k.addEventListener('pointerleave', leave);
        undo.push(() => {
          k.removeEventListener('pointerenter', enter);
          k.removeEventListener('pointermove', move);
          k.removeEventListener('pointerleave', leave);
        });
      });
      gsap.set(float, { scale: 0.4, opacity: 0 });
      return () => {
        undo.forEach((u) => u());
        float.remove();
      };
    });
  });

  return <span ref={ref} hidden />;
}
