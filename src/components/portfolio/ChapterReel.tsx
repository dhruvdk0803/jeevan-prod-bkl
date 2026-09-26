"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import type { Chapter, PortfolioImage } from "@/content/portfolio";
import { portfolioSrc, portfolioSrcSet } from "@/content/portfolio";

/**
 * One act of the portfolio.
 *
 * 1. Aperture — the act's key frame opens from a small window to full bleed
 *    as you scroll, behind a giant outlined act numeral that drifts away.
 * 2. Reel — a pinned horizontal strip of the act's featured frames. Vertical
 *    scroll drives it sideways; each frame's image counter-drifts inside its
 *    mask (parallax), and frames sit on a staggered baseline like contact
 *    prints laid on a table.
 *
 * ≥ 768px with motion: GSAP ScrollTrigger (pin + scrub). Below that, or with
 * reduced motion, the aperture is a still full-bleed frame and the reel is a
 * native, snap-scrolling swipe strip — no pinning on touch.
 *
 * Everything renders on the server as real <img>s with alt text, so the act
 * reads top to bottom with JS off.
 */

type Props = {
  chapter: Chapter;
  cover: PortfolioImage;
  frames: PortfolioImage[];
  total: number;
  tone: "ink" | "paper";
  onOpenWall: (chapter: Chapter["id"]) => void;
};

export function ChapterReel({ chapter, cover, frames, total, tone, onOpenWall }: Props) {
  const apertureRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let revert = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const aperture = apertureRef.current;
        const reel = reelRef.current;
        const track = trackRef.current;
        if (!aperture || !reel || !track) return;
        // Switch the markup into its pinned layout only while GSAP drives it.
        aperture.dataset.animated = "";
        reel.dataset.pinned = "";

        /* ---- 1. aperture ---- */
        const win = aperture.querySelector<HTMLElement>("[data-window]");
        const img = aperture.querySelector<HTMLElement>("[data-window] img");
        const numeral = aperture.querySelector<HTMLElement>("[data-numeral]");
        const title = aperture.querySelector<HTMLElement>("[data-title]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: aperture, start: "top top", end: "bottom bottom", scrub: 0.8 },
        });
        tl.fromTo(win, { clipPath: "inset(34% 38% 34% 38% round 6px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
          .fromTo(img, { scale: 1.45 }, { scale: 1, ease: "none" }, 0)
          .fromTo(numeral, { yPercent: 0, opacity: 1 }, { yPercent: -35, opacity: 0, ease: "none" }, 0)
          .fromTo(title, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none" }, 0.45);

        /* ---- 2. reel ---- */
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const move = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: reel,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });
        track.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -9 },
            {
              xPercent: 9,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                containerAnimation: move,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        return () => {
          delete aperture.dataset.animated;
          delete reel.dataset.pinned;
        };
      });

      // Images arriving can change widths; re-measure once they settle.
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 800);
      revert = () => {
        window.clearTimeout(t);
        mm.revert();
      };
    })();

    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  const dark = tone === "ink";

  return (
    <article
      id={`act-${chapter.id}`}
      aria-labelledby={`act-${chapter.id}-title`}
      className={clsx(dark ? "bg-ink text-paper on-dark" : "bg-paper text-ink", "relative")}
      {...(dark ? { "data-theme-dark": "" } : {})}
    >
      {/* ---- 1. Aperture ---- */}
      <div ref={apertureRef} className="group/ap relative md:data-[animated]:h-[160vh]">
        <div className="relative h-[88svh] overflow-hidden md:h-svh md:group-data-[animated]/ap:sticky md:group-data-[animated]/ap:top-0">
          <div data-window className="bg-ink absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-generated renditions with real srcset */}
            <img
              src={portfolioSrc(cover.id, "lg")}
              srcSet={portfolioSrcSet(cover)}
              sizes="100vw"
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover will-change-transform"
              style={{ backgroundColor: cover.color }}
            />
            <div aria-hidden="true" className="from-ink/85 via-ink/25 absolute inset-0 bg-gradient-to-t to-transparent" />
          </div>

          <span
            data-numeral
            aria-hidden="true"
            className={clsx(
              "pf-numeral pointer-events-none absolute inset-0 flex items-center justify-center mix-blend-difference",
              "text-paper",
            )}
          >
            {chapter.numeral}
          </span>

          <div data-title className="gutter text-paper absolute inset-x-0 bottom-[8svh] mx-auto max-w-[110rem]">
            <p className="t-label text-ember-light mb-4">
              Act {chapter.numeral} · {total} frames
            </p>
            <h2 id={`act-${chapter.id}-title`} className="pf-act-title font-display">
              {chapter.title}
            </h2>
            <p className="t-lead text-paper/80 mt-4 max-w-[36ch]">{chapter.line}</p>
          </div>
        </div>
      </div>

      {/* ---- 2. Reel ---- */}
      <div ref={reelRef} className="group/reel relative overflow-hidden md:data-[pinned]:h-svh">
        <div
          ref={trackRef}
          className="pf-swipe hide-scrollbar flex h-full items-center gap-[clamp(1rem,2.4vw,2.5rem)] overflow-x-auto px-[var(--spacing-gutter)] py-14 md:py-20 md:group-data-[pinned]/reel:overflow-visible md:group-data-[pinned]/reel:py-0 md:group-data-[pinned]/reel:pr-[20vw] md:group-data-[pinned]/reel:will-change-transform"
          role="list"
          aria-label={`${chapter.title} — selected frames`}
        >
          {frames.map((f, i) => {
            const portrait = f.orientation === "portrait";
            return (
              <figure
                key={f.id}
                role="listitem"
                className={clsx(
                  "pf-frame relative shrink-0",
                  portrait ? "w-[68vw] md:w-auto md:h-[68vh]" : "w-[84vw] md:w-auto md:h-[52vh]",
                  i % 3 === 1 && "md:translate-y-[9vh]",
                  i % 3 === 2 && "md:-translate-y-[7vh]",
                )}
                style={{ aspectRatio: `${f.width} / ${f.height}` }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[3px]" style={{ backgroundColor: f.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- pre-generated renditions with real srcset */}
                  <img
                    data-drift
                    src={portfolioSrc(f.id, "md")}
                    srcSet={portfolioSrcSet(f)}
                    sizes={portrait ? "(min-width: 768px) 40vw, 68vw" : "(min-width: 768px) 60vw, 84vw"}
                    alt={f.alt}
                    width={f.width}
                    height={f.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full scale-[1.2] object-cover"
                  />
                </div>
                <figcaption
                  className={clsx(
                    "t-label mt-3 flex justify-between gap-4 tabular-nums",
                    dark ? "text-paper/50" : "text-neutral",
                  )}
                >
                  <span>
                    {chapter.numeral}.{String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden="true">{f.id.toUpperCase()}</span>
                </figcaption>
              </figure>
            );
          })}

          <div role="listitem" className="flex shrink-0 flex-col items-start justify-center gap-6 pr-[var(--spacing-gutter)] md:w-[28vw]">
            <p className={clsx("t-h3 font-display max-w-[14ch]", dark ? "text-paper" : "text-ink")}>
              That&rsquo;s {frames.length} of {total}.
            </p>
            <button
              type="button"
              onClick={() => onOpenWall(chapter.id)}
              className={clsx(
                "t-label inline-flex min-h-11 items-center gap-3 rounded-full border px-6 transition-colors duration-300",
                dark
                  ? "border-paper/30 text-paper hover:bg-paper hover:text-ink"
                  : "border-ink/25 text-ink hover:bg-ink hover:text-paper",
              )}
            >
              See every {chapter.title.toLowerCase()} frame
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
