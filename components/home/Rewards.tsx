'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Briefcase, Check, House, X } from '@phosphor-icons/react';
import { BusinessFace, LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLogin } from '@/components/sections/MemberLogin';
import { Words } from '@/components/ui/Split';
import { contactHref } from '@/lib/message';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';

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
 * One program as a tile: who it is for, its one number in huge type, a line on how it works, and its card peeking out
 * of the corner, which turns over to the reward under the pointer. "How it works" at the foot of the tile slides up a
 * panel inside it with the three steps and what to know, and closes again with the X or Escape.
 */
function Tier({ kind, children, card }: { kind: Kind; children: ReactNode; card: ReactNode }) {
  const id = useId();
  const [hover, setHover] = useState(false);
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
    <article
      className={`tier${kind === 'business' ? ' tier--business' : ''}`}
      data-open={open || undefined}
      data-reveal
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-labelledby={`${id}-title`}
    >
      <div className="tier__text">
        {children}
        <h3 id={`${id}-title`} className="visually-hidden">
          {kind === 'home' ? 'Jontai Rewards for your home' : 'Jontai Rewards for your business'}
        </h3>
        <button ref={opener} type="button" className={`tier__cta${kind === 'business' ? ' tier__cta--fill' : ''}`} aria-expanded={open} aria-controls={`${id}-info`} onClick={() => setOpen(true)}>
          How it works
        </button>
      </div>
      <div className="tier__card" aria-hidden="true">
        <LoyaltyCard flipped={hover && !open} front={card} back={<RewardBack kind={kind} />} />
      </div>
      <div ref={panel} id={`${id}-info`} className="tier__info" role="region" aria-label="How it works">
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
    </article>
  );
}

/**
 * Jontai Rewards, laid out like a price list (Bob, rounds 15 and 16, after squared-media's): the promise in two big
 * lines, then the two programs side by side, each a tile with its one number in huge type and its own card in the
 * corner; "How it works" at the foot of each opens the details inside the tile. Under them, how to join at the counter
 * and a person to ask.
 */
export function Rewards() {
  return (
    <section id="rewards" className="loyal" aria-labelledby="rewards-title">
      <div className="loyal__top">
        <p className="loyal__chip">Jontai Rewards</p>
        <h2 id="rewards-title" className="air-display loyal__title" data-words>
          <span>
            <Words text="Shop as usual." />
          </span>{' '}
          <span className="loyal__indent">
            <Words text="Earn it back." />
          </span>
        </h2>
        <p className="loyal__side" data-reveal>
          One card for your home, one for your business. Join at the counter at Cumana 73, bring the card when you shop, and your rewards apply by themselves.
        </p>
      </div>

      <div className="tiers">
        <Tier kind="home" card={<VoucherFace spend={1500} />}>
          <p className="tier__kicker">
            <House size={16} weight="fill" aria-hidden="true" /> For your home
          </p>
          <p className="tier__figure">{formatAfl(REWARD_PER_STEP_AFL)}</p>
          <p className="tier__per">back for every {formatAfl(REWARD_STEP_AFL)} you spend</p>
          <p className="tier__title">A voucher every {formatAfl(REWARD_STEP_AFL)}</p>
          <p className="tier__body">Each full {formatAfl(REWARD_STEP_AFL)} you spend in a year puts a {formatAfl(REWARD_PER_STEP_AFL)} voucher on your card, to spend on anything in the store.</p>
          <p className="tier__meta">Store credit · restarts a year after you join</p>
        </Tier>
        <Tier kind="business" card={<BusinessFace points={3600} />}>
          <p className="tier__kicker">
            <Briefcase size={16} weight="fill" aria-hidden="true" /> For your business <span className="tier__badge">Business only</span>
          </p>
          <p className="tier__figure">{BUSINESS_DISCOUNT}%</p>
          <p className="tier__per">off everything, for the rest of the year</p>
          <p className="tier__title">Reach {formatPoints(BUSINESS_GOAL)}</p>
          <p className="tier__body">
            What your business buys earns points on its card. Reach {formatPoints(BUSINESS_GOAL)} and everything is {BUSINESS_DISCOUNT}% off until the account&apos;s anniversary.
          </p>
          <p className="tier__meta">Points start again at 0 on the anniversary</p>
        </Tier>
      </div>

      <div className="loyal__strip" data-reveal>
        <p>
          <span className="loyal__strip-kicker">At the counter</span> Show your card when you pay and your rewards apply. Log in only to see your points.
        </p>
        <MemberLogin />
      </div>
      <div className="loyal__strip loyal__strip--soft" data-reveal>
        <p>Not sure which card fits? Ask us; a person answers.</p>
        <a href={contactHref('rewards')} className="loyal__ask-link">
          Send us a message
        </a>
      </div>
    </section>
  );
}
