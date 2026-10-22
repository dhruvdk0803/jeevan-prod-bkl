"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { PortfolioImage } from "@/content/portfolio";
import { portfolioSrc } from "@/content/portfolio";
import { FrameTunnel } from "./FrameTunnel";

/**
 * Portfolio opening — a short "roll film" before the wall.
 *
 * A tall section with a sticky, full-viewport stage. Inside: the WebGL frame
 * tunnel, and over it the only DOM that matters for SEO and screen readers —
 * the <h1>, the intro line, and a live frame counter + progress rule that the
 * tunnel drives by writing straight to the DOM (no React re-render per frame).
 *
 * Reduced motion → no tunnel, no tall scroll: a still mosaic of the same
 * frames in a single viewport. The tunnel is also skipped if WebGL fails.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduced = () => window.matchMedia(REDUCED).matches;

type Props = {
  frames: Pick<PortfolioImage, "id" | "width" | "height" | "color" | "alt">[];
  total: number;
  categoryCount: number;
};

const pad = (n: number) => String(n).padStart(3, "0");

export function PortfolioHero({ frames, total, categoryCount }: Props) {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => false);
  // No WebGL: the same still contact sheet as reduced motion.
  const [noGL, setNoGL] = useState(false);
  const still = reduced || noGL;
  const onFail = useCallback(() => setNoGL(true), []);
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLParagraphElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const onFrame = useCallback((index: number, p: number) => {
    if (counterRef.current) counterRef.current.textContent = pad(index + 1);
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    if (titleRef.current) {
      // Title holds, then pushes toward the lens and dissolves.
      const t = Math.min(1, Math.max(0, (p - 0.06) / 0.28));
      titleRef.current.style.opacity = String(1 - t);
      titleRef.current.style.transform = `scale(${1 + t * 0.35})`;
      titleRef.current.style.filter = `blur(${t * 10}px)`;
    }
    if (outroRef.current) {
      const t = Math.min(1, Math.max(0, (p - 0.72) / 0.2));
      outroRef.current.style.opacity = String(t);
      outroRef.current.style.transform = `translate3d(0, ${(1 - t) * 24}px, 0)`;
    }
  }, []);

  const onReady = useCallback(() => {
    stageRef.current?.setAttribute("data-ready", "");
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="portfolio-heading"
      className={still ? "bg-ink text-paper on-dark relative" : "bg-ink text-paper on-dark relative h-[240vh]"}
      data-theme-dark
    >
      <div ref={stageRef} className="group/stage sticky top-0 h-svh overflow-hidden">
        {still ? (
          <StillMosaic frames={frames} />
        ) : (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-[1400ms] group-data-[ready]/stage:opacity-100">
            <FrameTunnel
              frames={frames}
              sectionRef={sectionRef}
              onFrame={onFrame}
              onReady={onReady}
              onFail={onFail}
            />
          </div>
        )}

        {/* Film grain + letterbox vignette over the stage. */}
        <div aria-hidden="true" className="pf-grain pointer-events-none absolute" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(19,19,25,0.75)_100%)]"
        />

        {/* Title block. Padded by the nav height so it centres in the space
            below the fixed bar rather than in the raw viewport. */}
        <div
          ref={titleRef}
          className="gutter pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-[var(--nav-h)] text-center will-change-transform"
        >
          {/* Ink scrim behind the type so frames flying behind it never wash
              it out. It sits inside the title block, so it fades with it. */}
          <div aria-hidden="true" className="pf-scrim absolute inset-0 -z-10" />
          <p className="t-label text-ember-light pf-rise pf-legible mb-6" style={{ "--d": "0.1s" } as React.CSSProperties}>
            {categoryCount} categories · {total} frames
          </p>
          {/* The label gives assistive tech one word; crawlers read the adjacent
              letter spans (no whitespace between them) as "Portfolio" too. */}
          <h1 id="portfolio-heading" aria-label="Portfolio" className="pf-title pf-legible font-display">
            {"Portfolio".split("").map((ch, i) => (
              <span key={i} aria-hidden="true" className="pf-letter" style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </h1>
          <p
            className="t-lead pf-rise pf-legible text-paper/90 mt-6 max-w-[40ch] text-balance"
            style={{ "--d": "0.9s" } as React.CSSProperties}
          >
            Stories, brands and experiences, told one frame at a time.
          </p>
        </div>

        <p
          ref={outroRef}
          className="gutter t-statement font-display pf-legible pointer-events-none absolute inset-x-0 bottom-[22%] mx-auto max-w-[22ch] text-center opacity-0"
          aria-hidden="true"
        >
          Every frame, below.
        </p>

        {/* HUD: scroll cue, progress rule and frame counter share one baseline
            at the foot of the stage, clear of the fixed nav. */}
        {!still ? (
          <div className="gutter pointer-events-none absolute inset-x-0 bottom-[clamp(1.5rem,4vh,2.5rem)] mx-auto flex max-w-[110rem] items-center gap-5">
            <span className="t-label text-paper/70 shrink-0">Scroll to roll</span>
            <span className="bg-paper/20 relative h-px flex-1 overflow-hidden">
              <span ref={barRef} className="bg-ember-light absolute inset-0 origin-left scale-x-0" />
            </span>
            <span className="t-label text-paper/70 shrink-0 tabular-nums" aria-hidden="true">
              FR <span ref={counterRef}>001</span> / {pad(frames.length)}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Reduced-motion stage: the same frames, still, as a quiet contact sheet. */
function StillMosaic({ frames }: { frames: Props["frames"] }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 grid-rows-6 gap-1 opacity-35 md:grid-cols-6 md:grid-rows-3">
      {frames.slice(0, 18).map((f) => (
        // eslint-disable-next-line @next/next/no-img-element -- pre-sized static rendition
        <img key={f.id} src={portfolioSrc(f.id, "sm")} alt="" className="h-full min-h-0 w-full object-cover" decoding="async" />
      ))}
    </div>
  );
}
