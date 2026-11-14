import type { Viewport } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/home/Hero';
import { Rewards } from '@/components/home/Rewards';
import { Why } from '@/components/home/Why';
import { Collection } from '@/components/home/Collection';
import { Team } from '@/components/home/Team';
import { Reviews } from '@/components/home/Reviews';
import { Visit } from '@/components/sections/Visit';
import { Footer } from '@/components/sections/Footer';
import { SkyScope } from '@/components/sky/SkyScope';

/** The browser's own bars match the deep forest at the top of the home page (round 41: the valley in full colour). */
export const viewport: Viewport = { themeColor: '#12291d' };

/**
 * The order (Bob, round 25): the first view, which Jontai Rewards slides up over (round 37: the two share .cover, so
 * the first view holds still only while Rewards covers it); why the store is different; the
 * six ranges as a collection; what customers say on Google, right after the products; the people behind it; the
 * visit; the footer. ("What we offer" is gone: it repeated what the page and the menu already show.) Each section has
 * its own character and its own way of arriving, in two greens and the same type. Bundle offers sit in the header.
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
          <Rewards />
        </div>
        <Why />
        <Collection />
        <Reviews />
        <Team />
        <Visit />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
