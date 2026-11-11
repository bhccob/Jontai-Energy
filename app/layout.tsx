import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Archivo } from 'next/font/google';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { ConceptBanner } from '@/components/ui/ConceptBanner';
import { GlassLight } from '@/components/ui/GlassLight';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { PageMotion } from '@/components/motion/PageMotion';
import { CONCEPT, SITE_URL, STORE } from '@/lib/store';
import './globals.css';

// One family for everything: wide and heavy for headings, narrow (font-stretch 62%) for labels and big figures.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

// The owner's tab title (2026-10-28).
const title = 'Jontai Energy | Smart Lights Smart Savings';
const description =
  'A retail store at Cumana 73, Oranjestad: solar panels, inverters, generators, power stations, LED lighting, solar cameras and solar air conditioning, with furniture on the second floor. Large-item delivery available.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  // Link previews in chat apps and social posts never show the concept banner, so a concept build says it there too.
  openGraph: CONCEPT
    ? {
        type: 'website',
        title: 'Jontai Energy (concept redesign)',
        description: `A concept redesign, not the official Jontai Energy website. ${description}`,
        locale: 'en',
        siteName: 'Jontai Energy (concept redesign)',
      }
    : { type: 'website', title: 'Jontai Energy', description, locale: 'en', siteName: 'Jontai Energy' },
  // The store's leaf-and-house mark, built from its logo by tools/brand/icons.mjs.
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  // A concept build stays out of search results, so it is never mistaken for the store's own site.
  robots: CONCEPT ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: '#f7f5ec',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');
setTimeout(function(){if(!window.__jontaiReady)d.classList.remove('js')},8000)})()`;

// Verified business facts only (lib/store.ts). Hours confirmed by the owner on 2026-10-27.
const store = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: STORE.name,
  description,
  url: SITE_URL,
  telephone: STORE.phone,
  email: STORE.email,
  address: { '@type': 'PostalAddress', streetAddress: STORE.street, addressLocality: STORE.city, addressCountry: 'AW' },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '10:00', closes: '14:00' },
  ],
  sameAs: [STORE.facebook, STORE.instagram],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        {/* Before paint: mark scripting on, so motion's starting states apply only when motion will run. If the
            scripts never arrive (PageMotion sets __jontaiReady), the mark lifts after 8 seconds and the page shows
            complete, as it does without JavaScript. (Round 9 has no loader: the first view paints at once.) */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
        <RevealObserver />
        <PageMotion />
        <GlassLight />
        <ConceptBanner />
        {!CONCEPT && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(store) }} />}
      </body>
    </html>
  );
}
