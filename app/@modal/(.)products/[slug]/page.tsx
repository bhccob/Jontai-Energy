import { notFound } from 'next/navigation';
import { ProductDetail, pageOf } from '@/components/products/ProductDetail';
import { ProductSheet } from '@/components/products/ProductSheet';
import { PRODUCTS } from '@/lib/islands';

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.id }));
}

/**
 * A product opened from inside the site (round 44): the same product page, in a sheet over the page the visitor came
 * from, so going back closes the sheet and never reloads the home page (ProductSheet). A product's link opened directly
 * gets app/products/[slug] instead.
 */
export default function ProductSheetPage({ params }: { params: { slug: string } }) {
  if (!pageOf(params.slug)) notFound();
  return (
    <ProductSheet>
      <ProductDetail slug={params.slug} />
    </ProductSheet>
  );
}
