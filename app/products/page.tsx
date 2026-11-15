import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Catalog, CatalogView } from '@/components/products/Catalog';
import { pageOf } from '@/components/products/ProductDetail';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/ui/Header';
import { shortInfo, type ShortInfo } from '@/lib/catalog';
import { CATALOG_COPY } from '@/lib/homeCopy';
import { PRODUCTS } from '@/lib/islands';

export const metadata: Metadata = {
  title: 'All products | Jontai Energy',
  description: CATALOG_COPY.line,
};

/** Each product told briefly, from its full page, for the short info it opens here (made once, on the server). */
const INFO: Record<string, ShortInfo> = Object.fromEntries(
  PRODUCTS.flatMap((p) => {
    const page = pageOf(p.id);
    return page ? [[p.id, shortInfo(page)]] : [];
  }),
);

/**
 * All products (round 54, Bob: "seperate dedicated page that display all the products individually", then "only to
 * view"): every product on the light ground, by range, each opening its short info (Catalog). The home page's wheel and
 * its ranges lead here.
 */
export default function ProductsPage() {
  return (
    <CatalogProvider>
      <Header base="/" />
      <main id="main" className="cat">
        <header className="cat__head">
          <h1 className="cat__title" data-i18n-ctx="catalog-title">
            {`${CATALOG_COPY.title[0]} `}
            <b>{CATALOG_COPY.title[1]}</b>
          </h1>
          <p className="cat__line">{CATALOG_COPY.line}</p>
        </header>
        {/* Reading ?range= needs the visitor's address, so the server sends the page with All, and the range picked
            replaces it as soon as scripts run. */}
        <Suspense fallback={<CatalogView filter="all" />}>
          <Catalog info={INFO} />
        </Suspense>
      </main>
      <Footer base="/" />
    </CatalogProvider>
  );
}
