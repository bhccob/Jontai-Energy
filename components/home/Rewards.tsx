'use client';

import { useId, useState, type CSSProperties } from 'react';
import { LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLogin } from '@/components/sections/MemberLogin';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';

/** The card face shows ten vouchers, so the slider runs to Afl. 5,000. */
const MAX_SPEND = 5000;
const SLOTS = MAX_SPEND / REWARD_STEP_AFL;

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
  const [spend, setSpend] = useState(2000);
  const r = rewardFor(spend);
  const result =
    spend >= MAX_SPEND
      ? `You get ${formatAfl(r.back)} back. Every voucher on this card is earned.`
      : `You get ${formatAfl(r.back)} back. ${formatAfl(r.toNext)} more to the next ${formatAfl(REWARD_PER_STEP_AFL)}.`;

  return (
    <section id="rewards" className="rewards-air" aria-labelledby="rewards-title">
      <div className="rewards-air__head">
        <p className="rewards-air__name">Jontai Rewards</p>
        <h2 id="rewards-title" className="air-display rewards-air__title">
          <span>Spend {formatAfl(REWARD_STEP_AFL)}.</span> <span>Get {formatAfl(REWARD_PER_STEP_AFL)} back.</span>
        </h2>
      </div>

      <div className="rewards-air__play">
        <div className="rewards-air__calc">
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
            onChange={(e) => setSpend(Number(e.target.value))}
            style={{ '--fill': `${(spend / MAX_SPEND) * 100}%` } as CSSProperties}
          />
          <p className="rewards-air__result" aria-live="polite">
            {result}
          </p>
          <div className="actions">
            <MemberLogin />
            <a href="#visit" className="btn btn--ghost">
              Visit the store
            </a>
          </div>
        </div>
        <LoyaltyCard flipped={false} front={<VoucherFace spend={spend} />} back={<VoucherFace spend={spend} />} className="rewards-air__card" />
      </div>

      <ol className="rewards-air__steps">
        {STEPS.map((s) => (
          <li key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <ul className="rewards-air__facts">
        {FACTS.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </section>
  );
}
