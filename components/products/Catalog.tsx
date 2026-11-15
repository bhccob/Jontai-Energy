'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, MagnifyingGlass } from '@phosphor-icons/react';
import { CATALOG_FILTERS, catalogProducts, filterFromParam, rangeNote, type CatalogFilter } from '@/lib/catalog';
import { CATALOG_COPY, WHEEL_COPY } from '@/lib/homeCopy';
import { OTHERS, hasPicture } from '@/lib/islands';
import { contactHref } from '@/lib/message';
import { QUOTE_ACTION } from '@/lib/quote';
import { RangePicture } from './RangePicture';

const SIZES = '(max-width: 47.5rem) 44vw, (max-width: 75rem) 30vw, 22vw';

/** Where a range's pill leads: the page on that range, or the page with all of them. */
const hrefOf = (id: CatalogFilter) => (id === 'all' ? '/products' : `/products?range=${id}`);

/**
 * Every product, one by one (round 54, the All products page): a pill for each range and Others with how many each
 * holds, a search by name, then the products in a grid, each standing in a soft pool of light with its range, its name
 * and a round arrow. A product opens its page in the sheet over this page, so Back returns here as it was. The range
 * picked lives in the address (?range=), so "See the range" on the home page opens here on it and Back keeps it.
 * The pills are links, so they work before scripts arrive too.
 */
export function Catalog() {
  const params = useSearchParams();
  const pathname = usePathname();
  // While a product's sheet is open over this page the address is the product's; the page keeps its own range.
  const kept = useRef<CatalogFilter>('all');
  if (pathname === '/products') kept.current = filterFromParam(params?.get('range'));
  const [query, setQuery] = useState('');
  return <CatalogView filter={kept.current} query={query} onQuery={setQuery} />;
}

/**
 * The page's content for a range and a search, with no reading of the address: what the server sends before scripts
 * (the page's Suspense fallback shows it for All) and what Catalog shows once they run.
 */
export function CatalogView({ filter, query = '', onQuery }: { filter: CatalogFilter; query?: string; onQuery?: (q: string) => void }) {
  const list = useMemo(() => catalogProducts(filter, query), [filter, query]);
  const note = rangeNote(filter);
  const showOthers = filter === 'all' || filter === 'others';

  return (
    <>
      <div className="cat__tools">
        <div className="cat__filters" role="group" aria-label="Ranges">
          {CATALOG_FILTERS.map((f) => (
            <Link key={f.id} href={hrefOf(f.id)} replace scroll={false} className="cat__filter" aria-current={f.id === filter ? 'true' : undefined}>
              {f.label}
              <sup>{f.count}</sup>
            </Link>
          ))}
        </div>
        {filter !== 'others' && (
          <label className="cat__search">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => onQuery?.(e.target.value)} readOnly={!onQuery} placeholder={CATALOG_COPY.search} aria-label={CATALOG_COPY.search} />
          </label>
        )}
      </div>
      {note && <p className="cat__note">{note}</p>}

      {filter !== 'others' &&
        (list.length ? (
          <ul className="cat__grid">
            {list.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.id}`} scroll={false} className="cat__item">
                  <span className={`cat__pool${p.bulb ? ' cat__pool--bulb' : ''}`}>{hasPicture(p) && <RangePicture p={p} sizes={SIZES} whole />}</span>
                  <span className="cat__text">
                    <span>
                      <span className="cat__range">{p.range.name}</span>
                      <span className="cat__name">{p.name}</span>
                    </span>
                    <span className="cat__arrow" aria-hidden="true">
                      <ArrowUpRight size={17} weight="bold" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cat__empty">{CATALOG_COPY.empty}</p>
        ))}

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
            <a href="/quote?for=other" className="textlink">
              {QUOTE_ACTION}
            </a>
          </div>
        </section>
      )}
      <p className="cat__pictures">{WHEEL_COPY.pictures}</p>
    </>
  );
}
