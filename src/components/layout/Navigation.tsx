"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clsx } from "clsx";
import { primaryNav, site } from "@/content/site";
import { Arrow } from "@/components/primitives/Actions";

/**
 * Navigation — a floating frosted pill plus a fullscreen editorial menu.
 *
 * Why a pill rather than a full-width bar: the previous version inverted its
 * colours depending on whether it floated over a dark hero, and that state was
 * resolved in an effect — so on the homepage it server-rendered dark type over
 * a dark hero and was invisible until hydration. The pill uses one translucent
 * ink surface with light type on every page. That clears AA on both the dark
 * hero (very high contrast) and warm paper (9.9:1), needs no JS to decide, and
 * can never flash or disappear.
 *
 * Accessibility notes:
 * - The overlay is a real modal: `aria-modal`, focus is trapped inside it,
 *   Escape closes it, and focus returns to the trigger on close.
 * - Background scroll is locked (including Lenis, which ignores overflow:hidden).
 * - The menu markup is only mounted when open, so its links never appear in
 *   the tab order behind the scenes.
 */

const lenisCtl = () =>
  (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;

/* Subscribes to window scroll for `useSyncExternalStore` — reading the
 * threshold directly from the DOM avoids ever needing to call setState
 * from inside an effect body just to seed or update it. */
const subscribeToScroll = (onStoreChange: () => void) => {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
};
const getScrolledSnapshot = () => window.scrollY > 24;
const getScrolledServerSnapshot = () => false;

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* The pill tightens and deepens slightly once you leave the top. Reading
   * scroll position through an external store (rather than an effect that
   * calls setScrolled) keeps this correct on first paint, on every scroll
   * tick, and never triggers a setState-in-effect cascade. */
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrolledSnapshot,
    getScrolledServerSnapshot,
  );

  /* Close on route change. Setting state while rendering (rather than in an
   * effect) is the pattern React recommends for "reset state when a prop
   * changes": it applies before the screen paints, so there's no flash of
   * the menu staying open, and no effect-triggered re-render cascade. */
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  /* Scroll lock + focus management + escape + focus trap. */
  useEffect(() => {
    if (!open) return;

    const lenis = lenisCtl();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      trigger?.focus();
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-100 pt-[clamp(0.75rem,1.6vw,1.25rem)]">
        <div className="gutter mx-auto max-w-[110rem]">
          <div
            className={clsx(
              "on-dark text-paper flex items-center justify-between gap-5 rounded-full border border-white/10 px-4 backdrop-blur-xl transition-[background-color,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-6",
              // 82% is the floor at which the paper/70 nav links and the
              // ember-light mark still clear 4.5:1 when the pill floats over
              // the lightest page background. Keep `PILL_ALPHA` in
              // scripts/contrast.mjs in sync with this value.
              scrolled && !open ? "bg-ink/92 py-2" : "bg-ink/82 py-2.5",
            )}
          >
            <Link
              href="/"
              aria-label={`${site.name} — home`}
              className="font-display shrink-0 pl-1 text-[1.3rem] leading-none tracking-[-0.02em]"
            >
              Jeevan<span className="text-ember-light">.</span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
              {primaryNav.slice(0, 5).map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      // ::before expands the hit area to 44px without pushing
                      // the underline away from the text.
                      "group t-label relative py-2 transition-colors duration-300",
                      "before:absolute before:inset-x-0 before:-top-3 before:-bottom-3 before:content-['']",
                      active ? "text-paper" : "text-paper/70 hover:text-paper",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "bg-ember-light absolute -bottom-0.5 left-0 h-px w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        active
                          ? "scale-x-100"
                          : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/contact"
                className="t-label bg-paper text-ink hover:bg-ember hover:text-paper hidden min-h-11 items-center gap-2.5 rounded-full px-5 transition-colors duration-300 sm:inline-flex"
              >
                Start a project
                <Arrow />
              </Link>

              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="jp-menu"
                className="t-label border-paper/30 text-paper hover:border-paper flex min-h-11 items-center gap-3 rounded-full border px-5 transition-colors duration-300"
              >
                <span className="sr-only sm:not-sr-only">{open ? "Close" : "Menu"}</span>
                <span aria-hidden="true" className="relative block h-3 w-4">
                  <span
                    className={clsx(
                      "absolute left-0 block h-px w-full bg-current transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)]",
                      open ? "top-1.5 rotate-45" : "top-0.5",
                    )}
                  />
                  <span
                    className={clsx(
                      "absolute left-0 block h-px w-full bg-current transition-transform duration-400 ease-[cubic-bezier(0.76,0,0.24,1)]",
                      open ? "top-1.5 -rotate-45" : "top-2.5",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="jp-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="on-dark bg-ink text-paper fixed inset-0 z-90 overflow-y-auto"
          style={{ animation: "jp-menu-in 520ms cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div className="gutter mx-auto flex min-h-svh max-w-[110rem] flex-col justify-between pt-[calc(var(--nav-h)+3rem)] pb-14">
            <nav aria-label="All pages">
              <ul>
                {primaryNav.map((item, i) => (
                  <li key={item.href} className="rule">
                    <Link
                      href={item.href}
                      onClick={close}
                      className="group flex items-baseline justify-between gap-6 py-[clamp(0.9rem,2.2vw,1.6rem)]"
                      style={{
                        animation: `jp-menu-item 620ms cubic-bezier(0.16,1,0.3,1) ${
                          80 + i * 55
                        }ms both`,
                      }}
                    >
                      <span className="t-h2 font-display group-hover:text-ember-light transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                        {item.label}
                      </span>
                      <span className="t-label hidden text-paper/50 transition-colors duration-300 group-hover:text-paper/80 md:block">
                        {item.meta}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="t-label mb-4 text-paper/50">Get in touch</p>
                <a
                  href={`mailto:${site.email}`}
                  className="t-h3 font-display text-paper hover:text-ember-light block"
                >
                  {site.email}
                </a>
                <p className="t-body mt-3 text-paper/65">
                  {site.city}, {site.region} · {site.phones[0].number}
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-7 gap-y-2">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="t-label text-paper/70 transition-colors duration-300 hover:text-paper"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes jp-menu-in {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0% 0); }
        }
        @keyframes jp-menu-item {
          from { opacity: 0; transform: translate3d(0, 1.5rem, 0); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes jp-menu-in { from { clip-path: none; } to { clip-path: none; } }
          @keyframes jp-menu-item { from { opacity: 1; transform: none; } to { opacity: 1; transform: none; } }
        }
      `}</style>
    </>
  );
}
