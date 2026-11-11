'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { ProductChips } from '@/components/forms/ProductChips';
import { ConceptNote, Failed, FieldError, Honeypot, Send, Sent, Step } from '@/components/forms/parts';
import { DELIVERY_TOPICS, QUOTE_LIMITS, checkQuote, quoteMailto, type QuoteErrors, type QuoteField, type QuoteRequest, type QuoteTopic } from '@/lib/quote';
import { CONCEPT } from '@/lib/store';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; name: string; email: string }
  | { kind: 'failed'; request: QuoteRequest }
  | { kind: 'concept' };

const ORDER: QuoteField[] = ['topics', 'details', 'area', 'name', 'email', 'phone'];

/**
 * The quote request as a letter in three steps on one glass sheet (Bob, round 18): what it is for, picked from chips
 * with each range's island; the details, written on ruled lines; and where to reply. Checked here and again on the
 * server with the same rules. If the website cannot send it, the visitor gets the same letter for their email app.
 */
export function QuoteForm({ initial }: { initial: QuoteTopic[] }) {
  const id = useId();
  const [topics, setTopics] = useState<QuoteTopic[]>(initial);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const form = useRef<HTMLFormElement>(null);
  const delivery = topics.some((t) => DELIVERY_TOPICS.includes(t));

  const choose = (next: QuoteTopic[]) => {
    setTopics(next);
    if (errors.topics) setErrors((cur) => ({ ...cur, topics: undefined }));
  };

  const showErrors = (next: QuoteErrors) => {
    setErrors(next);
    const first = ORDER.find((k) => next[k]);
    if (first) requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus());
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => String(data.get(k) ?? '');
    const checked = checkQuote({ topics, details: text('details'), area: delivery ? text('area') : '', name: text('name'), email: text('email'), phone: text('phone') });
    if (!checked.ok) return showErrors(checked.errors);

    setErrors({});
    if (CONCEPT) return setStatus({ kind: 'concept' });
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checked.value, website: text('website') }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: QuoteErrors };
      if (res.ok && json.ok) return setStatus({ kind: 'sent', name: checked.value.name, email: checked.value.email });
      if (res.status === 422 && json.errors) {
        setStatus({ kind: 'idle' });
        return showErrors(json.errors);
      }
      setStatus({ kind: 'failed', request: checked.value });
    } catch {
      setStatus({ kind: 'failed', request: checked.value });
    }
  }

  if (status.kind === 'sent') {
    return (
      <Sent
        title="Request sent."
        name={status.name}
        email={status.email}
        again="Send another request"
        refocus={(el) => el?.focus()}
        onAgain={() => {
          setTopics([]);
          setStatus({ kind: 'idle' });
        }}
      />
    );
  }

  const sending = status.kind === 'sending';
  const errId = (k: QuoteField) => `${id}-${k}-error`;
  const describe = (k: QuoteField, hint?: boolean) => [hint ? `${id}-${k}-hint` : '', errors[k] ? errId(k) : ''].filter(Boolean).join(' ') || undefined;
  const input = (k: QuoteField) => ({
    id: `${id}-${k}`,
    name: k,
    className: 'field__input',
    'data-field': k,
    'aria-invalid': Boolean(errors[k]) || undefined,
  });

  return (
    <form ref={form} className="sheet" onSubmit={submit} noValidate aria-busy={sending}>
      <Step n={1} id={`${id}-for`} title="What it is for">
        <p id={`${id}-topics-hint`} className="field__hint">
          Pick one or more.
        </p>
        <ProductChips labelId={`${id}-for`} value={topics} onChange={choose} error={errors.topics} describedBy={describe('topics', true)} />
        <FieldError id={errId('topics')} text={errors.topics} />
      </Step>

      <Step n={2} id={`${id}-need`} title="The details">
        <div className="field">
          <label htmlFor={`${id}-details`} className="field__label">
            What you need
          </label>
          <textarea
            {...input('details')}
            className="field__input field__input--lines"
            rows={4}
            maxLength={QUOTE_LIMITS.details}
            placeholder="For example: two 12,000 BTU solar air conditioners, one for a bedroom and one for an office."
            aria-describedby={describe('details', true)}
          />
          <p id={`${id}-details-hint`} className="field__hint">
            Models, sizes, quantities, and where it will be used.
          </p>
          <FieldError id={errId('details')} text={errors.details} />
        </div>
        {delivery && (
          <div className="field">
            <label htmlFor={`${id}-area`} className="field__label">
              Delivery area <span className="field__optional">optional</span>
            </label>
            <input {...input('area')} autoComplete="address-level2" maxLength={QUOTE_LIMITS.area} aria-describedby={describe('area', true)} />
            <p id={`${id}-area-hint`} className="field__hint">
              Large items such as furniture can be delivered. Where should it go?
            </p>
            <FieldError id={errId('area')} text={errors.area} />
          </div>
        )}
      </Step>

      <Step n={3} id={`${id}-you`} title="Where to reply">
        <div className="field-row">
          <div className="field">
            <label htmlFor={`${id}-name`} className="field__label">
              Name
            </label>
            <input {...input('name')} autoComplete="name" required maxLength={QUOTE_LIMITS.name} aria-describedby={describe('name')} />
            <FieldError id={errId('name')} text={errors.name} />
          </div>
          <div className="field">
            <label htmlFor={`${id}-email`} className="field__label">
              Email
            </label>
            <input {...input('email')} type="email" inputMode="email" autoComplete="email" required maxLength={QUOTE_LIMITS.email} aria-describedby={describe('email')} />
            <FieldError id={errId('email')} text={errors.email} />
          </div>
        </div>
        <div className="field">
          <label htmlFor={`${id}-phone`} className="field__label">
            Phone <span className="field__optional">optional, if you would rather we call</span>
          </label>
          <input {...input('phone')} type="tel" autoComplete="tel" maxLength={QUOTE_LIMITS.phone} aria-describedby={describe('phone')} />
          <FieldError id={errId('phone')} text={errors.phone} />
        </div>
      </Step>

      <Honeypot />
      {status.kind === 'failed' && <Failed mailto={quoteMailto(status.request)} />}
      {status.kind === 'concept' && <ConceptNote what="ask Jontai Energy for a quote" />}
      <Send sending={sending} label="Send request" />
    </form>
  );
}
