'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { ConceptNote, Failed, FieldError, Honeypot, Send, Sent, Step } from '@/components/forms/parts';
import { MESSAGE_LIMITS, MESSAGE_TOPICS, checkMessage, messageMailto, type Message, type MessageErrors, type MessageField, type MessageTopic } from '@/lib/message';
import { CONCEPT } from '@/lib/store';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; name: string; email: string }
  | { kind: 'failed'; message: Message }
  | { kind: 'concept' };

const ORDER: MessageField[] = ['topic', 'message', 'name', 'email', 'phone'];

/**
 * A message to the store, the same letter as a quote request (Bob, round 18: "a contact page to send message in the
 * website instead of everything whatsapp"): what it is about, the message on ruled lines, where to reply. Checked here
 * and on the server with the same rules (lib/message); if the website cannot send it, the visitor's email app can.
 */
export function ContactForm({ initial }: { initial: MessageTopic }) {
  const id = useId();
  const [topic, setTopic] = useState<MessageTopic>(initial);
  const [errors, setErrors] = useState<MessageErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const form = useRef<HTMLFormElement>(null);

  const showErrors = (next: MessageErrors) => {
    setErrors(next);
    const first = ORDER.find((k) => next[k]);
    if (first) requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus());
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => String(data.get(k) ?? '');
    const checked = checkMessage({ topic, message: text('message'), name: text('name'), email: text('email'), phone: text('phone') });
    if (!checked.ok) return showErrors(checked.errors);

    setErrors({});
    if (CONCEPT) return setStatus({ kind: 'concept' });
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checked.value, website: text('website') }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: MessageErrors };
      if (res.ok && json.ok) return setStatus({ kind: 'sent', name: checked.value.name, email: checked.value.email });
      if (res.status === 422 && json.errors) {
        setStatus({ kind: 'idle' });
        return showErrors(json.errors);
      }
      setStatus({ kind: 'failed', message: checked.value });
    } catch {
      setStatus({ kind: 'failed', message: checked.value });
    }
  }

  if (status.kind === 'sent') {
    return (
      <Sent
        title="Message sent."
        name={status.name}
        email={status.email}
        again="Write another message"
        refocus={(el) => el?.focus()}
        onAgain={() => setStatus({ kind: 'idle' })}
      />
    );
  }

  const sending = status.kind === 'sending';
  const errId = (k: MessageField) => `${id}-${k}-error`;
  const describe = (k: MessageField, hint?: boolean) => [hint ? `${id}-${k}-hint` : '', errors[k] ? errId(k) : ''].filter(Boolean).join(' ') || undefined;
  const input = (k: MessageField) => ({
    id: `${id}-${k}`,
    name: k,
    className: 'field__input',
    'data-field': k,
    'aria-invalid': Boolean(errors[k]) || undefined,
  });

  return (
    <form ref={form} className="sheet" onSubmit={submit} noValidate aria-busy={sending}>
      <Step n={1} id={`${id}-about`} title="What it is about">
        <div className="chips" role="radiogroup" aria-labelledby={`${id}-about`} aria-describedby={errors.topic ? errId('topic') : undefined}>
          {MESSAGE_TOPICS.map((t, i) => (
            <label key={t.id} className="chip" data-on={topic === t.id || undefined}>
              <input type="radio" name="topic" value={t.id} checked={topic === t.id} data-field={i === 0 ? 'topic' : undefined} onChange={() => setTopic(t.id)} />
              <span className="chip__label">{t.label}</span>
            </label>
          ))}
        </div>
        <FieldError id={errId('topic')} text={errors.topic} />
      </Step>

      <Step n={2} id={`${id}-say`} title="Your message">
        <div className="field">
          <label htmlFor={`${id}-message`} className="visually-hidden">
            Your message
          </label>
          <textarea
            {...input('message')}
            className="field__input field__input--lines"
            rows={5}
            maxLength={MESSAGE_LIMITS.message}
            placeholder="Write it the way you would say it at the counter."
            aria-describedby={describe('message')}
          />
          <FieldError id={errId('message')} text={errors.message} />
        </div>
      </Step>

      <Step n={3} id={`${id}-you`} title="Where to reply">
        <div className="field-row">
          <div className="field">
            <label htmlFor={`${id}-name`} className="field__label">
              Name
            </label>
            <input {...input('name')} autoComplete="name" required maxLength={MESSAGE_LIMITS.name} aria-describedby={describe('name')} />
            <FieldError id={errId('name')} text={errors.name} />
          </div>
          <div className="field">
            <label htmlFor={`${id}-email`} className="field__label">
              Email
            </label>
            <input {...input('email')} type="email" inputMode="email" autoComplete="email" required maxLength={MESSAGE_LIMITS.email} aria-describedby={describe('email')} />
            <FieldError id={errId('email')} text={errors.email} />
          </div>
        </div>
        <div className="field">
          <label htmlFor={`${id}-phone`} className="field__label">
            Phone <span className="field__optional">optional, if you would rather we call</span>
          </label>
          <input {...input('phone')} type="tel" autoComplete="tel" maxLength={MESSAGE_LIMITS.phone} aria-describedby={describe('phone')} />
          <FieldError id={errId('phone')} text={errors.phone} />
        </div>
      </Step>

      <Honeypot />
      {status.kind === 'failed' && <Failed mailto={messageMailto(status.message)} />}
      {status.kind === 'concept' && <ConceptNote what="reach Jontai Energy" />}
      <Send sending={sending} label="Send message" />
    </form>
  );
}
