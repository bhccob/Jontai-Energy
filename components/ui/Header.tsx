'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { Headset, UserCircle } from '@phosphor-icons/react/dist/ssr';
import { LangChoices, LangSwitch } from '@/components/i18n/LangSwitch';
import { MemberLogin, openMemberLogin } from '@/components/sections/MemberLogin';
import { DIRECTIONS_URL } from '@/lib/contact';
import { QUOTE_ACTION } from '@/lib/quote';
import { useHeaderFit } from './useHeaderFit';

/** The home page's sections, as the menu lists them. */
/** The six ranges, named as on the home page (lib/islands), then Rewards and the visit (polish, round 30). */
const LINKS = [
  { id: 'solar', label: 'Solar' },
  { id: 'cooling', label: 'Cooling' },
  { id: 'backup', label: 'Backup power' },
  { id: 'light', label: 'LED lighting' },
  { id: 'security', label: 'Security' },
  { id: 'upstairs', label: 'Furniture' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'visit', label: 'Visit' },
] as const;

/** Whether an element paints a dark ground of its own (the ranges, the footer): the bar turns dark over those. */
function isDark(el: HTMLElement) {
  const m = /rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?/.exec(getComputedStyle(el).backgroundColor);
  if (!m || (m[4] !== undefined && Number(m[4]) < 0.6)) return false;
  return (0.2126 * Number(m[1]) + 0.7152 * Number(m[2]) + 0.0722 * Number(m[3])) / 255 < 0.25;
}

/**
 * The header: one still bar (round 35, Bob: "just make it not move and more clean designed like bigger and more
 * minimal"). It keeps its place, height and width from the top of the page to the foot, and holds four things: the
 * store's mark and name, Support (round 48, in the place of the Bundles & discounts button, which is off for now),
 * Member (round 32; it opens the points window, which lives here so it opens on every page), the language (round 33;
 * phones choose it in the menu) and Menu, which opens the sections and the ways to reach the store full screen. Support,
 * Member and the language are their icons, each word sliding out on hover or focus (rounds 49 and 50). Only the
 * bar's colour changes: bare at the top, frosted once you leave it, and deep green with pale ink over a dark section
 * (data-over, shell.css). `base` is '/' on other pages, so the section links lead back home. The row always fits, in
 * every language: useHeaderFit sheds labels in a set order.
 */
export function Header({ base = '', sky = false }: { base?: string; sky?: boolean }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const darkGrounds = useRef<HTMLElement[]>([]);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const bar = useRef<HTMLElement>(null);
  useHeaderFit(bar);

  /** Whether a dark section lies under the middle of the bar. */
  const readGround = () =>
    setOverDark(
      darkGrounds.current.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= 36 && r.bottom >= 36;
      }),
    );

  const lenis = useLenis((l) => {
    setSolid(l.scroll > 12);
    readGround();
  });

  // A reload part-way down the page starts solid.
  useEffect(() => setSolid(window.scrollY > 12), []);

  // The page's dark sections, found once per page by the ground they paint.
  useEffect(() => {
    darkGrounds.current = [...document.querySelectorAll<HTMLElement>('main section, main > div, footer')].filter(isDark);
    readGround();
  }, [pathname]);

  // The menu: the page behind is inert, Escape closes it, focus goes in and comes back to Menu.
  useEffect(() => {
    const sheet = menu.current;
    if (!sheet) return;
    sheet.inert = !open;
    if (!open) return;
    const behind = [...document.querySelectorAll<HTMLElement>('main, footer')];
    behind.forEach((el) => (el.inert = true));
    lenis?.stop();
    const first = sheet.querySelector<HTMLElement>('a');
    const focusIn = window.setTimeout(() => first?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusIn);
      window.removeEventListener('keydown', onKey);
      behind.forEach((el) => (el.inert = false));
      lenis?.start();
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        ref={bar}
        className="nav"
        data-solid={solid || open}
        data-sky={sky || undefined}
        data-over={overDark && !open ? 'dark' : undefined}
      >
        <a href={base || '#top'} className="brand" aria-label={base ? 'Jontai Energy, home' : 'Jontai Energy, back to the top'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" width={34} height={34} />
          Jontai Energy
        </a>
        <div className="nav__end">
          {/* Support, in the bar on every page (round 48, Bob: "add support on the header where its visible"), where the
              Bundles & discounts button was (off for now: BundleOffer, lib/bundles). Its icon alone; its word slides out
              on hover or focus (round 49, shell.css). */}
          <a href="/support" className="nav__support" aria-current={pathname === '/support' ? 'page' : undefined}>
            <Headset size={24} weight="regular" aria-hidden="true" />
            <span className="nav__support-label nav__slide">Support</span>
          </a>
          <button
            type="button"
            className="nav__member"
            aria-haspopup="dialog"
            onClick={() => {
              setOpen(false);
              openMemberLogin();
            }}
          >
            <UserCircle size={24} weight="regular" aria-hidden="true" />
            <span className="nav__member-label nav__slide">Member</span>
          </button>
          <LangSwitch />
          <button
            ref={toggle}
            type="button"
            className="nav__menu"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav__lines" aria-hidden="true">
              <i />
              <i />
            </span>
            <span className="nav__label">{open ? 'Close' : 'Menu'}</span>
          </button>
          {/* Without scripts the button cannot open the menu; this link opens it instead (shell.css, :target). */}
          <a href="#menu" className="nav__menu nav__menu--plain">
            <span className="nav__lines" aria-hidden="true">
              <i />
              <i />
            </span>
            Menu
          </a>
        </div>
      </header>
      <nav id="menu" ref={menu} className="menu" aria-label="Menu" data-open={open}>
        <ul className="menu__links">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`${base}#${l.id}`} onClick={close}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/support" aria-current={pathname === '/support' ? 'page' : undefined} onClick={close}>
              Support
            </a>
          </li>
        </ul>
        <div className="actions">
          <a href="/contact" className="btn btn--primary">
            Send a message
          </a>
          <a href="/quote" className="btn btn--ghost">
            {QUOTE_ACTION}
          </a>
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            Get directions
          </a>
        </div>
        <LangChoices />
      </nav>
      <MemberLogin />
    </>
  );
}
