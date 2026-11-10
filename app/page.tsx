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
import { StageScope } from '@/components/stage/StageScope';

/** The browser's own bars match the night field on the home page. */
export const viewport: Viewport = { themeColor: '#0f281d' };

/**
 * Round 9, "After hours" (docs/superpowers/specs/2026-11-10-after-hours-home-design.md). Built in steps: the first view
 * on the stage is done; Rewards, the product walk and the night store sections come next, and until then the earlier
 * sections follow the first view as they are.
 */
export default function Home() {
  return (
    <CatalogProvider>
      <Header night />
      <main id="main">
        <StageScope>
          <Hero />
        </StageScope>
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
