import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/primitives/Actions";
import { photoCatalog } from "@/content/photo-catalog";
import { worlds } from "@/content/site";

/**
 * Homepage hero — full-bleed cinematic triptych with a world index.
 *
 * Three of JP's own photographs run edge to edge at full viewport height, so
 * the imagery reads as solid and immersive rather than as thumbnails floating
 * on a page. Because every work photo is 4:5 portrait, splitting the viewport
 * into three tall columns crops them far less than stretching one photo across
 * a widescreen would. Below `sm` it collapses to a single full-bleed image.
 *
 * Layout is a plain flex column — statement centred in the remaining space,
 * scroll cue and world index in normal flow at the bottom. Nothing is
 * absolutely positioned, so nothing can drift out of alignment as the
 * viewport changes.
 *
 * Deliberately a **server component with CSS-only choreography**. This is the
 * LCP moment, so it must not wait on GSAP, Lenis or hydration: the first image
 * is preloaded, the type animates on pure keyframes, and the sequence plays
 * even if the JS bundle never arrives.
 */

const LINES = ["We create stories, brands,", "and experiences that", "bring people together."];

/** Warm frames that hold up cropped tall and side by side. */
const PANEL_SOURCES = [
  "/media/work/photo-24.jpeg", // cultural celebration — vivid red
  "/media/work/photo-13.jpeg", // lakeside at sunset — golden
  "/media/work/photo-9.jpeg", //  venue at dusk — amber
];

const panels = PANEL_SOURCES.map((src) => {
  const found = photoCatalog.find((p) => p.src === src);
  if (!found) throw new Error(`Hero panel missing from catalog: ${src}`);
  return found;
});

export function Hero() {
  return (
    <section
      className="on-dark bg-ink text-paper relative isolate flex min-h-[94svh] flex-col overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* ---- Solid full-bleed imagery ---- */}
      <div className="absolute inset-0 -z-20 grid grid-cols-1 sm:grid-cols-3">
        {panels.map((photo, i) => (
          <div
            key={photo.src}
            className={`jp-panel relative h-full ${i > 0 ? "hidden sm:block" : ""}`}
            style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, 34vw"
              quality={82}
              preload={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              className="h-full w-full object-cover"
            />
            {/* Hairline seam between frames — reads as a deliberate triptych. */}
            {i > 0 ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-px bg-white/15"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Scrim — heavy enough to hold AA contrast for light type over any frame. */}
      <div
        aria-hidden="true"
        className="from-ink/92 via-ink/72 to-ink/95 absolute inset-0 -z-10 bg-gradient-to-b"
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
        <div className="flex justify-center pb-7">
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
        .jp-panel img { transform: scale(1.1);
                    animation: jp-settle 2600ms cubic-bezier(0.16,1,0.3,1) var(--d, 0s) both; }
        .jp-scroll { animation: jp-drop 2400ms cubic-bezier(0.76,0,0.24,1) 1.4s infinite; }

        @keyframes jp-rise   { from { opacity: 0; transform: translate3d(0,1.25rem,0); }
                               to   { opacity: 1; transform: none; } }
        @keyframes jp-lift   { from { transform: translate3d(0,110%,0); }
                               to   { transform: none; } }
        @keyframes jp-settle { from { transform: scale(1.1); } to { transform: scale(1); } }
        @keyframes jp-drop   { 0% { transform: translateY(-100%); }
                               60%,100% { transform: translateY(200%); } }

        @media (prefers-reduced-motion: reduce) {
          .jp-in, .jp-line, .jp-panel img, .jp-scroll {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
