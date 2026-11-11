// The people behind Jontai Energy (Bob, 2026-11-11). Titles from what each leads: Bob Chung the design, Chakho Chung
// the ideas and the technical side, each at the top of it. Photos: public/team, cropped to head and shoulders.
// The second row holds places for three more people (Bob, round 13: CEO / Founder, CTO, manager) until they have
// names and photos; a place with no photo shows as a placeholder.

export interface Person {
  name: string;
  role: string;
  photo?: string;
}

export const TEAM: Person[] = [
  { name: 'Chakho Chung', role: 'Concept & Technical Director', photo: '/team/chakho-chung.webp' },
  { name: 'Bob Chung', role: 'Creative Director', photo: '/team/bob-chung.webp' },
];

/** Places for people still to be named. */
export const TEAM_TO_COME: Person[] = [
  { name: 'CEO / Founder', role: 'Name and photo to come' },
  { name: 'CTO', role: 'Name and photo to come' },
  { name: 'Store Manager', role: 'Name and photo to come' },
];

/** The message an applicant sends on WhatsApp. */
export const APPLY_MESSAGE = 'Hello Jontai Energy, I would like to work with you. Here is a little about me:';
