"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { MediaReveal } from "@/components/primitives/Media";
import { Arrow } from "@/components/primitives/Actions";
import { worlds } from "@/content/site";
import type { Project, World } from "@/content/types";

/**
 * WorkArchive — the interactive half of the work index: filter controls plus
 * the filtered project list. Lives in a client component because filtering
 * needs state and keyboard/aria wiring; the page itself stays a server
 * component and only hands over the project data.
 *
 * Layout: an asymmetric editorial grid. Every photo in the catalog is 4:5, so
 * rhythm comes from varying each item's column span and vertical offset
 * (driven by the project's `layout` field) rather than cropping to different
 * ratios.
 */

type Filter = "all" | World;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...worlds.map((w) => ({ id: w.id, label: w.discipline.toUpperCase() })),
];

const spanFor: Record<Project["layout"], string> = {
  full: "lg:col-span-8",
  offset: "lg:col-span-6 lg:col-start-7",
  duo: "lg:col-span-5",
  portrait: "lg:col-span-4",
};

const sizesFor: Record<Project["layout"], string> = {
  full: "(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 62vw",
  offset: "(max-width: 768px) 100vw, (max-width: 1024px) 45vw, 46vw",
  duo: "(max-width: 768px) 100vw, (max-width: 1024px) 45vw, 38vw",
  portrait: "(max-width: 768px) 100vw, (max-width: 1024px) 45vw, 30vw",
};

/** Vertical rhythm: cycles through three offsets so items never line up in a grid. */
const offsetForIndex = (i: number) => {
  const beat = i % 3;
  if (beat === 0) return "lg:mt-0";
  if (beat === 1) return "lg:mt-20";
  return "lg:mt-10";
};

export function WorkArchive({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.world === filter)),
    [projects, filter],
  );

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter work by discipline"
          className="flex flex-wrap gap-3"
        >
          {filters.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  "t-label min-h-11 rounded-full border px-6 transition-colors duration-300",
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/50 text-ink-3 hover:border-ink hover:text-ink",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="t-label text-neutral">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rule mt-16 pt-16 text-center">
          <p className="t-lead text-ink-3">No projects in this discipline yet.</p>
        </div>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-8">
          {filtered.map((project, i) => (
            <ArchiveItem key={project.slug} project={project} index={i} priority={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArchiveItem({
  project,
  index,
  priority,
}: {
  project: Project;
  index: number;
  priority: boolean;
}) {
  const hasCaseStudy = Boolean(project.caseStudy);
  const href = hasCaseStudy ? `/work/${project.slug}` : undefined;

  const media = (
    <div className="relative overflow-hidden" data-cursor={hasCaseStudy ? "View" : undefined}>
      <MediaReveal
        src={project.cover.src}
        alt={project.cover.alt}
        ratio="4/5"
        sizes={sizesFor[project.layout]}
        priority={priority}
        quality={82}
        // The archive list is client-filtered: items mount/unmount as the
        // filter changes, well after the motion runtime's one-time
        // ScrollTrigger pass. A scroll-triggered wipe would leave re-mounted
        // items permanently clipped, so this grid skips it in favour of the
        // CSS hover scale only.
        animate={false}
        imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
      />
    </div>
  );

  const meta = (
    <div className="mt-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="t-h3 font-display">
          <span className="transition-colors duration-300 group-hover:text-ember">
            {project.title}
          </span>
        </h3>
        <p className="t-label text-neutral mt-2">{project.discipline}</p>
      </div>
      {hasCaseStudy ? (
        <span className="t-label text-ember mt-1 inline-flex shrink-0 items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View
          <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
        </span>
      ) : null}
    </div>
  );

  const className = clsx(
    "group",
    spanFor[project.layout],
    offsetForIndex(index),
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {media}
        {meta}
      </Link>
    );
  }

  return (
    <article className={className}>
      {media}
      {meta}
    </article>
  );
}
