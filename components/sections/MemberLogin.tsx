'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLenis } from 'lenis/react';
import { WarningCircle, X } from '@phosphor-icons/react/dist/ssr';
import { Step, Switch } from '@/components/forms/parts';
import { STORE } from '@/lib/store';
import { LoyaltyCard, MemberFace, NoticeFace } from './LoyaltyCard';

/**
 * Where a points lookup would be sent. Empty until the store's loyalty records are connected; the live site looks a
 * member up by the code on their card and their name, and this form asks for the same two things.
 */
const LOOKUP_URL = '';

/** The event that opens the login, so any button on any page can (the header's, and Rewards' "See my points"). */
const OPEN = 'jontai:member-login';

/** Opens the member login wherever the visitor is. */
export function openMemberLogin() {
  window.dispatchEvent(new Event(OPEN));
}

/** A button that opens the member login. Without scripts it cannot, so it stays hidden (rewards.css). */
export function MemberLoginButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={openMemberLogin} aria-haspopup="dialog">
      {children}
    </button>
  );
}

type Field = 'code' | 'name';
type Kind = 'personal' | 'business';
/** The two memberships (round 27, Bob: "inside it should also have personal and bussines"). */
const KINDS = [
  { id: 'personal', label: 'Personal' },
  { id: 'business', label: 'Business' },
] as const;

/**
 * The member login: the loyalty card sits in the dialog and fills in as the member types, lighting the field in use;
 * Personal or Business picks the card (the green one or the oak one) and what the name means. Missing details give the
 * card a small shake; complete ones turn it over. It is a placeholder: nothing is sent until a lookup is connected, and
 * both the card and the form say so. A wide, low sheet (round 27: "more rectangle instead of boxy"). Since round 32
 * (Bob: "a button on the header for login to see member point") it lives once in the header, on every page, and opens
 * from the header's "Member login" or Rewards' "See my points"; closing it hands focus back to the button that opened it.
 */
export function MemberLogin() {
  const id = useId();
  const lenis = useLenis();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>('personal');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [focus, setFocus] = useState<Field | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState('');
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener(OPEN, onOpen);
    return () => window.removeEventListener(OPEN, onOpen);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Without scrolling the sheet, so it opens at its top with the close button in view.
      d.querySelector<HTMLInputElement>('input[name="code"]')?.focus({ preventScroll: true });
      lenis?.stop();
    }
    if (!open && d.open) d.close();
  }, [open, lenis]);

  useEffect(() => {
    if (!shake) return;
    const t = window.setTimeout(() => setShake(false), 450);
    return () => window.clearTimeout(t);
  }, [shake]);

  const onClose = () => {
    setOpen(false);
    lenis?.start();
    opener.current?.focus({ preventScroll: true });
    opener.current = null;
  };

  // Editing after a try turns the card back to its front.
  const edit = (k: Field, v: string) => {
    if (k === 'code') setCode(v.toUpperCase());
    else setName(v);
    if (errors[k]) setErrors((cur) => ({ ...cur, [k]: undefined }));
    setResult('');
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!code.trim()) next.code = 'Enter the code printed on your loyalty card.';
    if (!name.trim()) next.name = kind === 'business' ? 'Enter the business name on the membership.' : 'Enter the name on your membership.';
    setErrors(next);
    const first = (['code', 'name'] as Field[]).find((k) => next[k]);
    if (first) {
      setShake(true);
      setResult('');
      return e.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    }
    if (!LOOKUP_URL) setResult(`Nothing was sent: online points are not connected yet. Show your card at the counter, or call ${STORE.phone}, to hear your balance.`);
  };

  const error = (k: Field) =>
    errors[k] ? (
      <p id={`${id}-${k}-error`} className="field__error">
        <WarningCircle size={16} weight="bold" aria-hidden="true" />
        {errors[k]}
      </p>
    ) : null;

  return (
    <>
      {/* Like the contact page (Bob, round 28: "the inside design to be more like support contact"): the valley under a
          morning mist, the title in thin wide capitals with the card under it, and the form as one glass sheet in
          numbered steps with fields that are a line to write on. */}
      <dialog ref={dialog} className="member" aria-labelledby={`${id}-title`} onClose={onClose} data-lenis-prevent>
        <div className="member__backdrop" aria-hidden="true" />
        <button type="button" className="drawer__close member__close" onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} aria-hidden="true" />
        </button>
        <div className="member__intro">
          <p className="letter__kicker">(Jontai Rewards)</p>
          <h2 id={`${id}-title`} className="air-display member__title">
            <span>See my</span> <span className="member__indent">points.</span>
          </h2>
          <p className="member__lead">
            You never need to log in to use your rewards: show your card at the counter and they apply. Here you can see your points.
          </p>
          <div className="member__card">
            <LoyaltyCard
              flipped={Boolean(result)}
              shake={shake}
              front={<MemberFace code={code} name={name} focus={focus} kind={kind} />}
              back={<NoticeFace phone={STORE.phone} />}
            />
          </div>
        </div>
        <form className="sheet member__sheet" onSubmit={submit} noValidate>
          <Step n={1} id={`${id}-which`} title="Your membership">
            <Switch
              name={`${id}-kind`}
              label="Membership"
              options={KINDS}
              value={kind}
              onChange={(next) => {
                setKind(next);
                setResult('');
                if (errors.name) setErrors((cur) => ({ ...cur, name: undefined }));
              }}
            />
          </Step>
          <Step n={2} id={`${id}-card`} title="Your card">
            <div className="field-row">
              <div className="field">
                <label htmlFor={`${id}-code`} className="field__label">
                  Loyalty code
                </label>
                <input
                  id={`${id}-code`}
                  name="code"
                  className="field__input member__code"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={24}
                  placeholder="As printed on the card"
                  value={code}
                  onChange={(e) => edit('code', e.currentTarget.value)}
                  onFocus={() => setFocus('code')}
                  onBlur={() => setFocus(null)}
                  aria-invalid={Boolean(errors.code) || undefined}
                  aria-describedby={errors.code ? `${id}-code-error` : undefined}
                />
                {error('code')}
              </div>
              <div className="field">
                <label htmlFor={`${id}-name`} className="field__label">
                  {kind === 'business' ? 'Business name' : 'Name'}
                </label>
                <input
                  id={`${id}-name`}
                  name="name"
                  className="field__input"
                  autoComplete={kind === 'business' ? 'organization' : 'name'}
                  placeholder={kind === 'business' ? 'As on the membership' : 'As on your card'}
                  maxLength={60}
                  value={name}
                  onChange={(e) => edit('name', e.currentTarget.value)}
                  onFocus={() => setFocus('name')}
                  onBlur={() => setFocus(null)}
                  aria-invalid={Boolean(errors.name) || undefined}
                  aria-describedby={errors.name ? `${id}-name-error` : undefined}
                />
                {error('name')}
              </div>
            </div>
          </Step>
          <div className="sheet__send">
            <button type="submit" className="btn btn--primary sheet__go">
              See my points
            </button>
            <p className="sheet__fine">Online points are not connected yet, so nothing you enter is sent.</p>
          </div>
          <p className="member__result" aria-live="polite">
            {result}
          </p>
          <p className="sheet__fine member__note">
            No card yet? Open a membership in store at {STORE.street}, {STORE.city}, and collect your loyalty card there.
          </p>
        </form>
      </dialog>
    </>
  );
}
