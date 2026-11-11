'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Briefcase, Coins, House, IdentificationCard, Percent, Receipt, ShoppingBag, Storefront, Target, Ticket } from '@phosphor-icons/react';
import { BusinessFace, LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLogin } from '@/components/sections/MemberLogin';
import { Words } from '@/components/ui/Split';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, businessCard, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';

type Kind = 'home' | 'business';

/** The home card face shows ten vouchers, so its slider runs to Afl. 5,000. */
const MAX_SPEND = 5000;
const SLOTS = MAX_SPEND / REWARD_STEP_AFL;
/** The business slider runs a little past the goal, so the ring can be seen to close. */
const MAX_POINTS = 6000;
/** Quick amounts for "Try your numbers". */
const PICKS: Record<Kind, number[]> = { home: [500, 1000, 2500, 5000], business: [1000, 2500, 4000, 5000] };
/** How long each step of "How it works" holds before the next, while no one has taken over. */
const STEP_MS = 4200;

const STEPS: Record<Kind, { icon: typeof House; title: string; text: string }[]> = {
  home: [
    { icon: IdentificationCard, title: 'Join at the counter', text: 'Open your membership in store at Cumana 73 and take your card home. The code on it is your member login.' },
    { icon: ShoppingBag, title: 'Shop as usual', text: 'Everything you buy in a year adds up on your card. Nothing to scan, nothing to remember.' },
    {
      icon: Coins,
      title: `Every ${formatAfl(REWARD_STEP_AFL)} earns ${formatAfl(REWARD_PER_STEP_AFL)}`,
      text: `Each full ${formatAfl(REWARD_STEP_AFL)} you spend puts a ${formatAfl(REWARD_PER_STEP_AFL)} voucher on your card.`,
    },
    { icon: Ticket, title: 'Spend your vouchers', text: 'Use them as store credit on your next visit, on anything in the store.' },
  ],
  business: [
    { icon: Briefcase, title: 'Join as a business', text: 'Open a business membership at the counter at Cumana 73. The code on your card is your member login.' },
    { icon: ShoppingBag, title: 'Buy for your business', text: 'What your business buys during the year earns points on its card.' },
    { icon: Target, title: `Reach ${formatPoints(BUSINESS_GOAL)}`, text: `The ring on the card closes at ${formatPoints(BUSINESS_GOAL)}.` },
    {
      icon: Percent,
      title: `${BUSINESS_DISCOUNT}% off, all year`,
      text: `From then on your business gets ${BUSINESS_DISCOUNT}% off until the account's anniversary, when the points start again at 0.`,
    },
  ],
};

const FACTS = [
  { icon: Receipt, text: 'Vouchers are store credit and cannot be exchanged for cash.' },
  { icon: Coins, text: 'Home rewards build up through the year and start again one year after you join.' },
  { icon: Storefront, text: `Business points reset to 0 on the account's anniversary; the ${BUSINESS_DISCOUNT}% off runs until then.` },
  { icon: IdentificationCard, text: 'How many points a purchase earns, the full terms and the exact dates are confirmed at the counter.' },
];

/** The home card as a year of spending fills it: a sun for every voucher earned, the next one filling. */
function VoucherFace({ spend }: { spend: number }) {
  const r = rewardFor(spend);
  return (
    <div className="lcard__body" data-tone="sand">
      <div className="lcard__top">
        <span className="lcard__brand">
          Jontai <span>Energy</span>
        </span>
        <span className="lcard__tier">Rewards member</span>
      </div>
      <ol className="lcard__stamps">
        {Array.from({ length: SLOTS }, (_, i) => (
          <li
            key={i}
            className="lcard__stamp"
            data-state={i < r.vouchers ? 'earned' : i === r.vouchers ? 'next' : 'empty'}
            style={{ '--p': i === r.vouchers ? 1 - r.toNext / REWARD_STEP_AFL : 0 } as CSSProperties}
          />
        ))}
      </ol>
      <div className="lcard__bottom">
        <span className="lcard__field">
          <span className="lcard__label">In vouchers</span>
          <span className="lcard__figure">{formatAfl(r.back)}</span>
        </span>
        <span className="lcard__field lcard__field--end">
          <span className="lcard__label">Spent this year</span>
          <span className="lcard__value">{formatAfl(spend)}</span>
        </span>
      </div>
    </div>
  );
}

/** The other side of a card, once its reward is in hand. */
function RewardBack({ kind }: { kind: Kind }) {
  return (
    <div className="lcard__body loyal__back" data-tone="forest">
      <div className="lcard__top">
        <span className="lcard__brand">
          Jontai <span>Energy</span>
        </span>
        <span className="lcard__tier">{kind === 'home' ? 'Voucher' : 'Business member'}</span>
      </div>
      <p className="loyal__back-amount">{kind === 'home' ? formatAfl(REWARD_PER_STEP_AFL) : `${BUSINESS_DISCOUNT}% off`}</p>
      <p className="loyal__back-text">
        {kind === 'home' ? 'Store credit on your next visit, on anything in the store.' : "On everything your business buys, until the account's anniversary."}
      </p>
    </div>
  );
}

/** Runs a number from `from` to `to` over `ms`, eased, calling `set` each frame; returns a stop. */
function run(from: number, to: number, ms: number, set: (v: number) => void) {
  let raf = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    set(Math.round((from + (to - from) * (1 - Math.pow(1 - p, 3))) / 10) * 10);
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** What the card holds at each step of "How it works", per program: [start, end] of the number it shows. */
const STAGES: Record<Kind, [number, number][]> = {
  home: [
    [0, 0],
    [0, 450],
    [450, 500],
    [500, 500],
  ],
  business: [
    [0, 0],
    [0, 3800],
    [3800, 5000],
    [5000, 5000],
  ],
};

/**
 * Jontai Rewards, for homes and for businesses (Bob, rounds 13 and 14): first who it is for, then the card with two
 * ways in. "How it works" walks through the four steps on the card itself, one after another by itself while no one
 * has taken over, with a bar for how long each holds; any step can be picked. "Try your numbers" fills the card from a
 * year's spending (home, in florins) or points (business, since the points rate per florin is confirmed in store), with
 * quick amounts and a slider. When a reward lands it rises off the card. The small print sits under "Good to know".
 * Reduced motion: no auto-play, no counting.
 */
export function Rewards() {
  const id = useId();
  const [kind, setKind] = useState<Kind>('home');
  const [mode, setMode] = useState<'how' | 'try'>('how');
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [value, setValue] = useState(0);
  const [pop, setPop] = useState(0);
  const [seen, setSeen] = useState(false);
  const section = useRef<HTMLElement>(null);
  const last = useRef(0);
  const calm = useRef(false);

  // A reward landing (a voucher, or the business goal) rises off the card.
  useEffect(() => {
    const won = kind === 'home' ? rewardFor(value).vouchers : businessCard(value).reached ? 1 : 0;
    if (won > last.current) setPop((n) => n + 1);
    last.current = won;
  }, [value, kind]);

  // Only plays while the section is on screen.
  useEffect(() => {
    calm.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // What the card shows at each step of "How it works".
  useEffect(() => {
    if (mode !== 'how') return;
    const [from, to] = STAGES[kind][step];
    if (from === to || calm.current) {
      setValue(to);
      return;
    }
    return run(from, to, step === 1 ? 1800 : 600, setValue);
  }, [kind, mode, step]);

  // The steps move on by themselves while the section is in view and no one has taken over.
  useEffect(() => {
    if (mode !== 'how' || !auto || !seen || calm.current) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS[kind].length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [kind, mode, step, auto, seen]);

  const pick = useCallback((i: number) => {
    setAuto(false);
    setStep(i);
  }, []);
  const choose = (k: Kind) => {
    if (k === kind) return;
    last.current = 0;
    setKind(k);
    setStep(0);
    setAuto(true);
    if (mode === 'try') setValue(k === 'home' ? 2000 : 2500);
  };
  const openTry = () => {
    setMode('try');
    setValue(kind === 'home' ? 2000 : 2500);
  };

  const steps = STEPS[kind];
  const home = kind === 'home';
  const r = rewardFor(value);
  const b = businessCard(value);
  const max = home ? MAX_SPEND : MAX_POINTS;
  const flipped = mode === 'how' && step === steps.length - 1;
  const nextVoucher = Math.min(SLOTS, r.vouchers + 1) * REWARD_STEP_AFL;

  return (
    <section ref={section} id="rewards" className="loyal" aria-labelledby="rewards-title">
      <div className="loyal__head">
        <p className="loyal__kicker">Jontai Rewards</p>
        <h2 id="rewards-title" className="air-display loyal__title" key={kind} data-kind={kind}>
          {home ? (
            <>
              <span>
                <Words text={`Spend ${formatAfl(REWARD_STEP_AFL)}.`} />
              </span>{' '}
              <span className="soft">
                <Words text={`Get ${formatAfl(REWARD_PER_STEP_AFL)} back.`} />
              </span>
            </>
          ) : (
            <>
              <span>
                <Words text={`${formatPoints(BUSINESS_GOAL)}.`} />
              </span>{' '}
              <span className="soft">
                <Words text={`${BUSINESS_DISCOUNT}% off all year.`} />
              </span>
            </>
          )}
        </h2>
        <p className="loyal__sub" data-reveal>
          {home
            ? `A voucher for every ${formatAfl(REWARD_STEP_AFL)} you spend in a year, to use on your next visit.`
            : `For business customers: reach ${formatPoints(BUSINESS_GOAL)} in a year and get ${BUSINESS_DISCOUNT}% off for the rest of it.`}{' '}
          See how it works, or try your own numbers.
        </p>
      </div>

      <div className="loyal__for" role="radiogroup" aria-label="Who the rewards are for">
        <span className="loyal__for-label">Rewards for</span>
        <button type="button" role="radio" aria-checked={home} onClick={() => choose('home')}>
          <House size={18} weight={home ? 'fill' : 'regular'} aria-hidden="true" /> Your home
        </button>
        <button type="button" role="radio" aria-checked={!home} onClick={() => choose('business')}>
          <Briefcase size={18} weight={!home ? 'fill' : 'regular'} aria-hidden="true" /> Your business
        </button>
      </div>

      <div className="loyal__stage">
        <div className="loyal__panel">
          <div className="loyal__tabs" role="tablist" aria-label="Jontai Rewards">
            <button type="button" role="tab" id={`${id}-how`} aria-selected={mode === 'how'} aria-controls={`${id}-how-panel`} onClick={() => setMode('how')}>
              How it works
            </button>
            <button type="button" role="tab" id={`${id}-try`} aria-selected={mode === 'try'} aria-controls={`${id}-try-panel`} onClick={openTry}>
              Try your numbers
            </button>
            <span className="loyal__tabs-ink" data-at={mode} aria-hidden="true" />
          </div>

          {mode === 'how' ? (
            <div id={`${id}-how-panel`} role="tabpanel" aria-labelledby={`${id}-how`} className="loyal__how" key={kind}>
              <ol className="loyal__steps">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.title} data-on={i === step || undefined} data-done={i < step || undefined}>
                      <button type="button" className="loyal__step" aria-current={i === step ? 'step' : undefined} onClick={() => pick(i)}>
                        <span className="loyal__step-bar" aria-hidden="true">
                          <i style={{ '--ms': `${STEP_MS}ms` } as CSSProperties} data-run={(i === step && auto && seen) || undefined} />
                        </span>
                        <span className="loyal__step-head">
                          <Icon size={22} weight="light" aria-hidden="true" />
                          <span className="loyal__step-num">{String(i + 1).padStart(2, '0')}</span>
                          <span className="loyal__step-title">{s.title}</span>
                        </span>
                        <span className="loyal__step-text">
                          <span>{s.text}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button type="button" className="loyal__next" onClick={() => pick((step + 1) % steps.length)}>
                {step === steps.length - 1 ? 'Start again' : 'Next step'} <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div id={`${id}-try-panel`} role="tabpanel" aria-labelledby={`${id}-try`} className="loyal__try">
              <label className="loyal__ask" htmlFor={`${id}-value`}>
                {home ? 'What do you spend at Jontai in a year?' : 'How many points does your business earn in a year?'}
              </label>
              <p className="loyal__spend figure">{home ? formatAfl(value) : formatPoints(value)}</p>
              <div className="loyal__picks" role="group" aria-label="Quick amounts">
                {PICKS[kind].map((v) => (
                  <button key={v} type="button" data-on={value === v || undefined} onClick={() => setValue(v)}>
                    {home ? formatAfl(v) : formatPoints(v)}
                  </button>
                ))}
              </div>
              <input
                id={`${id}-value`}
                className="slider loyal__slider"
                type="range"
                min={0}
                max={max}
                step={100}
                value={value}
                aria-valuetext={home ? `${formatAfl(value)} a year, ${formatAfl(r.back)} back` : `${formatPoints(value)}, ${b.reached ? `${BUSINESS_DISCOUNT}% off reached` : `${formatPoints(b.toGoal)} to go`}`}
                onChange={(e) => setValue(Number(e.target.value))}
                style={{ '--fill': `${(value / max) * 100}%` } as CSSProperties}
              />
              <div className="loyal__result" aria-live="polite">
                {home ? (
                  <>
                    <p className="loyal__back-line">
                      You get <strong className="figure">{formatAfl(r.back)}</strong> back
                    </p>
                    <p className="loyal__meta">
                      {r.vouchers} {r.vouchers === 1 ? 'voucher' : 'vouchers'}
                      {value < MAX_SPEND ? ` · ${formatAfl(r.toNext)} more to the next one` : ' · every voucher on the card'}
                    </p>
                    {value < MAX_SPEND && (
                      <span className="loyal__next-bar" aria-hidden="true">
                        <i style={{ '--p': `${100 - (r.toNext / REWARD_STEP_AFL) * 100}%` } as CSSProperties} />
                        <span>{formatAfl(nextVoucher)}</span>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <p className="loyal__back-line">
                      {b.reached ? (
                        <>
                          <strong className="figure">{BUSINESS_DISCOUNT}% off</strong> for the rest of the year
                        </>
                      ) : (
                        <>
                          <strong className="figure">{formatPoints(b.toGoal)}</strong> to {BUSINESS_DISCOUNT}% off
                        </>
                      )}
                    </p>
                    <p className="loyal__meta">
                      {b.reached ? "Until the account's anniversary, when the points start again." : `${Math.round(b.fraction * 100)}% of the way to ${formatPoints(BUSINESS_GOAL)}.`}
                    </p>
                    <span className="loyal__next-bar" aria-hidden="true">
                      <i style={{ '--p': `${b.fraction * 100}%` } as CSSProperties} />
                      <span>{formatPoints(BUSINESS_GOAL)}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="loyal__actions">
            <MemberLogin />
            <a href="#visit" className="btn btn--ghost">
              Join at the counter
            </a>
          </div>
        </div>

        <div className="loyal__card" data-swing>
          <LoyaltyCard flipped={flipped} front={home ? <VoucherFace spend={value} /> : <BusinessFace points={value} />} back={<RewardBack kind={kind} />} />
          {pop > 0 && (
            <span key={`${kind}-${pop}`} className="loyal__pop" aria-hidden="true">
              {home ? `+ ${formatAfl(REWARD_PER_STEP_AFL)}` : `${BUSINESS_DISCOUNT}% off unlocked`}
            </span>
          )}
          <p className="loyal__caption" aria-hidden="true">
            {mode === 'how' ? `Step ${step + 1} of ${steps.length}` : home ? `${formatAfl(value)} spent this year` : `${formatPoints(value)} this year`}
          </p>
        </div>
      </div>

      <details className="loyal__facts">
        <summary>
          Good to know <span aria-hidden="true">+</span>
        </summary>
        <ul>
          {FACTS.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.text}>
                <Icon size={22} weight="light" aria-hidden="true" />
                {f.text}
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
