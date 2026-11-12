'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { DIRECTIONS_URL } from '@/lib/contact';
import { QUOTE_ACTION } from '@/lib/quote';
import { BundleOffer } from './BundleOffer';

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

/**
 * The header: the store's mark, Support and Menu, nothing else. A slim bar gathers it once you leave the top; it steps
 * out of the way while you read down and comes back as soon as you scroll up or tab into it. Menu opens the sections
 * and the ways to reach the store full screen, on every screen size. `base` is '/' on other pages, so the section
 * links lead back home. `sky` (the home page, round 9) sets it in white over the sky and adds the bundle offers.
 */
export function Header({ base = '', sky = false }: { base?: string; sky?: boolean }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  const lenis = useLenis((l) => {
    const y = l.scroll;
    setSolid(y > 12);
    if (y > lastY.current + 4 && y > window.innerHeight * 0.7) setHidden(true);
    else if (y < lastY.current - 4) setHidden(false);
    lastY.current = y;
  });

  // A reload part-way down the page starts solid.
  useEffect(() => setSolid(window.scrollY > 12), []);

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
      <header className="nav" data-solid={solid || open} data-hidden={hidden && !open} data-sky={sky || undefined}>
        <a href={base || '#top'} className="brand" aria-label={base ? 'Jontai Energy, home' : 'Jontai Energy, back to the top'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" width={30} height={30} />
          Jontai Energy
        </a>
        <div className="nav__end">
          {sky && <BundleOffer hidden={open} />}
          <a href="/support" className="nav__support" aria-current={pathname === '/support' ? 'page' : undefined}>
            Support
          </a>
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
      </nav>
    </>
  );
}
