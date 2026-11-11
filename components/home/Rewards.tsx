'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Coins, IdentificationCard, Receipt, ShoppingBag, Storefront, Ticket } from '@phosphor-icons/react';
import { LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLogin } from '@/components/sections/MemberLogin';
import { Words } from '@/components/ui/Split';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';

/** The card face shows ten vouchers, so the slider runs to Afl. 5,000. */
const MAX_SPEND = 5000;
const SLOTS = MAX_SPEND / REWARD_STEP_AFL;
/** Quick amounts for "Try your numbers". */
const PICKS = [500, 1000, 2500, 5000];
/** How long each step of "How it works" holds before the next, while no one has taken over. */
const STEP_MS = 4200;

const STEPS = [
  {
    icon: IdentificationCard,
    title: 'Join at the counter',
    text: 'Open your membership in store at Cumana 73 and take your card home. The code on it is your member login.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop as usual',
    text: 'Everything you buy in a year adds up on your card. Nothing to scan, nothing to remember.',
  },
  {
    icon: Coins,
    title: `Every ${formatAfl(REWARD_STEP_AFL)} earns ${formatAfl(REWARD_PER_STEP_AFL)}`,
    text: `Each full ${formatAfl(REWARD_STEP_AFL)} you spend puts a ${formatAfl(REWARD_PER_STEP_AFL)} voucher on your card.`,
  },
  {
    icon: Ticket,
    title: 'Spend your vouchers',
    text: 'Use them as store credit on your next visit, on anything in the store.',
  },
];

const FACTS = [
  { icon: Receipt, text: 'Vouchers are store credit and cannot be exchanged for cash.' },
  { icon: Coins, text: 'Your rewards build up through the year and start again one year after you join.' },
  { icon: Storefront, text: `Business customers reach ${formatPoints(BUSINESS_GOAL)} for ${BUSINESS_DISCOUNT}% off for the rest of the year.` },
  { icon: IdentificationCard, text: 'Full terms and the exact reset date are confirmed at the counter.' },
];

/** The card as a year of spending fills it: a sun for every voucher earned, the next one filling. */
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

/** The other side: one voucher, ready to spend. */
function VoucherBack() {
  return (
    <div className="lcard__body loyal__back" data-tone="forest">
      <div className="lcard__top">
        <span className="lcard__brand">
          Jontai <span>Energy</span>
        </span>
        <span className="lcard__tier">Voucher</span>
      </div>
      <p className="loyal__back-amount">{formatAfl(REWARD_PER_STEP_AFL)}</p>
      <p className="loyal__back-text">Store credit on your next visit, on anything in the store.</p>
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

/**
 * Jontai Rewards, rebuilt so no one gets lost (Bob, round 13): the one rule in big type, then the card with two ways
 * in. "How it works" walks through the four steps on the card itself (a blank card, the year adding up, a voucher
 * landing, the voucher turned over to spend), one after another by itself while no one has taken over, with a bar
 * showing how long each holds; any step can be picked. "Try your numbers" fills the card from a year's spending, with
 * quick amounts and a slider, and says what comes back and how far the next voucher is. A "+ Afl. 25" rises off the
 * card whenever a voucher lands. The small print sits under "Good to know". Reduced motion: no auto-play, no counting.
 */
export function Rewards() {
  const id = useId();
  const [mode, setMode] = useState<'how' | 'try'>('how');
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [spend, setSpend] = useState(0);
  const [pop, setPop] = useState(0);
  const [seen, setSeen] = useState(false);
  const section = useRef<HTMLElement>(null);
  const last = useRef(0);
  const calm = useRef(false);

  // A voucher landing: a "+ Afl. 25" rises off the card.
  useEffect(() => {
    const v = rewardFor(spend).vouchers;
    if (v > last.current) setPop((n) => n + 1);
    last.current = v;
  }, [spend]);

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
    if (step === 0) setSpend(0);
    if (step === 1) return calm.current ? setSpend(450) : run(0, 450, 1800, setSpend);
    if (step === 2) return calm.current ? setSpend(500) : run(450, 500, 500, setSpend);
    if (step === 3) setSpend(500);
  }, [mode, step]);

  // The steps move on by themselves while the section is in view and no one has taken over.
  useEffect(() => {
    if (mode !== 'how' || !auto || !seen || calm.current) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [mode, step, auto, seen]);

  const pick = useCallback((i: number) => {
    setAuto(false);
    setStep(i);
  }, []);
  const tryIt = (v: number) => {
    setMode('try');
    setSpend(v);
  };

  const r = rewardFor(spend);
  const flipped = mode === 'how' && step === 3;
  const next = Math.min(SLOTS, r.vouchers + 1) * REWARD_STEP_AFL;

  return (
    <section ref={section} id="rewards" className="loyal" aria-labelledby="rewards-title">
      <div className="loyal__head">
        <p className="loyal__kicker">Jontai Rewards</p>
        <h2 id="rewards-title" className="air-display loyal__title" data-words>
          <span>
            <Words text={`Spend ${formatAfl(REWARD_STEP_AFL)}.`} />
          </span>{' '}
          <span className="soft">
            <Words text={`Get ${formatAfl(REWARD_PER_STEP_AFL)} back.`} />
          </span>
        </h2>
        <p className="loyal__sub" data-reveal>
          A voucher for every {formatAfl(REWARD_STEP_AFL)} you spend in a year, to use on your next visit. See how it works, or try your own numbers.
        </p>
      </div>

      <div className="loyal__stage">
        <div className="loyal__panel">
          <div className="loyal__tabs" role="tablist" aria-label="Jontai Rewards">
            <button type="button" role="tab" id={`${id}-how`} aria-selected={mode === 'how'} aria-controls={`${id}-how-panel`} onClick={() => setMode('how')}>
              How it works
            </button>
            <button
              type="button"
              role="tab"
              id={`${id}-try`}
              aria-selected={mode === 'try'}
              aria-controls={`${id}-try-panel`}
              onClick={() => {
                setMode('try');
                setSpend(2000);
              }}
            >
              Try your numbers
            </button>
            <span className="loyal__tabs-ink" data-at={mode} aria-hidden="true" />
          </div>

          {mode === 'how' ? (
            <div id={`${id}-how-panel`} role="tabpanel" aria-labelledby={`${id}-how`} className="loyal__how">
              <ol className="loyal__steps">
                {STEPS.map((s, i) => {
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
              <button type="button" className="loyal__next" onClick={() => pick((step + 1) % STEPS.length)}>
                {step === STEPS.length - 1 ? 'Start again' : 'Next step'} <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div id={`${id}-try-panel`} role="tabpanel" aria-labelledby={`${id}-try`} className="loyal__try">
              <label className="loyal__ask" htmlFor={`${id}-spend`}>
                What do you spend at Jontai in a year?
              </label>
              <p className="loyal__spend figure">{formatAfl(spend)}</p>
              <div className="loyal__picks" role="group" aria-label="Quick amounts">
                {PICKS.map((v) => (
                  <button key={v} type="button" data-on={spend === v || undefined} onClick={() => tryIt(v)}>
                    {formatAfl(v)}
                  </button>
                ))}
              </div>
              <input
                id={`${id}-spend`}
                className="slider loyal__slider"
                type="range"
                min={0}
                max={MAX_SPEND}
                step={100}
                value={spend}
                aria-valuetext={`${formatAfl(spend)} a year, ${formatAfl(r.back)} back`}
                onChange={(e) => setSpend(Number(e.target.value))}
                style={{ '--fill': `${(spend / MAX_SPEND) * 100}%` } as CSSProperties}
              />
              <div className="loyal__result" aria-live="polite">
                <p className="loyal__back-line">
                  You get <strong className="figure">{formatAfl(r.back)}</strong> back
                </p>
                <p className="loyal__meta">
                  {r.vouchers} {r.vouchers === 1 ? 'voucher' : 'vouchers'}
                  {spend < MAX_SPEND ? ` · ${formatAfl(r.toNext)} more to the next one` : ' · every voucher on the card'}
                </p>
                {spend < MAX_SPEND && (
                  <span className="loyal__next-bar" aria-hidden="true">
                    <i style={{ '--p': `${100 - (r.toNext / REWARD_STEP_AFL) * 100}%` } as CSSProperties} />
                    <span>{formatAfl(next)}</span>
                  </span>
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
          <LoyaltyCard flipped={flipped} front={<VoucherFace spend={spend} />} back={<VoucherBack />} />
          {pop > 0 && (
            <span key={pop} className="loyal__pop" aria-hidden="true">
              + {formatAfl(REWARD_PER_STEP_AFL)}
            </span>
          )}
          <p className="loyal__caption" aria-hidden="true">
            {mode === 'how' ? `Step ${step + 1} of ${STEPS.length}` : `${formatAfl(spend)} spent this year`}
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
