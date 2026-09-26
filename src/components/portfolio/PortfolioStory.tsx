"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import type { Chapter, ChapterId, PortfolioImage } from "@/content/portfolio";
import { portfolioSrc } from "@/content/portfolio";
import { scrollToId } from "@/lib/motion";
import { ChapterReel } from "./ChapterReel";
import { Lightbox } from "./Lightbox";

/**
 * Everything after the opening: the contents, the acts, and the wall.
 *
 * Client-side only because the acts and the wall share one piece of state —
 * the wall's filter — so "See every … frame" at the end of an act can jump to
 * the wall pre-filtered. All of it still server-renders in full.
 */

type Act = { chapter: Chapter; cover: PortfolioImage; reel: PortfolioImage[]; total: number };

type Props = {
  acts: Act[];
  images: PortfolioImage[];
  chapters: Chapter[];
};

type Filter = ChapterId | "all";

const WALL_BATCH = 60;

export function PortfolioStory({ acts, images, chapters }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  // The wall grows in batches so the page (and the DOM) stays light.
  const [shown, setShown] = useState(WALL_BATCH);

  const visible = useMemo(
    () => (filter === "all" ? images : images.filter((i) => i.chapter === filter)),
    [filter, images],
  );

  const pickFilter = useCallback((f: Filter) => {
    setFilter(f);
    setShown(WALL_BATCH);
  }, []);

  const openWall = useCallback((id: ChapterId) => {
    pickFilter(id);
    requestAnimationFrame(() => scrollToId("wall"));
  }, [pickFilter]);

  const closeBox = useCallback(() => setOpen(null), []);

  return (
    <>
      <Contents acts={acts} />

      {acts.map((act, i) => (
        <ChapterReel
          key={act.chapter.id}
          chapter={act.chapter}
          cover={act.cover}
          frames={act.reel}
          total={act.total}
          tone={i % 2 === 0 ? "ink" : "paper"}
          onOpenWall={openWall}
        />
      ))}

      {/* ---- The wall ---- */}
      <section id="wall" aria-labelledby="wall-heading" className="bg-paper-warm text-ink scroll-mt-[var(--nav-h)]">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,11vw,9rem)]">
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="t-label text-ember mb-5">The wall</p>
              <h2 id="wall-heading" className="pf-act-title font-display">
                Every frame.
              </h2>
            </div>
            <p className="t-lead text-ink-3 max-w-[36ch]">
              All {images.length}, uncut. Filter by act, then open any frame full screen.
            </p>
          </div>

          <div role="toolbar" aria-label="Filter frames by act" className="mb-10 flex flex-wrap gap-2">
            <FilterChip active={filter === "all"} onClick={() => pickFilter("all")}>
              All <span className="tabular-nums opacity-60">{images.length}</span>
            </FilterChip>
            {acts.map((a) => (
              <FilterChip key={a.chapter.id} active={filter === a.chapter.id} onClick={() => pickFilter(a.chapter.id)}>
                {a.chapter.numeral} · {a.chapter.title} <span className="tabular-nums opacity-60">{a.total}</span>
              </FilterChip>
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {Math.min(shown, visible.length)} of {visible.length} frames
          </p>

          <ul className="pf-wall">
            {visible.slice(0, shown).map((img, i) => (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="pf-tile group relative block w-full overflow-hidden rounded-[3px]"
                  style={{ aspectRatio: `${img.width} / ${img.height}`, backgroundColor: img.color }}
                  aria-label={`Open frame: ${img.alt}`}
                  data-cursor="View"
                >
                  <WallImage img={img} />
                  <span
                    aria-hidden="true"
                    className="t-label text-paper absolute bottom-2 left-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {img.id.toUpperCase()}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {shown < visible.length ? (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + WALL_BATCH)}
                className="t-label border-ink/25 hover:bg-ink hover:text-paper inline-flex min-h-11 items-center gap-3 rounded-full border px-7 transition-colors duration-300"
              >
                Show more frames
                <span className="tabular-nums opacity-60">
                  {Math.min(WALL_BATCH, visible.length - shown)} of {visible.length - shown} left
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {open !== null && visible[open] ? (
        <Lightbox images={visible} index={open} chapters={chapters} onIndex={setOpen} onClose={closeBox} />
      ) : null}
    </>
  );
}

function WallImage({ img }: { img: PortfolioImage }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-generated renditions with real srcset
    <img
      src={portfolioSrc(img.id, "sm")}
      srcSet={`${portfolioSrc(img.id, "sm")} 480w, ${portfolioSrc(img.id, "md")} 1200w`}
      sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      alt=""
      width={img.width}
      height={img.height}
      loading="lazy"
      decoding="async"
      data-loaded="false"
      onLoad={(e) => (e.currentTarget.dataset.loaded = "true")}
      className="h-full w-full object-cover"
    />
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "t-label inline-flex min-h-11 items-center gap-2 rounded-full border px-5 transition-colors duration-300",
        active ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The contents page of the film: one row per act. On pointer devices a
 * preview of the act's key frame floats with the cursor.
 */
function Contents({ acts }: { acts: Act[] }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = previewRef.current;
    if (!el || e.pointerType !== "mouse") return;
    el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 120}px, 0) rotate(-3deg)`;
  };

  return (
    <section aria-labelledby="contents-heading" className="bg-paper text-ink relative" onPointerMove={onMove}>
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,11vw,9rem)]">
        <div className="mb-14 grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
          <h2 id="contents-heading" className="t-label text-ember">
            Contents
          </h2>
          <p className="t-statement font-display max-w-[20ch]">
            {acts.length} kinds of room. One instinct: find the moment that matters.
          </p>
        </div>

        <ol>
          {acts.map((a) => (
            <li key={a.chapter.id} className="rule">
              <a
                href={`#act-${a.chapter.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(`act-${a.chapter.id}`);
                }}
                onPointerEnter={() => setHover(a.chapter.id)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(null)}
                className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 py-[clamp(1rem,2.4vw,1.8rem)] md:grid-cols-[6rem_1fr_1fr_auto]"
              >
                <span className="font-display text-neutral text-[clamp(1.25rem,2vw,1.75rem)] italic">
                  {a.chapter.numeral}
                </span>
                <span className="t-h2 font-display group-hover:text-ember transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                  {a.chapter.title}
                </span>
                <span className="t-body text-ink-3 hidden md:block">{a.chapter.line}</span>
                <span className="t-label text-neutral tabular-nums">{String(a.total).padStart(3, "0")}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div
        ref={previewRef}
        aria-hidden="true"
        className="pf-preview pointer-events-none fixed top-0 left-0 z-50 hidden w-[min(22vw,320px)] overflow-hidden rounded-[3px] shadow-2xl md:block"
        style={{ opacity: hover ? 1 : 0 }}
      >
        {acts.map((a) => (
          // eslint-disable-next-line @next/next/no-img-element -- decorative preview
          <img
            key={a.chapter.id}
            src={portfolioSrc(a.cover.id, "sm")}
            alt=""
            width={320}
            height={400}
            loading="lazy"
            className={clsx("aspect-[4/5] w-full object-cover", hover === a.chapter.id ? "block" : "hidden")}
          />
        ))}
      </div>
    </section>
  );
}
