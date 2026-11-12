import type { Metadata } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/sections/Footer';
import { Letter } from '@/components/forms/Letter';

export const metadata: Metadata = {
  title: 'Page not found | Jontai Energy',
  robots: { index: false, follow: true },
};

/**
 * A missing page, in the same look as the contact and quote pages (polish, round 30): what happened in one line, the
 * ways back, and the store's hours and details, so a mistyped link still ends with a way to reach the store.
 */
export default function NotFound() {
  return (
    <CatalogProvider>
      <Header base="/" />
      <Letter kicker="(Not found)" title={['This page', 'is not here.']} lead="The link may be old or mistyped. Everything the store sells is on the home page, and a person at the store can help with the rest.">
        <div className="lost">
          <a href="/" className="btn btn--primary">
            Go to the home page
          </a>
          <a href="/contact" className="btn btn--ghost">
            Send us a message
          </a>
        </div>
      </Letter>
      <Footer base="/" />
    </CatalogProvider>
  );
}
