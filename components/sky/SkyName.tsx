'use client';

import { useEffect, useRef } from 'react';
import { FitText } from '@/components/ui/FitText';

/** The valley pictures behind the first view (SkyScope): wide for screens, a portrait slice for phones. */
const WIDE = { src: '/sky/valley-green-1920.webp', w: 1920, h: 824 };
const PHONE = { src: '/sky/valley-green-phone.webp', w: 900, h: 1468 };
const PHONE_QUERY = '(max-width: 40rem)';

/**
 * JONTAI across the foot of the first view, in front of the islands (Bob, round 26: "i want jontai text to be
 * infront"). Each letter shows its own piece of the valley picture, placed as if the picture filled the screen behind
 * the word (the way the sky's valley used to show through it), so the word still reads as cut out of the valley. The
 * pieces are measured from layout, so the letters' own rise and sink (sky.css, HeroSkyMotion) carry their piece with
 * them; measured again when the screen or the fitted size changes.
 */
export function SkyName() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const name = layer?.querySelector<HTMLElement>('.sky__name');
    if (!layer || !name) return;
    const phone = window.matchMedia(PHONE_QUERY);
    let frame = 0;
    const place = () => {
      frame = 0;
      const pic = phone.matches ? PHONE : WIDE;
      const w = layer.clientWidth;
      const h = layer.clientHeight;
      // The picture as object-fit: cover at 50% 40% would show it (.sky__img).
      const s = Math.max(w / pic.w, h / pic.h);
      const bw = pic.w * s;
      const bh = pic.h * s;
      const x0 = (w - bw) * 0.5;
      const y0 = (h - bh) * 0.4;
      name.style.setProperty('--sky-pic', `url(${pic.src})`);
      name.style.setProperty('--bw', `${bw}px`);
      name.style.setProperty('--bh', `${bh}px`);
      for (const ci of name.querySelectorAll<HTMLElement>('.ci')) {
        let left = 0;
        let top = 0;
        for (let n: HTMLElement | null = ci; n && n !== layer; n = n.offsetParent as HTMLElement | null) {
          left += n.offsetLeft;
          top += n.offsetTop;
        }
        ci.style.setProperty('--bx', `${x0 - left}px`);
        ci.style.setProperty('--by', `${y0 - top}px`);
      }
    };
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    // The screen's size, and the fitted word's (FitText refits once the font loads).
    const ro = new ResizeObserver(soon);
    ro.observe(layer);
    const fit = name.querySelector('.fit');
    if (fit) ro.observe(fit);
    phone.addEventListener('change', soon);
    return () => {
      ro.disconnect();
      phone.removeEventListener('change', soon);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="sky__front" aria-hidden="true">
      <FitText text="JONTAI" chars className="sky__name" />
    </div>
  );
}
