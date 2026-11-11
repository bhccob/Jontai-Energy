'use client';

import { useEffect, useRef } from 'react';

/**
 * A patch of sunlight that follows the pointer over the store's statement, as light through a window would (air.css,
 * .statement --mx/--my, eased by the registered properties). Pointers only; still with reduced motion.
 */
export function StatementLight() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>('.statement');
    if (!section) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const move = (e: PointerEvent) => {
      const box = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${e.clientX - box.left}px`);
      section.style.setProperty('--my', `${e.clientY - box.top}px`);
    };
    section.addEventListener('pointermove', move);
    return () => section.removeEventListener('pointermove', move);
  }, []);
  return <span ref={ref} hidden />;
}
