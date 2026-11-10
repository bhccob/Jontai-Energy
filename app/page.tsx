import type { Viewport } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/home/Hero';
import { Statement } from '@/components/home/Statement';
import { Showroom } from '@/components/home/Showroom';
import { Numbers } from '@/components/home/Numbers';
import { Loyalty } from '@/components/sections/Loyalty';
import { Visit } from '@/components/sections/Visit';
import { Footer } from '@/components/sections/Footer';
import { SkyScope } from '@/components/sky/SkyScope';

/** The browser's own bars match the top of the sky on the home page. */
export const viewport: Viewport = { themeColor: '#1c63c9' };

/**
 * Round 9 in open air (Bob, 2026-11-10: "use nature too since its related to clean energy"). Built in steps: the
 * first view under the sky is the test; Rewards, the islands of products and the store sections come next, and until
 * then the earlier sections follow the first view as they are.
 */
export default function Home() {
  return (
    <CatalogProvider>
      <Header sky />
      <main id="main">
        <SkyScope>
          <Hero />
        </SkyScope>
        <Statement />
        <Showroom />
        <Numbers />
        <Loyalty />
        <Visit />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
