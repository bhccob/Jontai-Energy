import { STORE } from './store.ts';

// General messages to the store from the contact page (Bob, round 18: a message form on the website instead of sending
// everyone to WhatsApp). Checked with the same rules on the page and on the server, like a quote request (lib/quote).

/** What a message can be about, in the order the form lists them. `?about=` on /contact picks one. */
export const MESSAGE_TOPICS = [
  { id: 'question', label: 'A question' },
  { id: 'rewards', label: 'Jontai Rewards' },
  { id: 'bundles', label: 'Bundle offers' },
  { id: 'order', label: 'An order or delivery' },
  { id: 'work', label: 'Working with us' },
  { id: 'other', label: 'Something else' },
] as const;

export type MessageTopic = (typeof MESSAGE_TOPICS)[number]['id'];

export const MESSAGE_LIMITS = { name: 100, email: 200, phone: 40, message: 3000 } as const;

export interface Message {
  topic: MessageTopic;
  message: string;
  name: string;
  email: string;
  phone: string;
}

export type MessageField = keyof Message;
export type MessageErrors = Partial<Record<MessageField, string>>;

const isTopic = (v: unknown): v is MessageTopic => MESSAGE_TOPICS.some((t) => t.id === v);
const labelOf = (id: MessageTopic) => MESSAGE_TOPICS.find((t) => t.id === id)!.label;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The topic from an ?about= value; anything unknown is a question. */
export function topicFrom(value: string | string[] | undefined): MessageTopic {
  const v = Array.isArray(value) ? value[0] : value;
  return isTopic(v) ? v : 'question';
}

/** A link to the contact page with its topic already chosen. */
export function contactHref(topic?: MessageTopic) {
  return topic ? `/contact?about=${topic}` : '/contact';
}

/** Checks a submitted message. Strings are trimmed; single-line fields lose their line breaks. */
export function checkMessage(input: unknown): { ok: true; value: Message } | { ok: false; errors: MessageErrors } {
  if (!input || typeof input !== 'object') return { ok: false, errors: { message: 'Write your message here.' } };
  const raw = input as Record<string, unknown>;
  const line = (k: MessageField) => (typeof raw[k] === 'string' ? (raw[k] as string).replace(/\s+/g, ' ').trim() : '');
  const value: Message = {
    topic: isTopic(raw.topic) ? raw.topic : 'question',
    message: typeof raw.message === 'string' ? raw.message.trim() : '',
    name: line('name'),
    email: line('email'),
    phone: line('phone'),
  };

  const errors: MessageErrors = {};
  if (raw.topic !== undefined && !isTopic(raw.topic)) errors.topic = 'Choose from the list.';
  if (!value.message) errors.message = 'Write your message here.';
  if (!value.name) errors.name = 'Add your name so we know who to reply to.';
  if (!value.email) errors.email = 'Add an email address for the reply.';
  else if (!EMAIL.test(value.email)) errors.email = 'Check the email address. It should look like name@example.com.';
  for (const k of Object.keys(MESSAGE_LIMITS) as (keyof typeof MESSAGE_LIMITS)[]) {
    if (value[k].length > MESSAGE_LIMITS[k]) errors[k] = `Keep this under ${MESSAGE_LIMITS[k].toLocaleString('en-US')} characters.`;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

const subjectOf = (m: Message) => `Message: ${labelOf(m.topic)} (${m.name})`;
const linesOf = (m: Message) => [`About: ${labelOf(m.topic)}`, `\n${m.message}\n`, `Name: ${m.name}`, `Email: ${m.email}`, m.phone ? `Phone: ${m.phone}` : ''].filter(Boolean);

/** The email the store receives from the website. Replying goes straight to the visitor. */
export function messageEmail(m: Message) {
  const text = ['A message from the Jontai Energy website.', '', ...linesOf(m), '', `Reply to this email to answer ${m.name} directly.`].join('\n');
  return { subject: subjectOf(m), text };
}

/** The same message for the visitor's own email app, for when the website cannot send it. */
export function messageMailto(m: Message, to: string = STORE.email) {
  const body = ['Hello Jontai Energy,', '', ...linesOf(m)].join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(subjectOf(m))}&body=${encodeURIComponent(body)}`;
}
