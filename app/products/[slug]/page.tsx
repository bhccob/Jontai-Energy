import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { ProductDetail, pageOf } from '@/components/products/ProductDetail';
import { ScrollToTop } from '@/components/products/ScrollToTop';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/ui/Header';
import { PRODUCTS } from '@/lib/islands';

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = pageOf(params.slug);
  if (!page) return {};
  const { title, product } = page;
  return { title: `${title}${title === product.name ? '' : `, ${product.name.toLowerCase()}`} | Jontai Energy`, description: page.intro };
}

/**
 * A product's own page (round 41), on the collection's deep green: what a visitor sees who opens its link directly, or
 * reloads. From the home page the same product opens in a sheet over it instead (app/@modal, round 44). It always
 * opens at its top (ScrollToTop): the smooth scroll would otherwise keep the place the last page was scrolled to.
 */
export default function ProductPage({ params }: { params: { slug: string } }) {
  if (!pageOf(params.slug)) notFound();
  return (
    <CatalogProvider>
      <ScrollToTop />
      <Header base="/" />
      <main id="main" className="pp" data-tone="dark">
        <ProductDetail slug={params.slug} />
      </main>
      <Footer base="/" />
    </CatalogProvider>
  );
}
