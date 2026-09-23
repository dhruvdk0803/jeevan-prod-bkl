import Link from "next/link";
import { preload } from "react-dom";
import { Button } from "@/components/primitives/Actions";
import { worlds } from "@/content/site";
import { HeroVideo, HeroVideoToggle } from "./HeroVideo";

/**
 * Homepage hero — full-bleed looping brand film with a world index.
 *
 * The film (public/media/hero, encoded from JP's master: 1080p for desktop,
 * 720p for phones, muted, looping) plays edge to edge at full viewport height
 * behind a heavy scrim, so the type holds AA contrast over any frame.
 *
 * The statement, scroll cue and world index stay a **server-rendered,
 * CSS-choreographed** flex column: this is the LCP moment, so nothing waits on
 * GSAP, Lenis or hydration. The poster frame is preloaded at high priority and
 * is what paints first; the video fades in over it once it can play.
 */

const LINES = ["We create stories, brands,", "and experiences that", "bring people together."];

const POSTER = "/media/hero/hero-poster.jpg";

export function Hero() {
  preload(POSTER, { as: "image", fetchPriority: "high" });
  return (
    <section
      className="on-dark bg-ink text-paper relative isolate flex min-h-[94svh] flex-col overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* ---- Full-bleed brand film ---- */}
      <div className="jp-film absolute inset-0 -z-20">
        <HeroVideo poster={POSTER} />
      </div>

      {/* Scrim — heavy enough to hold AA contrast for light type over any frame. */}
      <div
        aria-hidden="true"
        className="from-ink/85 via-ink/55 to-ink/92 absolute inset-0 -z-10 bg-gradient-to-b"
      />

      {/* ---- Centred statement ---- */}
      <div className="gutter mx-auto flex w-full max-w-[110rem] flex-1 flex-col items-center justify-center pt-[calc(var(--nav-h)+3rem)] pb-10 text-center">
        <p
          className="t-label jp-in text-ember-light mb-7 flex flex-wrap items-center justify-center gap-x-3"
          style={{ "--d": "0.1s" } as React.CSSProperties}
        >
          <span>San Diego</span>
          <span aria-hidden="true" className="bg-ember-light/50 h-1 w-1 rounded-full" />
          <span>Media</span>
          <span aria-hidden="true" className="bg-ember-light/50 h-1 w-1 rounded-full" />
          <span>Marketing</span>
          <span aria-hidden="true" className="bg-ember-light/50 h-1 w-1 rounded-full" />
          <span>Events</span>
        </p>

        <h1 id="hero-heading" className="t-hero mx-auto max-w-[20ch]">
          {LINES.map((line, i) => (
            <span className="line-mask" key={line}>
              <span
                className="jp-line"
                style={{ "--d": `${0.24 + i * 0.1}s` } as React.CSSProperties}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="t-lead jp-in mx-auto mt-7 max-w-[44ch] text-paper/80"
          style={{ "--d": "0.68s" } as React.CSSProperties}
        >
          A creative company telling stories through media, building brands through
          marketing, and bringing people together through events.
        </p>

        <div
          className="jp-in mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ "--d": "0.82s" } as React.CSSProperties}
        >
          <Button href="/work" variant="light">
            Explore our work
          </Button>
          <Button href="/contact" variant="ghost">
            Start a project
          </Button>
        </div>
      </div>

      {/* ---- Scroll cue + world index, both in normal flow ---- */}
      <div className="jp-in" style={{ "--d": "1s" } as React.CSSProperties}>
        <div className="gutter relative mx-auto flex max-w-[110rem] justify-center pb-7">
          <div className="absolute right-[var(--spacing-gutter)] bottom-7">
            <HeroVideoToggle />
          </div>
          <span aria-hidden="true" className="flex flex-col items-center gap-2.5">
            <span className="t-label text-paper/55">Scroll</span>
            <span className="bg-paper/20 relative h-9 w-px overflow-hidden">
              <span className="jp-scroll bg-paper absolute inset-x-0 top-0 h-1/2" />
            </span>
          </span>
        </div>

        <nav aria-label="What we do" className="border-t border-white/15">
          <ul className="gutter mx-auto grid max-w-[110rem] grid-cols-3">
            {worlds.map((world, i) => (
              <li key={world.id} className={i > 0 ? "border-l border-white/15" : ""}>
                <Link
                  href={world.href}
                  className="group flex h-full flex-col gap-1 px-[clamp(0.5rem,2vw,2rem)] py-[clamp(0.9rem,2vw,1.5rem)] transition-colors duration-300 hover:bg-white/5"
                >
                  <span className="t-label text-paper/45 tabular-nums">{world.index}</span>
                  <span className="font-display group-hover:text-ember-light text-[clamp(1rem,1.7vw,1.5rem)] leading-tight transition-colors duration-300">
                    {world.title}
                  </span>
                  <span className="t-label text-paper/55">{world.discipline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        .jp-in    { opacity: 0; animation: jp-rise 900ms cubic-bezier(0.16,1,0.3,1) var(--d, 0s) both; }
        .jp-line  { display: block; transform: translate3d(0, 110%, 0);
                    animation: jp-lift 1050ms cubic-bezier(0.16,1,0.3,1) var(--d, 0s) both; }
        .jp-film  { transform: scale(1.06);
                    animation: jp-settle 2600ms cubic-bezier(0.16,1,0.3,1) both; }
        .jp-scroll { animation: jp-drop 2400ms cubic-bezier(0.76,0,0.24,1) 1.4s infinite; }

        @keyframes jp-rise   { from { opacity: 0; transform: translate3d(0,1.25rem,0); }
                               to   { opacity: 1; transform: none; } }
        @keyframes jp-lift   { from { transform: translate3d(0,110%,0); }
                               to   { transform: none; } }
        @keyframes jp-settle { from { transform: scale(1.1); } to { transform: scale(1); } }
        @keyframes jp-drop   { 0% { transform: translateY(-100%); }
                               60%,100% { transform: translateY(200%); } }

        @media (prefers-reduced-motion: reduce) {
          .jp-in, .jp-line, .jp-film, .jp-scroll {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
