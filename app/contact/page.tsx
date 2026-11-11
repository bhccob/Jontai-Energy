import type { Metadata } from 'next';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/sections/Footer';
import { Letter } from '@/components/forms/Letter';
import { ContactForm } from '@/components/contact/ContactForm';
import { topicFrom } from '@/lib/message';

export const metadata: Metadata = {
  title: 'Contact | Jontai Energy',
  description: 'Send Jontai Energy a message: a question, Jontai Rewards, bundle offers, an order, or working with us. A person at the store replies by email.',
};

/** A message to the store by email (Bob, round 18). `?about=` preselects the topic (Rewards, Team and the offers link here). */
export default function ContactPage({ searchParams }: { searchParams: { about?: string | string[] } }) {
  return (
    <CatalogProvider>
      <Header base="/" />
      <Letter kicker="(Contact)" title={['Send us', 'a message.']} lead="A question, your rewards card, an order, or a place on the team. A person at the store reads it and replies by email.">
        <ContactForm initial={topicFrom(searchParams.about)} />
      </Letter>
      <Footer base="/" />
    </CatalogProvider>
  );
}
