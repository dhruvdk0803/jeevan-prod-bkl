"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Chapter, PortfolioImage } from "@/content/portfolio";
import { portfolioSrc } from "@/content/portfolio";

/**
 * Fullscreen viewer for the wall.
 *
 * A real modal: `role="dialog"` + `aria-modal`, focus moves in on open and
 * back to the tile on close, Tab is trapped, Escape closes, ←/→ step,
 * horizontal swipe steps on touch. Page scroll (and Lenis) is locked while
 * open. The next and previous large renditions are preloaded so stepping
 * feels instant.
 */

type Props = {
  images: PortfolioImage[];
  index: number;
  chapters: Chapter[];
  onIndex: (i: number) => void;
  onClose: () => void;
};

const lenis = () =>
  (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;

export function Lightbox({ images, index, chapters, onIndex, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const img = images[index];
  const count = images.length;

  const step = useCallback((d: number) => onIndex((index + d + count) % count), [index, count, onIndex]);

  /* Lock scroll + focus in/out. */
  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis()?.stop();
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      document.body.style.overflow = prev;
      lenis()?.start();
      returnTo?.focus();
    };
  }, []);

  /* Keys + focus trap. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return step(1);
      if (e.key === "ArrowLeft") return step(-1);
      if (e.key !== "Tab" || !ref.current) return;
      const f = Array.from(ref.current.querySelectorAll<HTMLElement>("button"));
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  /* Preload neighbours. */
  useEffect(() => {
    for (const d of [1, -1]) {
      const n = images[(index + d + count) % count];
      const i = new Image();
      i.src = portfolioSrc(n.id, "lg");
    }
  }, [index, images, count]);

  /* Swipe. */
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - t.y)) step(dx < 0 ? 1 : -1);
  };

  const chapter = chapters.find((c) => c.id === img.chapter);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Frame ${index + 1} of ${count}`}
      className="pf-lightbox bg-ink/97 text-paper on-dark fixed inset-0 z-[120] flex flex-col backdrop-blur-sm"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="gutter flex items-center justify-between py-4">
        <p className="t-label text-paper/60 tabular-nums" aria-live="polite">
          {String(index + 1).padStart(3, "0")} / {String(count).padStart(3, "0")}
          {chapter ? (
            <>
              <span className="text-ember-light"> · </span>
              Act {chapter.numeral} — {chapter.title}
            </>
          ) : null}
        </p>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="t-label border-paper/30 hover:border-paper flex min-h-11 items-center gap-3 rounded-full border px-5 transition-colors"
        >
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-[clamp(0.5rem,5vw,6rem)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-generated large rendition */}
        <img
          key={img.id}
          src={portfolioSrc(img.id, "lg")}
          alt={img.alt}
          width={img.width}
          height={img.height}
          className="pf-lightbox-img max-h-full max-w-full object-contain select-none"
          style={{ backgroundImage: `url(${img.blur})`, backgroundSize: "cover" }}
          draggable={false}
        />
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous frame"
          className="border-paper/25 hover:bg-paper hover:text-ink absolute top-1/2 left-3 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur transition-colors md:flex"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next frame"
          className="border-paper/25 hover:bg-paper hover:text-ink absolute top-1/2 right-3 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur transition-colors md:flex"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="gutter flex items-center justify-between gap-6 py-5">
        <p className="t-body text-paper/75 max-w-[70ch]">{img.alt}</p>
        <div className="flex shrink-0 gap-2 md:hidden">
          <button type="button" onClick={() => step(-1)} aria-label="Previous frame" className="border-paper/25 flex h-11 w-11 items-center justify-center rounded-full border">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next frame" className="border-paper/25 flex h-11 w-11 items-center justify-center rounded-full border">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
