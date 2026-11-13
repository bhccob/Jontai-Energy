'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { i18n } from '@/lib/i18n/store';
import { spread, type Translator as T } from '@/lib/i18n/translate';

/** Never translated: code, what a visitor types, the switcher (it names each language in itself), fitted words. */
const SKIP = 'script, style, noscript, textarea, code, pre, [data-i18n-skip], .fit';
const ATTRS = ['aria-label', 'placeholder', 'title', 'alt'] as const;

// What each piece of text said in English, and what this script last put there. A text node whose value is no longer
// what we put there was changed by the page itself (React, a clock, a count), so its new value is the new English.
const source = new WeakMap<Text, string>();
const shown = new WeakMap<Text, string>();
const attrSource = new WeakMap<Element, Map<string, string>>();
const attrShown = new WeakMap<Element, Map<string, string>>();

function setText(node: Text, t: T | null) {
  const now = node.nodeValue ?? '';
  if (shown.get(node) !== now) {
    // New English from the page (or the first time we see it).
    source.set(node, now);
    shown.delete(node);
  }
  const english = source.get(node) ?? now;
  const ctx = node.parentElement?.closest<HTMLElement>('[data-i18n-ctx]')?.dataset.i18nCtx;
  const out = t ? t.text(english, ctx) : null;
  const next = out ?? english;
  if (next !== now) node.nodeValue = next;
  if (out !== null || shown.has(node)) shown.set(node, next);
}

function setAttr(el: Element, name: string, t: T | null) {
  const now = el.getAttribute(name);
  if (now === null) return;
  const src = attrSource.get(el) ?? new Map<string, string>();
  const mine = attrShown.get(el) ?? new Map<string, string>();
  attrSource.set(el, src);
  attrShown.set(el, mine);
  if (mine.get(name) !== now) {
    src.set(name, now);
    mine.delete(name);
  }
  const english = src.get(name) ?? now;
  const next = (t ? t.text(english) : null) ?? english;
  if (next !== now) el.setAttribute(name, next);
  mine.set(name, next);
}

/**
 * A heading split into words for motion (Split's Words): the whole sentence is translated, then shared out over the
 * same word slots, so the slots React rendered (and the motion holds) stay the same nodes. Chinese has no spaces, so
 * the spaces between slots are emptied for it.
 */
function setWords(el: HTMLElement, t: T | null) {
  const english = el.dataset.i18nWords ?? '';
  const slots = [...el.querySelectorAll<HTMLElement>('.wi')].map((w) => w.firstChild).filter((n): n is Text => n instanceof Text);
  const gaps = [...el.childNodes].filter((n): n is Text => n instanceof Text);
  const out = t ? t.text(english) : null;
  const parts = out === null || !t ? null : spread(t.lang, out, slots.length);
  slots.forEach((node, i) => {
    if (!source.has(node) || shown.get(node) !== node.nodeValue) source.set(node, node.nodeValue ?? '');
    const next = parts ? parts[i] : source.get(node) ?? '';
    if (node.nodeValue !== next) node.nodeValue = next;
    shown.set(node, next);
  });
  gaps.forEach((node) => {
    if (!source.has(node) || shown.get(node) !== node.nodeValue) source.set(node, node.nodeValue ?? '');
    const next = parts && t?.lang === 'zh' ? '' : source.get(node) ?? ' ';
    if (node.nodeValue !== next) node.nodeValue = next;
    shown.set(node, next);
  });
}

function skipped(el: Element | null) {
  return !el || !!el.closest(SKIP);
}

/** Everything under `root`: text, the attributes people read, and word-split headings. */
function walk(root: Node, t: T | null) {
  if (root instanceof Text) {
    const p = root.parentElement;
    if (p && !skipped(p) && !p.closest('[data-i18n-words]')) setText(root, t);
    return;
  }
  if (!(root instanceof Element) || skipped(root)) return;
  const words = root.closest('[data-i18n-words]');
  if (words instanceof HTMLElement) return setWords(words, t);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (n instanceof Element) {
        if (n.matches(SKIP)) return NodeFilter.FILTER_REJECT;
        if (n instanceof HTMLElement && n.dataset.i18nWords !== undefined) {
          setWords(n, t);
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const visit = (n: Node) => {
    if (n instanceof Text) {
      if (/\S/.test(n.nodeValue ?? '') || shown.has(n)) setText(n, t);
    } else if (n instanceof Element) {
      for (const a of ATTRS) if (n.hasAttribute(a)) setAttr(n, a, t);
    }
  };
  visit(root);
  let n = tw.nextNode();
  while (n) {
    visit(n);
    n = tw.nextNode();
  }
}

/**
 * The page's translator, once in the layout. With Spanish or Chinese picked it rewrites the page's text in place (the
 * nodes React made stay the same nodes, so React never notices), then follows whatever changes afterwards: a clock
 * ticking, a drawer opening, a form's message. Back to English, every piece goes back to what it said. The first
 * render is always English, as the server sent it; a saved choice applies right after, and the head script keeps the
 * page hidden for that moment so English never flashes (app/layout, html[data-i18n]).
 */
export function Translator() {
  const { t, lang } = useSyncExternalStore(i18n.subscribe, i18n.get, i18n.server);
  // Whether the page holds a translation, so going back to English has something to undo.
  const applied = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') (window as unknown as { __i18n?: typeof i18n }).__i18n = i18n;
    const saved = i18n.saved();
    if (saved !== 'en') void i18n.set(saved, false).catch(() => document.documentElement.removeAttribute('data-i18n'));
    else document.documentElement.removeAttribute('data-i18n');
  }, []);

  useEffect(() => {
    const title = document.querySelector('title');
    if (!t) {
      // English: put back what the page said, if it was ever translated.
      if (lang === 'en' && applied.current) {
        walk(document.body, null);
        if (title) walk(title, null);
        applied.current = false;
      }
      return;
    }
    walk(document.body, t);
    if (title) walk(title, t);
    applied.current = true;
    document.documentElement.removeAttribute('data-i18n');
    const seen = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') walk(r.target, t);
        else if (r.type === 'attributes') {
          const el = r.target as Element;
          if (!skipped(el) && r.attributeName) setAttr(el, r.attributeName, t);
        } else {
          r.addedNodes.forEach((n) => walk(n, t));
          // A word slot React refilled: share the heading out again.
          const words = (r.target instanceof Element ? r.target : r.target.parentElement)?.closest('[data-i18n-words]');
          if (words instanceof HTMLElement) setWords(words, t);
        }
      }
    });
    seen.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
    // The tab's title: its text can change, and the framework can swap the whole tag for a new one.
    seen.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => seen.disconnect();
  }, [t, lang]);

  return null;
}
