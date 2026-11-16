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
 * The order (round 54, Bob: "make everything better ordered", then "do your order"): 1. the first view, which What we
 * sell slides up over (the two share .cover, so the first view holds still only while What we sell covers it; Rewards
 * did this from round 37), 2. What we sell, the wheel, 3. Our solution, under the wheel's green hem: why buy here,
 * 4. what customers say on Google, the proof of it, 5. Rewards, a reason to come back, 6. the people behind it, 7. the
 * visit and the footer. White and mist take turns between the two greens, so each section reads as its own.
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
        <Solution />
        <Reviews />
        <Rewards />
        <Team />
        <Visit />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
