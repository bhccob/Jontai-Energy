// Rules the message and quote forms share (lib/message, lib/quote), on the page and on the server alike.

/**
 * An email address of the plain kind: no spaces, quotes, angle brackets or commas, so the Reply-To the store gets can
 * only ever be the one address the visitor typed, never a second one or a made-up display name.
 */
export const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

/** Control characters (tabs and line breaks aside) and the invisible marks that flip text direction. */
const HIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F‎‏‪-‮⁦-⁩]/g;

/** Text with hidden characters taken out, so what the store reads is what the visitor saw. */
export const plain = (s: string) => s.replace(HIDDEN, '');
