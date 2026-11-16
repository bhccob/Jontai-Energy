import type { Viewport } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/home/Hero';
import { Rewards } from '@/components/home/Rewards';
import { Solution } from '@/components/home/Solution';
import { Wheel } from '@/components/home/Wheel';
import { Team } from '@/components/home/Team';
import { Reviews } from '@/components/home/Reviews';
import { Visit } from '@/components/sections/Visit';
import { Footer } from '@/components/sections/Footer';
import { SkyScope } from '@/components/sky/SkyScope';

/** The browser's own bars match the forest green at the top of the home page (round 54; light green from round 47). */
export const viewport: Viewport = { themeColor: '#173d2c' };

/**
 * The order (round 54, Bob: "make everything better ordered"): 1. the first view, which What we sell slides up over
 * (the two share .cover, so the first view holds still only while What we sell covers it; Rewards did this from round
 * 37), 2. What we sell, the wheel, 3. what customers say on Google, under the wheel's green hem, 4. Our solution and
 * 5. Rewards, one white sheet, 6. the people behind it, 7. the visit and the footer. Each section has its own character
 * and its own way of arriving, in two greens and the same type.
 */
export default function Home() {
  return (
    <CatalogProvider>
      <Header sky />
      <main id="main" className="air">
        <div className="cover">
          <SkyScope>
            <Hero />
          </SkyScope>
          <Wheel />
        </div>
        <Reviews />
        <Solution />
        <Rewards />
        <Team />
        <Visit />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
