import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { FILES, type Pictured } from '@/lib/islands';

/** How wide a product's frame shows: half the screen when the ranges stack, about a third of it beside the words. */
const SIZES = '(max-width: 60rem) 46vw, 30vw';

/**
 * One product: its picture standing in a frame of dark glass, its name and line under it. It leads to the product's own
 * page (round 41). Nothing in it can be dragged out as a picture or a link, so a slide (ProductRail) drags cleanly.
 */
export function ProductTile({ p }: { p: Pictured }) {
  return (
    // scroll={false}: the product opens in a sheet over the page (round 44), so the page under it must not move; left
    // to itself the router scrolls down to where the sheet sits in the document, the foot of the page.
    <Link href={`/products/${p.id}`} className="product__open" draggable={false} scroll={false}>
      <span className="product__frame" aria-hidden="true">
        <ProductPicture p={p} sizes={SIZES} />
      </span>
      <span className="product__text">
        <span className="product__name">
          {p.name}
          <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
        </span>
        <span className="product__line">{p.line}</span>
      </span>
    </Link>
  );
}

/** The product's picture, sized to its frame (--ar). */
export function ProductPicture({ p, sizes, eager = false }: { p: Pictured; sizes: string; eager?: boolean }) {
  const [small, large] = p.files ?? FILES;
  const src = (name: string) => ({
    src: `/sky/range-${name}-${large}.webp`,
    srcSet: `/sky/range-${name}-${small}.webp ${small}w, /sky/range-${name}-${large}.webp ${p.size[0]}w`,
  });
  const loading = eager ? 'eager' : 'lazy';
  return (
    <span className="product__pic" style={{ '--ar': p.size[0] / p.size[1] } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...src(p.image)} sizes={sizes} alt="" width={p.size[0]} height={p.size[1]} loading={loading} decoding="async" draggable={false} />
    </span>
  );
}
