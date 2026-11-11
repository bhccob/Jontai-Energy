import { NextResponse } from 'next/server';
import { checkMessage, messageEmail } from '@/lib/message';
import { CONCEPT, STORE } from '@/lib/store';

/**
 * Sends a message from the contact page to the store's inbox through Resend, with Reply-To set to the visitor; the
 * same keys as quotes (RESEND_API_KEY, QUOTE_FROM, QUOTE_TO). Without them it answers 503 and the page offers the same
 * message from the visitor's email app. A concept build never sends anything.
 */
export async function POST(request: Request) {
  if (CONCEPT) return NextResponse.json({ ok: false, reason: 'concept' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 20_000) return NextResponse.json({ ok: false }, { status: 413 });
  const body: unknown = await request.json().catch(() => null);

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
