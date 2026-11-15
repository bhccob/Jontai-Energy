// The first view's four facts (round 54, Bob picked "C and rewards slides over"): hours, the store, what we sell and
// Jontai Rewards, each a strong part and the rest of the line.
import { REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl } from './loyalty.ts';

export interface Fact {
  strong: string;
  rest: string;
}

/** The open-now line split for the facts row: "Open now" strong, ", until 7:00 PM" after it. */
export function hoursFact(line: string): Fact {
  const at = line.indexOf(', ');
  return at < 0 ? { strong: line, rest: '' } : { strong: line.slice(0, at), rest: line.slice(at) };
}

/** What the home card gives back: "Afl. 25 back" for every "Afl. 500" (lib/loyalty). */
export const REWARDS_FACT: Fact = {
  strong: `${formatAfl(REWARD_PER_STEP_AFL)} back`,
  rest: `for every ${formatAfl(REWARD_STEP_AFL)}`,
};
