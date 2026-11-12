'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { X } from '@phosphor-icons/react/dist/ssr';
import { categoryById, panelById, type CategoryId, type PanelId } from '@/lib/products';
import { DIRECTIONS_URL } from '@/lib/contact';
import { QUOTE_ACTION, quoteHref } from '@/lib/quote';
import { ProductView } from './ProductView';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The product panel, redrawn in round 31 (Bob: "the pop up design info is not well designed"). It carries on the dark
 * green of the ranges it opens from: a wide sheet from the right with the product's picture standing in its own cream
 * studio column on the left (the pictures' own background, so they read as photographs, not tiles), and on forest green
 * on the right the name in the site's thin wide capitals, what it does, its figures and points, and the ways to ask.
 * A range (LED lighting, solar cooling...) lists what the store carries as ruled rows; pointing at a row brings its
 * picture to the studio. On phones the picture sits on top and scrolls away with the text; the buttons stay at the foot.
 */
export function CategoryDrawer({ id, onClose, returnTo }: { id: PanelId | null; onClose: () => void; returnTo: HTMLElement | null }) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const product = id ? panelById(id) : null;
  const category = id && !product ? categoryById(id as CategoryId) : null;
  // Which of the range's pictures stands in the studio.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!id) return;
    lenis?.stop();
    const raf = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && panel.current) {
        const nodes = panel.current.querySelectorAll<HTMLElement>('a[href], button, summary, [tabindex]:not([tabindex="-1"])');
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      returnTo?.focus();
    };
  }, [id, lenis, onClose, returnTo]);

  const title = product?.name ?? category?.name;
  const quote = quoteHref(product?.quote ?? category?.quote);
  const fine = product ? product.source : 'Ask for current models and stock before you make the trip.';
  const shots = product ? [{ src: product.image, alt: product.alt }] : (category?.range.map((r) => ({ src: r.image, alt: r.alt })) ?? []);
  const rise = (i: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: EASE, delay: 0.2 + i * 0.07 } };

  return (
    <AnimatePresence>
      {title && (
        <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <motion.div
            className="drawer__scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            data-lenis-prevent
            className="drawer__panel"
            initial={reduced ? { opacity: 0 } : { x: '100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <button type="button" data-autofocus onClick={onClose} aria-label="Close" className="drawer__close">
              <X size={18} aria-hidden="true" />
            </button>

            <div className="drawer__inner">
              {/* The studio: the product, or the range's pictures stacked with the one pointed at in front. In a range
                  the rows below carry the same pictures with their descriptions, so the studio is decoration there. */}
              <figure className="drawer__stage" aria-hidden={category ? true : undefined}>
                <div className="drawer__shots">
                  {shots.map((s, i) => (
                    <Image
                      key={s.src}
                      className="drawer__shot feather"
                      data-on={i === shown || undefined}
                      src={s.src}
                      alt={category ? '' : s.alt}
                      width={800}
                      height={800}
                      sizes="(max-width: 60rem) 100vw, 520px"
                      priority={i === 0}
                    />
                  ))}
                </div>
                {category && <figcaption className="drawer__caption">Pictures show the kind of products we carry.</figcaption>}
              </figure>

              <div className="drawer__col">
                <div className="drawer__scroll">
                  <motion.header className="drawer__head" {...rise(0)}>
                    <h2 id="drawer-title" className="drawer__name">
                      {title}
                    </h2>
                    {product ? product.model && <p className="drawer__model">{product.model}</p> : <p className="drawer__blurb">{category?.blurb}</p>}
                  </motion.header>

                  {product ? (
                    <ProductView panel={product} rise={rise} />
                  ) : (
                    <ul className="drawer__body range">
                      {category?.range.map((item, i) => (
                        <motion.li key={item.name} className="range__item" data-on={i === shown || undefined} onPointerEnter={() => setShown(i)} {...rise(i + 1)}>
                          <span className="range__media">
                            <Image src={item.image} alt={item.alt} width={800} height={800} sizes="96px" />
                          </span>
                          <div className="range__text">
                            <h3 className="range__name">{item.name}</h3>
                            <p className="range__line">{item.line}</p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="drawer__foot">
                  <div className="drawer__actions">
                    <a href={quote} className="btn btn--sm drawer__ask">
                      {QUOTE_ACTION}
                    </a>
                    <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--sm drawer__way">
                      Get directions
                    </a>
                  </div>
                  {fine && <p className="drawer__fine">{fine}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
