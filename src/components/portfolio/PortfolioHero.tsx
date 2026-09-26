"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import type { PortfolioImage } from "@/content/portfolio";
import { portfolioSrc } from "@/content/portfolio";
import { FrameTunnel } from "./FrameTunnel";

/**
 * Portfolio opening — "roll film".
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
  actCount: number;
};

const pad = (n: number) => String(n).padStart(3, "0");

export function PortfolioHero({ frames, total, actCount }: Props) {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => false);
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
      const t = Math.min(1, Math.max(0, (p - 0.04) / 0.18));
      titleRef.current.style.opacity = String(1 - t);
      titleRef.current.style.transform = `scale(${1 + t * 0.35})`;
      titleRef.current.style.filter = `blur(${t * 10}px)`;
    }
    if (outroRef.current) {
      const t = Math.min(1, Math.max(0, (p - 0.8) / 0.14));
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
      className={reduced ? "bg-ink text-paper on-dark relative" : "bg-ink text-paper on-dark relative h-[460vh]"}
      data-theme-dark
    >
      <div ref={stageRef} className="group/stage sticky top-0 h-svh overflow-hidden">
        {reduced ? (
          <StillMosaic frames={frames} />
        ) : (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-[1400ms] group-data-[ready]/stage:opacity-100">
            <FrameTunnel frames={frames} sectionRef={sectionRef} onFrame={onFrame} onReady={onReady} />
          </div>
        )}

        {/* Film grain + letterbox vignette over the stage. */}
        <div aria-hidden="true" className="pf-grain pointer-events-none absolute" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(19,19,25,0.75)_100%)]"
        />

        {/* ---- HUD ---- */}
        <div className="gutter pointer-events-none absolute inset-x-0 top-[calc(var(--nav-h)+1.5rem)] mx-auto flex max-w-[110rem] items-start justify-between">
          <p className="t-label text-paper/60 hidden sm:block">
            Jeevan Productions
            <span className="text-ember-light"> · </span>
            Portfolio
          </p>
          <p className="t-label text-paper/60 ml-auto tabular-nums" aria-hidden={!reduced}>
            {reduced ? (
              <>{total} frames</>
            ) : (
              <>
                FR <span ref={counterRef}>001</span> / {pad(frames.length)}
              </>
            )}
          </p>
        </div>

        <div
          ref={titleRef}
          className="gutter pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center will-change-transform"
        >
          <p className="t-label text-ember-light pf-rise mb-6" style={{ "--d": "0.1s" } as React.CSSProperties}>
            {actCount} acts · {total} frames
          </p>
          {/* The label gives assistive tech one word; crawlers read the adjacent
              letter spans (no whitespace between them) as "Portfolio" too. */}
          <h1 id="portfolio-heading" aria-label="Portfolio" className="pf-title font-display">
            {"Portfolio".split("").map((ch, i) => (
              <span key={i} aria-hidden="true" className="pf-letter" style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </h1>
          <p className="t-lead pf-rise text-paper/75 mt-6 max-w-[40ch]" style={{ "--d": "0.9s" } as React.CSSProperties}>
            Stories, brands and experiences — told one frame at a time.
          </p>
        </div>

        <p
          ref={outroRef}
          className="gutter t-statement font-display pointer-events-none absolute inset-x-0 bottom-[22%] mx-auto max-w-[22ch] text-center opacity-0"
          aria-hidden="true"
        >
          Now, the story in {actCount} acts.
        </p>

        {!reduced ? (
          <div className="gutter pointer-events-none absolute inset-x-0 bottom-8 mx-auto flex max-w-[110rem] items-center gap-5">
            <span className="t-label text-paper/55 shrink-0">Scroll to roll</span>
            <span className="bg-paper/15 relative h-px flex-1 overflow-hidden">
              <span ref={barRef} className="bg-ember-light absolute inset-0 origin-left scale-x-0" />
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
    <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 gap-1 opacity-35 md:grid-cols-6">
      {frames.slice(0, 18).map((f) => (
        // eslint-disable-next-line @next/next/no-img-element -- pre-sized static rendition
        <img key={f.id} src={portfolioSrc(f.id, "sm")} alt="" className="h-full w-full object-cover" loading="lazy" />
      ))}
    </div>
  );
}
