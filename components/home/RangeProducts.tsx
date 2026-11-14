import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { hasPicture, type Product } from '@/lib/islands';
import { ProductRail } from './ProductRail';
import { ProductTile } from './ProductTile';

/**
 * A range's products (the home page's rows and a product page's "More in"): those with a picture each in its frame, two
 * in view, more sliding sideways (round 40, ProductRail); under them, as ruled lines of words like the Others row, those
 * with no picture yet (round 52: the indoor camera), each leading to its own page.
 */
export function RangeProducts({ products, labelledBy }: { products: Product[]; labelledBy: string }) {
  const pictured = products.filter(hasPicture);
  const words = products.filter((p) => !hasPicture(p));
  const tiles = pictured.map((p) => (
    <li key={p.id} className="product" data-bulb={p.bulb || undefined} data-rise={p.rise || undefined}>
      <ProductTile p={p} />
    </li>
  ));
  return (
    <div className="range__shelf">
      {pictured.length > 2 ? (
        <ProductRail count={pictured.length} labelledBy={labelledBy}>
          {tiles}
        </ProductRail>
      ) : (
        pictured.length > 0 && (
          <ul className="range__products" aria-labelledby={labelledBy}>
            {tiles}
          </ul>
        )
      )}
      {words.length > 0 && (
        <ul className="others range__words" aria-labelledby={labelledBy}>
          {words.map((p) => (
            <li key={p.id} className="others__item">
              {/* scroll={false}: it opens in the sheet over the page, like the tiles (ProductTile). */}
              <Link href={`/products/${p.id}`} className="others__open" scroll={false}>
                <span className="others__name">
                  {p.name}
                  <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                </span>
                <span className="others__line">{p.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
