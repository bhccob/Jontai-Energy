'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Briefcase, Check, House, X } from '@phosphor-icons/react';
import { BusinessFace, LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLoginButton } from '@/components/sections/MemberLogin';
import { Words } from '@/components/ui/Split';
import { contactHref } from '@/lib/message';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';
import { REWARDS_COPY } from '@/lib/homeCopy';

type Kind = 'home' | 'business';

/** The home card shows ten vouchers. */
const SLOTS = 10;

/** How each program works, in three steps, and what to know about it: shown inside its tile when asked. */
const INFO: Record<Kind, { steps: string[]; facts: string[] }> = {
  home: {
    steps: [
      'Join at the counter at Cumana 73 and take your card.',
      'Shop as usual and show the card when you pay; what you spend in a year adds up on it, with nothing to log in to.',
      `Every full ${formatAfl(REWARD_STEP_AFL)} puts a ${formatAfl(REWARD_PER_STEP_AFL)} voucher on it, to spend on your next visit.`,
    ],
    facts: ['Vouchers are store credit and cannot be exchanged for cash.', 'Rewards start again one year after you join; full terms at the counter.'],
  },
  business: {
    steps: [
      'Open a business membership at the counter at Cumana 73.',
      'Show the card when you pay; what your business buys during the year earns points on it.',
      `At ${formatPoints(BUSINESS_GOAL)}, everything is ${BUSINESS_DISCOUNT}% off until the account's anniversary.`,
    ],
    facts: [
      'Points reset to 0 on the anniversary, and the year starts again.',
      'How many points a purchase earns and the exact dates are confirmed at the counter.',
    ],
  },
};

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

/** The other side of a card: the reward itself. */
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

/**
 * One plan (round 54): a tall row of its own (Bob: "loyalty program area gotta be bigger"), its card large and tilted,
 * floating a little and leaning toward the pointer (LoyaltyCard); beside it who it is for, its figure large (counting
 * up once, PageMotion data-count), one sentence, and "How it works", which opens the three steps and what to know under
 * the text and closes again with the X or Escape.
 */
function Plan({ kind, card, kicker, figure, line }: { kind: Kind; card: ReactNode; kicker: ReactNode; figure: ReactNode; line: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const info = INFO[kind];

  useEffect(() => {
    if (panel.current) panel.current.inert = !open;
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        opener.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <article className={`plan plan--${kind}`} data-open={open || undefined} data-reveal aria-labelledby={`${id}-title`}>
      <div className="plan__card" aria-hidden="true">
        <div className="plan__float">
          <LoyaltyCard flipped={false} front={card} back={<RewardBack kind={kind} />} />
        </div>
      </div>
      <div className="plan__text">
        <p className="plan__kicker">{kicker}</p>
        <h3 id={`${id}-title`} className="visually-hidden">
          {kind === 'home' ? 'Jontai Rewards for your home' : 'Jontai Rewards for your business'}
        </h3>
        <p className="plan__fig">{figure}</p>
        <p className="plan__line">{line}</p>
        <button ref={opener} type="button" className="plan__how" aria-expanded={open} aria-controls={`${id}-info`} onClick={() => setOpen((v) => !v)}>
          How it works
        </button>
        <div ref={panel} id={`${id}-info`} className="plan__info" role="region" aria-label="How it works">
          <div className="plan__info-in">
            <div className="tier__info-head">
              <p className="tier__info-title">How it works</p>
              <button
                type="button"
                className="tier__close"
                aria-label="Close"
                onClick={() => {
                  setOpen(false);
                  opener.current?.focus({ preventScroll: true });
                }}
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <ol className="tier__steps">
              {info.steps.map((s, i) => (
                <li key={s} style={{ '--i': i } as CSSProperties}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {s}
                </li>
              ))}
            </ol>
            <ul className="tier__facts">
              {info.facts.map((f, i) => (
                <li key={f} style={{ '--i': i + 3 } as CSSProperties}>
                  <Check size={15} weight="bold" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Jontai Rewards (round 54, calmer): the line in light and bold with one sentence beside it; the two plans one under
 * the other with a thin rule between, each a tall row with its card on one side (left for the home, right for the
 * business) and its figure, one sentence and how it works on the other; then "See my points" and a person to ask. No
 * chip above the title (Bob, round 43). The rules are lib/loyalty's.
 */
export function Rewards() {
  return (
    <section id="rewards" className="loyal" aria-labelledby="rewards-title">
      <div className="loyal__top">
        <p className="loyal__kicker">Jontai Rewards</p>
        <h2 id="rewards-title" className="loyal__title" data-words>
          <span>
            <Words text="Shop as usual." />
          </span>{' '}
          <b>
            <Words text="Earn it back." />
          </b>
        </h2>
        <p className="loyal__side" data-reveal>
          One card for your home, one for your business. Join at the counter at Cumana 73, bring the card when you shop, and your rewards apply by themselves.
        </p>
      </div>

      <div className="plans">
        <Plan
          kind="home"
          card={<VoucherFace spend={1500} />}
          kicker={
            <>
              <House size={16} weight="fill" aria-hidden="true" /> For your home
            </>
          }
          figure={
            <>
              <b data-count>{formatAfl(REWARD_PER_STEP_AFL)}</b> {REWARDS_COPY.back}
            </>
          }
          line={REWARDS_COPY.homeLine}
        />
        <Plan
          kind="business"
          card={<BusinessFace points={3600} />}
          kicker={
            <>
              <Briefcase size={16} weight="fill" aria-hidden="true" /> For your business
            </>
          }
          figure={
            <>
              <b data-count>{BUSINESS_DISCOUNT}%</b> {REWARDS_COPY.off}
            </>
          }
          line={REWARDS_COPY.businessLine}
        />
      </div>

      <div className="loyal__end" data-reveal>
        <MemberLoginButton className="btn btn--primary member__open">See my points</MemberLoginButton>
        <a href={contactHref('rewards')} className="loyal__ask">
          Not sure which card fits? Ask us; a person answers.
        </a>
      </div>
    </section>
  );
}
