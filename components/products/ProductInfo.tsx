'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLenis } from 'lenis/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from '@phosphor-icons/react';
import { neighbours, type ShortInfo } from '@/lib/catalog';
import { INFO_COPY } from '@/lib/homeCopy';
import { PRODUCTS, hasPicture } from '@/lib/islands';
import { contactHref } from '@/lib/message';
import { RangePicture } from './RangePicture';

/**
 * A product's short info on the All products page (round 54, Bob: "where they can click and see short info of the
 * products when clicked to see info products gotta be same styling design as the page of display"). It slides in from
 * the side over the page (from the foot on phones), on the page's own light ground with the page's type: the product
 * large in its pool of light, its range, its name, what it is, a few figures and points on ruled lines, and a way to ask
 * about it. Nothing to buy. The arrows (or the arrow keys) step to the product before or after in the order the page
 * shows them; the cross, the shade beside it, Escape or Back close it, and the focus goes back to the product it opened
 * from. It keeps showing the last product while it slides away. It lives at the end of the page's body, so it lies
 * over the header as well.
 */
export function ProductInfo({
  id,
  order,
  info,
  onClose,
  onStep,
}: {
  id: string | null;
  order: string[];
  info: Record<string, ShortInfo>;
  onClose: () => void;
  onStep: (id: string) => void;
}) {
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const shown = useRef<string | null>(null);
  if (id) shown.current = id;
  const open = id !== null;
  const cur = shown.current;
  const data = cur ? info[cur] : undefined;
  const product = cur ? PRODUCTS.find((p) => p.id === cur) : undefined;
  const { prev, next, at, of } = neighbours(order, cur ?? '');

  // Open: the page holds still under it and the keyboard moves into it. Closed: it is out of reach, and the keyboard
  // goes back to the product it opened from.
  useEffect(() => {
    const el = root.current;
    if (el) el.inert = !open;
    if (!open || !mounted) return;
    const html = document.documentElement;
    // The scrollbar goes while it is open; the page keeps its width (catalog.css pads the body by it).
    html.style.setProperty('--sb', `${window.innerWidth - html.clientWidth}px`);
    lenis?.stop();
    html.dataset.info = 'open';
    panel.current?.focus({ preventScroll: true });
    return () => {
      delete html.dataset.info;
      html.style.removeProperty('--sb');
      lenis?.start();
      const from = shown.current ? document.querySelector<HTMLElement>(`.cat__item[data-id="${shown.current}"]`) : null;
      from?.focus({ preventScroll: true });
    };
  }, [open, lenis, mounted]);

  // Each product starts at its top.
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 });
  }, [cur]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && prev) onStep(prev);
      else if (e.key === 'ArrowRight' && next) onStep(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, prev, next, onClose, onStep]);

  if (!mounted) return null;
  return createPortal(
    <div ref={root} className="pinfo" data-open={open ? 'true' : 'false'}>
      <div className="pinfo__shade" onClick={onClose} aria-hidden="true" />
      <div ref={panel} className="pinfo__panel" role="dialog" aria-modal="true" aria-labelledby="pinfo-title" tabIndex={-1} data-lenis-prevent>
        <div className="pinfo__bar">
          <span className="pinfo__at">{at > 0 ? `${at} / ${of}` : ''}</span>
          <div className="pinfo__acts">
            <button type="button" className="pinfo__btn" aria-label={INFO_COPY.prev} disabled={!prev} onClick={() => prev && onStep(prev)}>
              <ArrowLeft size={17} weight="bold" aria-hidden="true" />
            </button>
            <button type="button" className="pinfo__btn" aria-label={INFO_COPY.next} disabled={!next} onClick={() => next && onStep(next)}>
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </button>
            <button type="button" className="pinfo__btn pinfo__btn--close" aria-label={INFO_COPY.close} onClick={onClose}>
              <X size={17} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>

        {data && product && (
          <div className="pinfo__body" key={cur}>
            <div className={`pinfo__pool${product.bulb ? ' pinfo__pool--bulb' : ''}`}>
              {hasPicture(product) && <RangePicture p={product} sizes="(max-width: 60rem) 80vw, 520px" eager whole />}
            </div>
            <p className="pinfo__range">{data.range}</p>
            <h2 id="pinfo-title" className="pinfo__title">
              {data.title}
            </h2>
            {data.model && <p className="pinfo__model">{data.model}</p>}
            <p className="pinfo__intro">{data.intro}</p>
            {data.figures.length > 0 && (
              <dl className="pinfo__figures">
                {data.figures.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {data.points.length > 0 && (
              <ul className="pinfo__points">
                {data.points.map((p) => (
                  <li key={p.title}>
                    <h3>{p.title}</h3>
                    <p>{p.line}</p>
                  </li>
                ))}
              </ul>
            )}
            <a href={contactHref('question')} className="textlink pinfo__ask">
              {INFO_COPY.ask}
              <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
