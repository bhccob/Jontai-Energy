import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Catalog } from '@/components/products/Catalog';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/ui/Header';
import { CATALOG_COPY } from '@/lib/homeCopy';

export const metadata: Metadata = {
  title: 'All products | Jontai Energy',
  description: CATALOG_COPY.line,
};

/**
 * All products (round 54, Bob: "seperate dedicated page that display all the products individually"): every product
 * on the light ground, filtered by range or found by name (Catalog). The home page's wheel and its ranges lead here.
 */
export default function ProductsPage() {
  return (
    <CatalogProvider>
      <Header base="/" />
      <main id="main" className="cat">
        <header className="cat__head">
          <h1 className="cat__title" data-i18n-ctx="catalog-title">
            {CATALOG_COPY.title[0]} <b>{CATALOG_COPY.title[1]}</b>
          </h1>
          <p className="cat__line">{CATALOG_COPY.line}</p>
        </header>
        <Suspense fallback={null}>
          <Catalog />
        </Suspense>
      </main>
      <Footer base="/" />
    </CatalogProvider>
  );
}
