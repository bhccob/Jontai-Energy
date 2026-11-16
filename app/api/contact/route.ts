import { NextResponse } from 'next/server';
import { checkMessage, messageEmail } from '@/lib/message';
import { RATE, guardPost, rateLimiter } from '@/lib/guard';
import { CONCEPT, STORE } from '@/lib/store';

/** Posts per address (lib/guard): a few per ten minutes is plenty for a person and slows a script down. */
const allow = rateLimiter(RATE);

/**
 * Sends a message from the contact page to the store's inbox through Resend, with Reply-To set to the visitor; the
 * same keys as quotes (RESEND_API_KEY, QUOTE_FROM, QUOTE_TO). Without them it answers 503 and the page offers the same
 * message from the visitor's email app. A concept build never sends anything.
 */
export async function POST(request: Request) {
  if (CONCEPT) return NextResponse.json({ ok: false, reason: 'concept' }, { status: 403 });
  // Same site, JSON, not too often, not too big (lib/guard). The page answers any refusal with the email-app fallback.
  const guarded = await guardPost(request, allow);
  if (!guarded.ok) {
    const headers = guarded.status === 429 ? { 'Retry-After': String(RATE.windowMs / 1000) } : undefined;
    return NextResponse.json({ ok: false }, { status: guarded.status, headers });
  }
  const body = guarded.body;

  // The hidden "website" field is only ever filled in by bots: answer as if sent, send nothing.
  if (body && typeof body === 'object' && (body as { website?: unknown }).website) return NextResponse.json({ ok: true });

  const checked = checkMessage(body);
  if (!checked.ok) return NextResponse.json({ ok: false, errors: checked.errors }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM;
  if (!key || !from) return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 });

  const { subject, text } = messageEmail(checked.value);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [process.env.QUOTE_TO || STORE.email], reply_to: checked.value.email, subject, text }),
    });
    if (!res.ok) {
      console.error('[contact] Resend answered', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 502 });
    }
  } catch (error) {
    console.error('[contact] could not reach Resend', error);
    return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
