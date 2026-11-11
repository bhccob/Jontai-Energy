// The people behind Jontai Energy (Bob, 2026-11-11). Titles as Bob gave them. Photos: public/team, cropped to head
// and shoulders; a person without a photo yet shows a placeholder until one is added here.

export interface Person {
  name: string;
  role: string;
  photo?: string;
}

/** In the order the team row shows them: the two with photos first, the others slide in after them. */
export const TEAM: Person[] = [
  { name: 'Chakho Chung', role: 'Chief Technology Officer', photo: '/team/chakho-chung.webp' },
  { name: 'Bob Chung', role: 'Creative Designer', photo: '/team/bob-chung.webp' },
  { name: 'Lily', role: 'Founder / CEO' },
  { name: 'Chi Wai', role: 'Chief Financial Officer' },
  { name: 'Benny', role: 'Chief Operating Officer' },
];

/** The message an applicant sends on WhatsApp. */
export const APPLY_MESSAGE = 'Hello Jontai Energy, I would like to work with you. Here is a little about me:';
