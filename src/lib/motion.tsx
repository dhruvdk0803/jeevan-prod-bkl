"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * MotionProvider — the single client-side animation runtime for the site.
 *
 * Design decision: motion is **declarative and attribute-driven**. Pages stay
 * React Server Components and simply mark elements up:
 *
 *   <div data-reveal="fade-up">                 fade + rise
 *   <h2 data-reveal="mask">                     line-by-line clip reveal
 *   <figure data-reveal="media">                clip-path wipe + scale settle
 *   <div data-reveal="fade-up" data-reveal-stagger>   stagger direct children
 *   <img data-parallax="0.12">                  subtle parallax
 *
 * One provider animates all of it. That keeps the client bundle small, keeps
 * every page server-rendered for SEO, and means no section needs its own
 * bespoke animation component.
 *
 * Safety: the pre-animation (hidden) CSS lives behind `.js-motion`, which is
 * only added once we know GSAP loaded AND reduced-motion is off. If either is
 * untrue, content renders in its final visible state.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia(REDUCED);
    if (mq.matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, LenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const Lenis = LenisMod.default;

      const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Native momentum on touch is better than emulated smoothing.
        syncTouch: false,
      });

      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // Expose for anchor links / menu close.
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;

      cleanup = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        delete (window as unknown as { __lenis?: unknown }).__lenis;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  /* Reveal wiring — re-run per route so new page content is picked up. */
  useEffect(() => {
    const mq = window.matchMedia(REDUCED);
    if (mq.matches) return;

    let cancelled = false;
    let kill: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      /* The blocking head script already added `.js-motion` (before first
         paint, so nothing flashes) and armed a failsafe that strips it if we
         never arrive. GSAP is here — disarm it. */
      const w = window as unknown as { __jpMotionFailsafe?: number };
      if (w.__jpMotionFailsafe) {
        clearTimeout(w.__jpMotionFailsafe);
        delete w.__jpMotionFailsafe;
      }
      document.documentElement.classList.add("js-motion");

      const ctx = gsap.context(() => {
        const start = "top 88%";

        /* ---- fade + rise (with optional child stagger) ---- */
        gsap.utils.toArray<HTMLElement>('[data-reveal="fade-up"]').forEach((el) => {
          const staggerChildren = el.hasAttribute("data-reveal-stagger");
          const targets = staggerChildren ? Array.from(el.children) : [el];
          if (staggerChildren) {
            gsap.set(el, { opacity: 1, y: 0 });
            gsap.set(targets, { opacity: 0, y: 28 });
          }
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: staggerChildren ? 0.075 : 0,
            delay: parseFloat(el.dataset.revealDelay ?? "0"),
            scrollTrigger: { trigger: el, start, once: true },
          });
        });

        /* ---- simple fade ---- */
        gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            duration: 1.1,
            ease: "power2.out",
            delay: parseFloat(el.dataset.revealDelay ?? "0"),
            scrollTrigger: { trigger: el, start, once: true },
          });
        });

        /* ---- line-by-line typographic mask ---- */
        gsap.utils.toArray<HTMLElement>('[data-reveal="mask"]').forEach((el) => {
          const lines = el.querySelectorAll(".line-mask > span");
          if (!lines.length) return;
          gsap.to(lines, {
            y: "0%",
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.085,
            delay: parseFloat(el.dataset.revealDelay ?? "0"),
            scrollTrigger: { trigger: el, start, once: true },
          });
        });

        /* ---- media: clip wipe + scale settle ---- */
        gsap.utils.toArray<HTMLElement>('[data-reveal="media"]').forEach((el) => {
          const inner = el.querySelector("img, video");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            delay: parseFloat(el.dataset.revealDelay ?? "0"),
          });
          tl.to(el, { clipPath: "inset(0 0 0% 0)", duration: 1.15, ease: "expo.out" });
          if (inner) tl.to(inner, { scale: 1, duration: 1.5, ease: "expo.out" }, 0);
        });

        /* ---- parallax ---- */
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = parseFloat(el.dataset.parallax ?? "0.1");
          gsap.fromTo(
            el,
            { yPercent: -amount * 50 },
            {
              yPercent: amount * 50,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        /* ---- sections that flip the page to dark ---- */
        const root = document.documentElement;
        gsap.utils.toArray<HTMLElement>("[data-theme-dark]").forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => root.classList.toggle("is-dark-section", self.isActive),
          });
        });
      });

      // Images settling can shift layout; recalc once everything has loaded.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const t = window.setTimeout(refresh, 600);

      kill = () => {
        window.removeEventListener("load", refresh);
        window.clearTimeout(t);
        ctx.revert();
        ScrollTrigger.getAll().forEach((s) => s.kill());
        document.documentElement.classList.remove("is-dark-section");
      };
    })();

    return () => {
      cancelled = true;
      kill?.();
    };
  }, [pathname]);

  return <>{children}</>;
}

/** Scroll helper that works with or without Lenis. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } })
    .__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
