import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Lab } from '@/components/stage/Lab';

export const metadata: Metadata = { title: 'Stage lab', robots: { index: false, follow: false } };

/** Development only: judge a Blender product in the web renderer. Not part of the production site. */
export default function LabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Lab />;
}
