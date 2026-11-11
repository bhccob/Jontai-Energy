'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowRight, Briefcase, Check, House } from '@phosphor-icons/react';
import { BusinessFace, LoyaltyCard } from '@/components/sections/LoyaltyCard';
import { MemberLogin } from '@/components/sections/MemberLogin';
import { Words } from '@/components/ui/Split';
import { whatsappLink } from '@/lib/contact';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_PER_STEP_AFL, REWARD_STEP_AFL, businessCard, formatAfl, formatPoints, rewardFor } from '@/lib/loyalty';

type Kind = 'home' | 'business';

/** The home card shows ten vouchers, so the home calculator runs to Afl. 5,000; business runs a little past its goal. */
const MAX: Record<Kind, number> = { home: 5000, business: 6000 };
const SLOTS = MAX.home / REWARD_STEP_AFL;
const PICKS: Record<Kind, number[]> = { home: [500, 1000, 2500, 5000], business: [1000, 2500, 4000, 5000] };
const START: Record<Kind, number> = { home: 2000, business: 2500 };

const HOW = [
  'Join at the counter at Cumana 73 and take your card.',
  'Shop as usual; what you buy in a year adds up on the card.',
  `Collect: a ${formatAfl(REWARD_PER_STEP_AFL)} voucher per ${formatAfl(REWARD_STEP_AFL)} at home, ${BUSINESS_DISCOUNT}% off at ${formatPoints(BUSINESS_GOAL)} for business.`,
];

const FACTS = [
  'Vouchers are store credit and cannot be exchanged for cash.',
  'Home rewards build up through the year and start again one year after you join.',
  `Business points reset to 0 on the account's anniversary; the ${BUSINESS_DISCOUNT}% off runs until then.`,
  'How many points a purchase earns, the full terms and the exact dates are confirmed at the counter.',
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
 * Jontai Rewards, laid out like a price list (Bob, round 15, after squared-media's): the promise in two big lines, then
 * the two programs side by side, each with its one number in huge type and its own card peeking out of the corner,
 * which turns over to show the reward when you point at the program. Under them, how to join, at the counter; then
 * how it works and what to know beside a calculator that works out your own year, for home in florins or for business
 * in points (the points rate per florin is confirmed in store). A reward that lands rises off the result.
 */
export function Rewards() {
  const id = useId();
  const [hover, setHover] = useState<Kind | null>(null);
  const [kind, setKind] = useState<Kind>('home');
  const [value, setValue] = useState(START.home);
  const [pop, setPop] = useState(0);
  const calc = useRef<HTMLDivElement>(null);
  const last = useRef(rewardFor(START.home).vouchers);

  // A reward landing (a voucher, or the business goal) rises off the result.
  useEffect(() => {
    const won = kind === 'home' ? rewardFor(value).vouchers : businessCard(value).reached ? 1 : 0;
    if (won > last.current) setPop((n) => n + 1);
    last.current = won;
  }, [value, kind]);

  const choose = (k: Kind) => {
    if (k === kind) return;
    last.current = k === 'home' ? rewardFor(START.home).vouchers : 0;
    setKind(k);
    setValue(START[k]);
  };
  const workOut = (k: Kind) => {
    choose(k);
    calc.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => calc.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), 700);
  };

  const home = kind === 'home';
  const r = rewardFor(value);
  const b = businessCard(value);

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
          One card for your home, one for your business. Join at the counter at Cumana 73; the code on your card is your member login.
        </p>
      </div>

      <div className="tiers">
        <article
          className="tier"
          data-kind="home"
          data-reveal
          onPointerEnter={() => setHover('home')}
          onPointerLeave={() => setHover(null)}
          aria-labelledby={`${id}-home`}
        >
          <div className="tier__text">
            <p className="tier__kicker">
              <House size={16} weight="fill" aria-hidden="true" /> For your home
            </p>
            <p className="tier__figure">{formatAfl(REWARD_PER_STEP_AFL)}</p>
            <p className="tier__per">back for every {formatAfl(REWARD_STEP_AFL)} you spend</p>
            <h3 id={`${id}-home`} className="tier__title">
              A voucher every {formatAfl(REWARD_STEP_AFL)}
            </h3>
            <p className="tier__body">
              Each full {formatAfl(REWARD_STEP_AFL)} you spend in a year puts a {formatAfl(REWARD_PER_STEP_AFL)} voucher on your card, to spend on anything in the store.
            </p>
            <p className="tier__meta">Store credit · restarts a year after you join</p>
            <button type="button" className="tier__cta" onClick={() => workOut('home')}>
              Work out yours <ArrowDown size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>
          <div className="tier__card" aria-hidden="true">
            <LoyaltyCard flipped={hover === 'home'} front={<VoucherFace spend={1500} />} back={<RewardBack kind="home" />} />
          </div>
        </article>

        <article
          className="tier tier--business"
          data-kind="business"
          data-reveal
          onPointerEnter={() => setHover('business')}
          onPointerLeave={() => setHover(null)}
          aria-labelledby={`${id}-business`}
        >
          <div className="tier__text">
            <p className="tier__kicker">
              <Briefcase size={16} weight="fill" aria-hidden="true" /> For your business <span className="tier__badge">Business only</span>
            </p>
            <p className="tier__figure">{BUSINESS_DISCOUNT}%</p>
            <p className="tier__per">off everything, for the rest of the year</p>
            <h3 id={`${id}-business`} className="tier__title">
              Reach {formatPoints(BUSINESS_GOAL)}
            </h3>
            <p className="tier__body">
              What your business buys earns points on its card. Reach {formatPoints(BUSINESS_GOAL)} and everything is {BUSINESS_DISCOUNT}% off until the account&apos;s anniversary.
            </p>
            <p className="tier__meta">Points start again at 0 on the anniversary</p>
            <button type="button" className="tier__cta tier__cta--fill" onClick={() => workOut('business')}>
              Work out yours <ArrowDown size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>
          <div className="tier__card" aria-hidden="true">
            <LoyaltyCard flipped={hover === 'business'} front={<BusinessFace points={3600} />} back={<RewardBack kind="business" />} />
          </div>
        </article>
      </div>

      <div className="loyal__strip" data-reveal>
        <p>
          <span className="loyal__strip-kicker">At the counter</span> Join in store at Cumana 73. Already a member? Log in with the code on your card.
        </p>
        <MemberLogin />
      </div>
      <div className="loyal__strip loyal__strip--soft" data-reveal>
        <p>Not sure which card fits? Ask us; a person answers.</p>
        <a href={whatsappLink('Hello Jontai Energy, I have a question about Jontai Rewards.')} target="_blank" rel="noopener noreferrer" className="loyal__ask-link">
          Ask on WhatsApp <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </a>
      </div>

      <div className="loyal__bottom">
        <div className="loyal__incl" data-reveal>
          <p className="loyal__label">How it works</p>
          <ol className="loyal__how">
            {HOW.map((h, i) => (
              <li key={h}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {h}
              </li>
            ))}
          </ol>
          <p className="loyal__label">Good to know</p>
          <ul className="loyal__facts">
            {FACTS.map((f) => (
              <li key={f}>
                <Check size={16} weight="bold" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="loyal__calc" ref={calc} data-reveal>
          <p className="loyal__label">Work it out</p>
          <div className="loyal__for" role="radiogroup" aria-label="Which card">
            <button type="button" role="radio" aria-checked={home} onClick={() => choose('home')}>
              <House size={16} weight={home ? 'fill' : 'regular'} aria-hidden="true" /> Home
            </button>
            <button type="button" role="radio" aria-checked={!home} onClick={() => choose('business')}>
              <Briefcase size={16} weight={!home ? 'fill' : 'regular'} aria-hidden="true" /> Business
            </button>
            <span className="loyal__for-ink" data-at={kind} aria-hidden="true" />
          </div>
          <label className="loyal__ask" htmlFor={`${id}-value`}>
            {home ? 'What do you spend at Jontai in a year?' : 'How many points does your business earn in a year?'}
          </label>
          <p className="loyal__value figure">{home ? formatAfl(value) : formatPoints(value)}</p>
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
            max={MAX[kind]}
            step={100}
            value={value}
            aria-valuetext={home ? `${formatAfl(value)} a year, ${formatAfl(r.back)} back` : `${formatPoints(value)}, ${b.reached ? `${BUSINESS_DISCOUNT}% off reached` : `${formatPoints(b.toGoal)} to go`}`}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{ '--fill': `${(value / MAX[kind]) * 100}%` } as CSSProperties}
          />
          <div className="loyal__result" aria-live="polite">
            {pop > 0 && (
              <span key={`${kind}-${pop}`} className="loyal__pop" aria-hidden="true">
                {home ? `+ ${formatAfl(REWARD_PER_STEP_AFL)}` : `${BUSINESS_DISCOUNT}% off unlocked`}
              </span>
            )}
            {home ? (
              <>
                <p className="loyal__answer">
                  <span className="figure">{formatAfl(r.back)}</span> back
                </p>
                <ol className="loyal__suns" aria-hidden="true">
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <li
                      key={i}
                      data-state={i < r.vouchers ? 'earned' : i === r.vouchers ? 'next' : 'empty'}
                      style={{ '--p': i === r.vouchers ? `${(1 - r.toNext / REWARD_STEP_AFL) * 100}%` : '0%' } as CSSProperties}
                    />
                  ))}
                </ol>
                <p className="loyal__meta">
                  {r.vouchers} {r.vouchers === 1 ? 'voucher' : 'vouchers'}
                  {value < MAX.home ? ` · ${formatAfl(r.toNext)} more to the next one` : ' · every voucher on the card'}
                </p>
              </>
            ) : (
              <>
                <p className="loyal__answer">
                  {b.reached ? (
                    <>
                      <span className="figure">{BUSINESS_DISCOUNT}% off</span> all year
                    </>
                  ) : (
                    <>
                      <span className="figure">{formatPoints(b.toGoal)}</span> to go
                    </>
                  )}
                </p>
                <span className="loyal__goal" aria-hidden="true">
                  <i style={{ '--p': `${b.fraction * 100}%` } as CSSProperties} />
                </span>
                <p className="loyal__meta">
                  {b.reached ? "Until the account's anniversary, when the points start again." : `${Math.round(b.fraction * 100)}% of the way to ${formatPoints(BUSINESS_GOAL)}.`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
