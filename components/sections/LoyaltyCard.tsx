'use client';

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, POINTS_MAX, POINTS_PER_VOUCHER, businessCard, formatAfl, formatPoints, regularCard } from '@/lib/loyalty';

/**
 * The loyalty card as an object: a physical card in CSS 3D that leans toward the pointer, catches a moving highlight,
 * and turns over to show its other face. Decorative for assistive tech (the controls beside it say the same in words).
 * With reduced motion it holds still and turns over at once.
 */
export function LoyaltyCard({ flipped, front, back, shake = false, className = '' }: { flipped: boolean; front: ReactNode; back: ReactNode; shake?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const lean = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.dataset.live = 'true';
      el.style.setProperty('--rx', `${(-y * 16).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 22).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${Math.round((x + 0.5) * 100)}%`);
      el.style.setProperty('--gy', `${Math.round((y + 0.5) * 100)}%`);
    });
  };
  const rest = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.dataset.live = 'false';
    for (const p of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(p);
  };

  return (
    <div ref={ref} className={`lcard ${className}`} data-flipped={flipped} data-shake={shake || undefined} onPointerMove={lean} onPointerLeave={rest} aria-hidden="true">
      <div className="lcard__tilt">
        <div className="lcard__flip">
          <div className="lcard__face lcard__face--front">
            {front}
            <span className="lcard__glare" />
          </div>
          <div className="lcard__face lcard__face--back">
            {back}
            <span className="lcard__glare" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Brand({ tier }: { tier: string }) {
  return (
    <div className="lcard__top">
      <span className="lcard__brand">
        Jontai <span>Energy</span>
      </span>
      <span className="lcard__tier">{tier}</span>
    </div>
  );
}

/** The regular card: ten sun stamps to 5,000 points, one Afl. 25 voucher each. */
export function RegularFace({ points }: { points: number }) {
  const r = regularCard(points);
  const stamps = POINTS_MAX / POINTS_PER_VOUCHER;
  return (
    <div className="lcard__body" data-tone="sand">
      <Brand tier="Regular member" />
      <ol className="lcard__stamps">
        {Array.from({ length: stamps }, (_, i) => (
          <li
            key={i}
            className="lcard__stamp"
            data-state={i < r.vouchers ? 'earned' : i === r.vouchers ? 'next' : 'empty'}
            style={{ '--p': i === r.vouchers ? r.fraction : 0 } as CSSProperties}
          />
        ))}
      </ol>
      <div className="lcard__bottom">
        <span className="lcard__field">
          <span className="lcard__label">In vouchers</span>
          <span className="lcard__figure">{formatAfl(r.credit)}</span>
        </span>
        <span className="lcard__field lcard__field--end">
          <span className="lcard__label">This year</span>
          <span className="lcard__value">{formatPoints(points)}</span>
        </span>
      </div>
    </div>
  );
}

const RING = 2 * Math.PI * 44;

/** The business card: one ring to 5,000 points, 10% off once it closes. */
export function BusinessFace({ points }: { points: number }) {
  const b = businessCard(points);
  return (
    <div className="lcard__body" data-tone="forest">
      <Brand tier="Business member" />
      <div className="lcard__ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="lcard__ring-track" cx="50" cy="50" r="44" />
          <circle className="lcard__ring-fill" cx="50" cy="50" r="44" strokeDasharray={RING} strokeDashoffset={RING * (1 - b.fraction)} />
        </svg>
        <span className="lcard__ring-text">
          <span className="lcard__figure">{BUSINESS_DISCOUNT}%</span>
          <span className="lcard__label">off</span>
        </span>
      </div>
      <div className="lcard__bottom">
        <span className="lcard__field">
          <span className="lcard__label">{b.reached ? 'Reached' : 'To 10% off'}</span>
          <span className="lcard__value">{b.reached ? 'For the rest of the year' : formatPoints(b.toGoal)}</span>
        </span>
        <span className="lcard__field lcard__field--end">
          <span className="lcard__label">Goal</span>
          <span className="lcard__value">{formatPoints(BUSINESS_GOAL)}</span>
        </span>
      </div>
    </div>
  );
}

/** The card as the member types: their code and name appear on it; the field in use is lit. */
export function MemberFace({
  code,
  name,
  focus,
  kind = 'personal',
}: {
  code: string;
  name: string;
  focus: 'code' | 'name' | null;
  /** Personal is the green card, business the oak one, as on Rewards (round 27). */
  kind?: 'personal' | 'business';
}) {
  return (
    <div className="lcard__body" data-tone={kind === 'business' ? 'forest' : 'sand'}>
      <Brand tier={kind === 'business' ? 'Business member' : 'Rewards member'} />
      <span className="lcard__code" data-on={focus === 'code'} data-empty={!code}>
        {code || 'Your loyalty code'}
      </span>
      <div className="lcard__bottom">
        <span className="lcard__field" data-on={focus === 'name'}>
          <span className="lcard__label">{kind === 'business' ? 'Business' : 'Member'}</span>
          <span className="lcard__value" data-empty={!name}>
            {name || (kind === 'business' ? 'Business name' : 'Your name')}
          </span>
        </span>
        <span className="lcard__sun" />
      </div>
    </div>
  );
}

/** The back of the member card, once the details are in: online points are not connected yet. */
export function NoticeFace({ phone }: { phone: string }) {
  return (
    <div className="lcard__body" data-tone="forest">
      <Brand tier="Online points" />
      <p className="lcard__notice">Coming soon. Show this card at the counter, or call {phone}, to hear your balance.</p>
      <div className="lcard__bottom">
        <span className="lcard__field">
          <span className="lcard__label">Nothing was sent</span>
        </span>
        <span className="lcard__sun" />
      </div>
    </div>
  );
}
