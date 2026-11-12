// What the page tells the stage, shared between the sections (which know where the visitor is) and the scene (which
// draws): how far along the beats the scroll is (0 = first view, 1 = Rewards, ...), which range the visitor is
// pointing at, and whether the stage is covered by a section (then it stops drawing).

type Listener = () => void;

const state = { beat: 0, spot: null as string | null, covered: false };
const listeners = new Set<Listener>();
const tell = () => listeners.forEach((l) => l());

export const stageBus = {
  get: () => state,
  setBeat(beat: number) {
    if (beat === state.beat) return;
    state.beat = beat;
    tell();
  },
  /** The range id under the pointer or keyboard focus, or null. */
  setSpot(spot: string | null) {
    if (spot === state.spot) return;
    state.spot = spot;
    tell();
  },
  setCovered(covered: boolean) {
    if (covered === state.covered) return;
    state.covered = covered;
    tell();
  },
  /** Calls `l` on every change; returns the unsubscribe. */
  on(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
