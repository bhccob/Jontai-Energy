'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useLenis } from 'lenis/react';
import { WarningCircle, X } from '@phosphor-icons/react/dist/ssr';
import { Switch } from '@/components/forms/parts';
import { STORE } from '@/lib/store';
import { LoyaltyCard, MemberFace, NoticeFace } from './LoyaltyCard';

/**
 * Where a points lookup would be sent. Empty until the store's loyalty records are connected; the live site looks a
 * member up by the code on their card and their name, and this form asks for the same two things.
 */
const LOOKUP_URL = '';

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
 * both the card and the form say so. A wide, low sheet (round 27: "more rectangle instead of boxy").
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

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLInputElement>('input[name="code"]')?.focus();
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
      <button type="button" className="btn btn--primary member__open" onClick={() => setOpen(true)} aria-haspopup="dialog">
        See my points
      </button>
      <dialog ref={dialog} className="member" aria-labelledby={`${id}-title`} onClose={onClose} data-lenis-prevent>
        <button type="button" className="drawer__close member__close" onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} aria-hidden="true" />
        </button>
        <div className="member__card">
          <LoyaltyCard
            flipped={Boolean(result)}
            shake={shake}
            front={<MemberFace code={code} name={name} focus={focus} kind={kind} />}
            back={<NoticeFace phone={STORE.phone} />}
          />
        </div>
        <div className="member__side">
          <h2 id={`${id}-title`} className="h-title">
            See my points
          </h2>
          <p className="member__lead">
            You never need to log in to use your rewards: show your card at the counter and they apply. To see your points, enter the code printed on your card with your name.
          </p>
          <form className="member__form" onSubmit={submit} noValidate>
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
            <div className="member__fields">
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
                autoComplete="name"
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
            <button type="submit" className="btn btn--primary member__submit">
              View my points
            </button>
            <p className="member__result" aria-live="polite">
              {result}
            </p>
          </form>
          <p className="note member__note">
            No card yet? Open a membership in store at {STORE.street}, {STORE.city}, and collect your loyalty card there.
          </p>
        </div>
      </dialog>
    </>
  );
}
