import type { Viewport } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/home/Hero';
import { Rewards } from '@/components/home/Rewards';
import { Islands } from '@/components/home/Islands';
import { Statement } from '@/components/home/Statement';
import { Visit } from '@/components/sections/Visit';
import { Footer } from '@/components/sections/Footer';
import { SkyScope } from '@/components/sky/SkyScope';

/** The browser's own bars match the forest green at the top of the home page. */
export const viewport: Viewport = { themeColor: '#173d2c' };

/**
 * Round 9 in open air, green first (Bob, 2026-11-10: "use nature too since its related to clean energy", "i do want
 * the main color to be green tho"). The first view in a green valley with the solar island; Jontai Rewards next; the
 * six ranges as islands lower down; the store's three promises; the visit; the original footer. Bundle offers sit in
 * the header.
 */
export default function Home() {
  return (
    <CatalogProvider>
      <Header sky />
      <main id="main" className="air">
        <SkyScope>
          <Hero />
        </SkyScope>
        <Rewards />
        <Islands />
        <Statement />
        <Visit />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
