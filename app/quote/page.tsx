import type { Metadata } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/sections/Footer';
import { Letter } from '@/components/forms/Letter';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { topicsFrom } from '@/lib/quote';

export const metadata: Metadata = {
  title: 'Request a quote | Jontai Energy',
  description: 'Ask Jontai Energy for current prices and stock on solar, power, lighting, cameras and furniture. Your request goes to the store by email.',
};

/** A quote request by email. `?for=` preselects what it is for (the product panels and chapters link here with one). */
export default function QuotePage({ searchParams }: { searchParams: { for?: string | string[] } }) {
  return (
    <CatalogProvider>
      <Header base="/" />
      <Letter kicker="(Quote)" title={['Request', 'a quote.']} lead="Tell us what you need. Jontai Energy replies by email with current prices and what is in stock.">
        <QuoteForm initial={topicsFrom(searchParams.for)} />
      </Letter>
      <Footer base="/" />
    </CatalogProvider>
  );
}
