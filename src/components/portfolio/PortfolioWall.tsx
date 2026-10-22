"use client";

import { useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import type { Chapter, ChapterId, PortfolioImage } from "@/content/portfolio";
import { portfolioSrc } from "@/content/portfolio";
import { scrollToId } from "@/lib/motion";
import { Lightbox } from "./Lightbox";

/**
 * The portfolio wall — every frame, filterable by category ("All" + one chip
 * per category), opening into the fullscreen viewer.
 *
 * Client component for the filter, batching and viewer state; it still
 * server-renders the first batch in full, with alt text, for SEO and no-JS.
 */

type Category = { chapter: Chapter; total: number };

type Props = {
  categories: Category[];
  images: PortfolioImage[];
  chapters: Chapter[];
};

type Filter = ChapterId | "all";

const WALL_BATCH = 60;

export function PortfolioWall({ categories, images, chapters }: Props) {
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
    // Deep in a long wall, switching category jumps back to its top.
    const wall = document.getElementById("wall");
    if (wall && wall.getBoundingClientRect().top < 0) requestAnimationFrame(() => scrollToId("wall"));
  }, []);

  const closeBox = useCallback(() => setOpen(null), []);

  return (
    <>
      {/* ---- The wall ---- */}
      <section id="wall" aria-labelledby="wall-heading" className="bg-paper-warm text-ink scroll-mt-[var(--nav-h)]">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,11vw,9rem)]">
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="t-label text-ember mb-5">The work</p>
              <h2 id="wall-heading" className="pf-act-title font-display">
                Every frame.
              </h2>
            </div>
            <p className="t-lead text-ink-3 max-w-[36ch]">
              All {images.length}, uncut. Pick a category, then open any frame full screen.
            </p>
          </div>

          <div
            role="toolbar"
            aria-label="Filter frames by category"
            className="pf-chips bg-paper-warm/90 sticky top-[calc(var(--nav-h)+0.5rem)] z-10 -mx-2 mb-10 flex gap-2 overflow-x-auto rounded-[28px] px-2 py-2 backdrop-blur md:flex-wrap md:overflow-visible"
          >
            <FilterChip active={filter === "all"} onClick={() => pickFilter("all")}>
              All <span className="tabular-nums opacity-60">{images.length}</span>
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.chapter.id} active={filter === c.chapter.id} onClick={() => pickFilter(c.chapter.id)}>
                {c.chapter.title} <span className="tabular-nums opacity-60">{c.total}</span>
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
                  style={{
                    aspectRatio: `${img.width} / ${img.height}`,
                    backgroundColor: img.color,
                    // A faint ink wash so near-white placeholders still read as
                    // tiles against the paper while the image loads.
                    backgroundImage: "linear-gradient(rgba(19,19,25,0.07), rgba(19,19,25,0.07))",
                  }}
                  aria-label={`Open frame: ${img.alt}`}
                  data-cursor="View"
                >
                  <WallImage img={img} />
                  <span
                    aria-hidden="true"
                    className="from-ink/60 pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                  <span
                    aria-hidden="true"
                    className="t-label text-paper absolute bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
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
      ref={(el) => {
        // Cached or fast images can finish before hydration attaches onLoad;
        // without this they would stay invisible at opacity 0.
        if (el?.complete && el.naturalWidth) el.dataset.loaded = "true";
      }}
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
        "t-label inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-5 whitespace-nowrap transition-colors duration-300",
        active ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}
