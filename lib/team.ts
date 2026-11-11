// Two of the people behind Jontai Energy (Bob, 2026-11-11). Titles from what each leads: Bob Chung the design, Chakho
// Chung the ideas and the technical side, each at the top of it. Photos: public/team, cropped to head and shoulders.

export interface Person {
  name: string;
  role: string;
  photo: string;
}

export const TEAM: Person[] = [
  { name: 'Chakho Chung', role: 'Concept & Technical Director', photo: '/team/chakho-chung.webp' },
  { name: 'Bob Chung', role: 'Creative Director', photo: '/team/bob-chung.webp' },
];
