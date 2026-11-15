'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type MouseEvent } from 'react';
import { OpenCategoryButton } from '@/components/catalog/OpenCategoryButton';
import { CATALOG_FILTERS, catalogProducts, filterFromParam, itemFromParam, rangeActions, rangeNote, type CatalogFilter, type ShortInfo } from '@/lib/catalog';
import { CATALOG_COPY, WHEEL_COPY } from '@/lib/homeCopy';
import { OTHERS, PRODUCTS, hasPicture } from '@/lib/islands';
import { contactHref } from '@/lib/message';
import { ProductInfo } from './ProductInfo';
import { RangePicture } from './RangePicture';

const SIZES = '(max-width: 47.5rem) 44vw, (max-width: 75rem) 30vw, 26vw';
const IDS = PRODUCTS.map((p) => p.id);

/** The page's address for a range and the product whose short info is open. */
function addressOf(filter: CatalogFilter, item: string | null = null) {
  const q = new URLSearchParams();
  if (filter !== 'all') q.set('range', filter);
  if (item) q.set('item', item);
  const s = q.toString();
  return s ? `/products?${s}` : '/products';
}

/** A plain click, that this page handles itself; one with a modifier key (a new tab) is left to the browser. */
const plain = (e: MouseEvent) => !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);

/**
 * Every product, to look at (round 54, Bob: "i want them to not be like a site that you can shop but only to view so
 * more minimal and better displayed where they can click and see short info of the products"). The ranges as a row of
 * plain names, then the products large on the light ground, each with its range and its name and nothing to buy. A
 * product opens its short info over the page, in the page's own light (ProductInfo). The range and the product open
 * live in the address (?range=, ?item=), so "See all Solar products" on the home page opens here on Solar, Back closes
 * the short info, and a shared link opens on the same one. Changing them never reloads anything (the history calls are
 * Next's own). Without scripts a product leads to its full page instead.
 */
export function Catalog({ info }: { info: Record<string, ShortInfo> }) {
  const params = useSearchParams();
  const pathname = usePathname();
  // While a product's full page is open in the sheet over this page the address is the product's; this page keeps its own.
  const kept = useRef<{ filter: CatalogFilter; item: string | null }>({ filter: 'all', item: null });
  if (pathname === '/products') kept.current = { filter: filterFromParam(params?.get('range')), item: itemFromParam(params?.get('item'), IDS) };
  const { filter, item } = kept.current;
  // Whether this page put the open product in the history, so closing it is a step back rather than a new entry.
  const pushed = useRef(false);

  const pick = useCallback((f: CatalogFilter) => window.history.replaceState(null, '', addressOf(f)), []);
  const open = useCallback(
    (id: string) => {
      pushed.current = true;
      window.history.pushState(null, '', addressOf(filter, id));
    },
    [filter],
  );
  const step = useCallback((id: string) => window.history.replaceState(null, '', addressOf(filter, id)), [filter]);
  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else window.history.replaceState(null, '', addressOf(filter));
  }, [filter]);

  const order = useMemo(() => catalogProducts(filter, '').map((p) => p.id), [filter]);

  return (
    <>
      <CatalogView filter={filter} onPick={pick} onOpen={open} />
      <ProductInfo id={item} order={order} info={info} onClose={close} onStep={step} />
    </>
  );
}

/**
 * The page's content for a range, with no reading of the address: what the server sends before scripts (the page's
 * Suspense fallback shows it for All) and what Catalog shows once they run.
 */
export function CatalogView({ filter, onPick, onOpen }: { filter: CatalogFilter; onPick?: (f: CatalogFilter) => void; onOpen?: (id: string) => void }) {
  const list = useMemo(() => catalogProducts(filter, ''), [filter]);
  const note = rangeNote(filter);
  const showOthers = filter === 'all' || filter === 'others';

  // On phones the row of ranges slides sideways: the one shown comes into the middle of it.
  const index = useRef<HTMLElement>(null);
  useEffect(() => {
    const row = index.current;
    const on = row?.querySelector<HTMLElement>('[aria-current]');
    if (row && on && row.scrollWidth > row.clientWidth) row.scrollLeft = on.offsetLeft - row.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
  }, [filter]);

  return (
    <>
      <nav ref={index} className="cat__index" aria-label="Ranges">
        {CATALOG_FILTERS.map((f) => (
          <a
            key={f.id}
            href={addressOf(f.id)}
            className="cat__to"
            aria-current={f.id === filter ? 'true' : undefined}
            onClick={(e) => {
              if (!onPick || !plain(e)) return;
              e.preventDefault();
              onPick(f.id);
            }}
          >
            {f.label}
          </a>
        ))}
      </nav>
      {note && (
        <p className="cat__note">
          {`${note} `}
          {rangeActions(filter).map((a) => (
            <OpenCategoryButton key={a.panel} id={a.panel} className="textlink cat__note-act">
              {a.label}
            </OpenCategoryButton>
          ))}
        </p>
      )}

      {filter !== 'others' && (
        <ul className="cat__grid" key={filter}>
          {list.map((p, i) => (
            <li key={p.id} style={{ '--i': i } as CSSProperties}>
              <a
                href={`/products/${p.id}`}
                className="cat__item"
                data-id={p.id}
                aria-haspopup={onOpen ? 'dialog' : undefined}
                onClick={(e) => {
                  if (!onOpen || !plain(e)) return;
                  e.preventDefault();
                  onOpen(p.id);
                }}
              >
                <span className={`cat__pool${p.bulb ? ' cat__pool--bulb' : ''}`}>{hasPicture(p) && <RangePicture p={p} sizes={SIZES} whole />}</span>
                <span className="cat__range">{p.range.name}</span>
                <span className="cat__name">{p.name}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {showOthers && (
        <section className="cat__others" aria-labelledby="cat-others">
          <h2 id="cat-others" className="cat__others-title">
            {CATALOG_COPY.others}
          </h2>
          <p className="cat__others-line">{CATALOG_COPY.othersLine}</p>
          <ul className="others">
            {OTHERS.map((o) => (
              <li key={o.name} className="others__item">
                <span className="others__name">{o.name}</span>
                <span className="others__line">{o.line}</span>
              </li>
            ))}
          </ul>
          <div className="cat__others-acts">
            <a href={contactHref('question')} className="textlink">
              {WHEEL_COPY.askUs}
            </a>
          </div>
        </section>
      )}
      <p className="cat__pictures">{WHEEL_COPY.pictures}</p>
    </>
  );
}
