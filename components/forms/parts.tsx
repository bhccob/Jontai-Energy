import type { ReactNode } from 'react';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { CONCEPT, OFFICIAL_URL, STORE } from '@/lib/store';

// Shared pieces of the two letters, the quote request and the message (Bob, round 18): numbered steps on one glass
// sheet, underline fields, and the same notes when the website cannot or may not send.

const tel = `tel:${STORE.phone.replace(/\s/g, '')}`;

/** One numbered part of the form: its number in the page's thin wide capitals, its title, then its fields. */
export function Step({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="step" aria-labelledby={id}>
      <div className="step__head">
        <span className="step__num" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
        <h2 id={id} className="step__title">
          {title}
        </h2>
      </div>
      <div className="step__body">{children}</div>
    </fieldset>
  );
}

export function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="field__error">
      <WarningCircle size={16} weight="bold" aria-hidden="true" />
      {text}
    </p>
  );
}

/** Left empty by people; bots fill it in. */
export function Honeypot() {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** When the website could not send: the same letter from the visitor's own email app, or a call. */
export function Failed({ mailto }: { mailto: string }) {
  return (
    <div className="sheet__note sheet__note--alert" role="alert">
      <p>
        <strong>The website could not send this right now.</strong> It is ready to send from your own email app instead, or call{' '}
        <a href={tel}>{STORE.phone}</a>.
      </p>
      <a href={mailto} className="btn btn--ghost btn--sm">
        Open in your email app
      </a>
    </div>
  );
}

/** A concept build checks everything like the real one and sends nothing. */
export function ConceptNote({ what }: { what: string }) {
  return (
    <div className="sheet__note" role="status">
      <p>
        <strong>Nothing was sent.</strong> This is a concept redesign, so the form is not connected to the store. To {what}, call{' '}
        <a href={tel}>{STORE.phone}</a> or visit{' '}
        <a href={OFFICIAL_URL} rel="noopener noreferrer">
          jontaienergy.com
        </a>
        .
      </p>
    </div>
  );
}

/** The send button and the line under it about where it goes. */
export function Send({ sending, label }: { sending: boolean; label: string }) {
  return (
    <div className="sheet__send">
      <button type="submit" className="btn btn--primary sheet__go" disabled={sending}>
        {sending ? 'Sending' : label}
      </button>
      <p className="sheet__fine">{CONCEPT ? 'A concept redesign: nothing you enter here is sent.' : 'Sent by email to Jontai Energy. Your details are only used to reply.'}</p>
    </div>
  );
}

/** After sending: thanks, where the reply will go, and the way back or to write again. */
export function Sent({ title, name, email, again, onAgain, refocus }: { title: string; name: string; email: string; again: string; onAgain: () => void; refocus: (el: HTMLDivElement | null) => void }) {
  return (
    <div ref={refocus} className="sheet sheet--sent" role="status" tabIndex={-1}>
      <CheckCircle size={44} weight="light" aria-hidden="true" />
      <h2 className="air-display sheet__done">{title}</h2>
      <p>
        Thank you, {name}. Jontai Energy will reply to <strong>{email}</strong>.
      </p>
      <div className="sheet__again">
        <a href="/" className="btn btn--primary">
          Back to the home page
        </a>
        <button type="button" className="btn btn--ghost" onClick={onAgain}>
          {again}
        </button>
      </div>
    </div>
  );
}
