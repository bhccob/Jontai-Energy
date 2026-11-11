'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLogin } from '@/components/sections/MemberLogin';
import { Words } from '@/components/ui/Split';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';

/** The card face shows ten vouchers, so the slider runs to Afl. 5,000. */
const MAX_SPEND = 5000;
const SLOTS = MAX_SPEND / REWARD_STEP_AFL;
/** Where the slider rests, and where the card fills to the first time it is seen. */
const START_SPEND = 2000;

const STEPS = [
  { title: 'Join at the counter', text: 'Open your membership in store at Cumana 73 and collect your loyalty card. The code on the card is your member login.' },
  { title: 'Shop as usual', text: `Every full ${formatAfl(REWARD_STEP_AFL)} you spend adds a ${formatAfl(REWARD_PER_STEP_AFL)} voucher to your card.` },
  { title: 'Spend your vouchers', text: 'Use them as store credit on your next visit, on anything in the store.' },
];

const FACTS = [
  'Vouchers are store credit and cannot be exchanged for cash.',
  'Your rewards build up through the year and start again one year after you join.',
  `Business customers reach ${formatPoints(BUSINESS_GOAL)} for ${BUSINESS_DISCOUNT}% off for the rest of the year.`,
  'Full terms and the exact reset date are confirmed at the counter.',
];

/** The card, as a year of spending fills it: a sun for every voucher earned, the next one filling. */
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

/**
 * Jontai Rewards, right after the first view: the one rule in huge type, then the card filling as you move a year's
 * spending, the three steps, the four facts that matter, and the member login. In florins throughout, since the
 * points rate per florin is not confirmed.
 */
export function Rewards() {
  const id = useId();
  const [spend, setSpend] = useState(START_SPEND);
  const play = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  // The first time the card comes into view it fills itself from nothing to Afl. 2,000, a voucher at a time, so the
  // rule shows itself before anyone reads it. Touching the slider stops it; reduced motion skips it.
  useEffect(() => {
    const el = play.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started || touched.current) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const run = (now: number) => {
          if (touched.current) return;
          const p = Math.min(1, (now - t0) / 2200);
          const eased = 1 - Math.pow(1 - p, 3);
          setSpend(Math.round((START_SPEND * eased) / 100) * 100);
          if (p < 1) raf = requestAnimationFrame(run);
        };
        setSpend(0);
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  const r = rewardFor(spend);
  const result =
    spend >= MAX_SPEND
      ? `You get ${formatAfl(r.back)} back. Every voucher on this card is earned.`
      : `You get ${formatAfl(r.back)} back. ${formatAfl(r.toNext)} more to the next ${formatAfl(REWARD_PER_STEP_AFL)}.`;

  return (
    <section id="rewards" className="rewards-air" aria-labelledby="rewards-title">
      <div className="rewards-air__head">
        <p className="rewards-air__name" data-reveal>
          Jontai Rewards
        </p>
        <h2 id="rewards-title" className="air-display rewards-air__title" data-words>
          <span>
            <Words text={`Spend ${formatAfl(REWARD_STEP_AFL)}.`} />
          </span>{' '}
          <span>
            <Words text={`Get ${formatAfl(REWARD_PER_STEP_AFL)} back.`} />
          </span>
        </h2>
      </div>

      <div className="rewards-air__play" ref={play}>
        <div className="rewards-air__calc" data-reveal>
          <div className="rewards-air__row">
            <label htmlFor={`${id}-spend`}>Spend in a year</label>
            <output htmlFor={`${id}-spend`} className="rewards-air__spend figure">
              {formatAfl(spend)}
            </output>
          </div>
          <input
            id={`${id}-spend`}
            className="slider rewards-air__slider"
            type="range"
            min={0}
            max={MAX_SPEND}
            step={100}
            value={spend}
            aria-valuetext={`${formatAfl(spend)} a year, ${formatAfl(r.back)} back`}
            onChange={(e) => {
              touched.current = true;
              setSpend(Number(e.target.value));
            }}
            style={{ '--fill': `${(spend / MAX_SPEND) * 100}%` } as CSSProperties}
          />
          <p className="rewards-air__result" aria-live={touched.current ? 'polite' : 'off'}>
            {result}
          </p>
          <div className="actions">
            <MemberLogin />
            <a href="#visit" className="btn btn--ghost">
              Visit the store
            </a>
          </div>
        </div>
        <div className="rewards-air__card" data-swing>
          <LoyaltyCard flipped={false} front={<VoucherFace spend={spend} />} back={<VoucherFace spend={spend} />} />
        </div>
      </div>

      <ol className="rewards-air__steps">
        {STEPS.map((s, i) => (
          <li key={s.title} style={{ '--i': i } as CSSProperties}>
            <span className="rule" data-line />
            <h3 data-reveal>{s.title}</h3>
            <p data-reveal>{s.text}</p>
          </li>
        ))}
      </ol>
      <ul className="rewards-air__facts">
        {FACTS.map((f, i) => (
          <li key={f} data-reveal style={{ '--i': i } as CSSProperties}>
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
