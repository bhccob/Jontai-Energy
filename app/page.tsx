import type { Viewport } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/home/Hero';
import { Rewards } from '@/components/home/Rewards';
import { Why } from '@/components/home/Why';
import { Collection } from '@/components/home/Collection';
import { Offer } from '@/components/home/Offer';
import { Team } from '@/components/home/Team';
import { Reviews } from '@/components/home/Reviews';
import { Visit } from '@/components/sections/Visit';
import { Footer } from '@/components/sections/Footer';
import { SkyScope } from '@/components/sky/SkyScope';

/** The browser's own bars match the deep green at the top of the home page. */
export const viewport: Viewport = { themeColor: '#0e2219' };

/**
 * Round 12, green first and in one voice (Bob, 2026-11-11, after squared-media and Novair): the first view on deep
 * green with the valley inside JONTAI; Jontai Rewards sliding over it; why the store is different; the six ranges as
 * a collection; what it offers; the people behind it; what customers say on Google; the visit; the footer. Each has
 * its own character and its own way of arriving, in two greens and the same type. Bundle offers sit in the header.
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
        <Why />
        <Collection />
        <Offer />
        <Team />
        <Reviews />
        <Visit />
      </main>
      <Footer />
    </CatalogProvider>
  );
}
