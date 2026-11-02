import Link from "next/link";
import { clsx } from "clsx";
import { MediaReveal } from "./Media";
import { Arrow } from "./Actions";
import type { Project } from "@/content/types";

/**
 * ProjectCard — one card, four editorial layouts.
 *
 * The work index deliberately avoids a repeating grid of identical tiles.
 * Each project declares a `layout`, and the index alternates between them so
 * the page reads like a magazine spread rather than a product catalogue.
 *
 * Projects that used to have a case study now link to the portfolio (the
 * Work archive was folded into it); the rest stay plain, so the site never
 * ships a hover affordance that leads nowhere.
 */

const sizesFor: Record<Project["layout"], string> = {
  full: "(max-width: 768px) 100vw, 90vw",
  duo: "(max-width: 768px) 100vw, 45vw",
  offset: "(max-width: 768px) 100vw, 55vw",
  portrait: "(max-width: 768px) 100vw, 38vw",
};

const ratioFor: Record<Project["layout"], "4/5" | "3/4" | "1/1" | "3/2"> = {
  full: "3/2",
  duo: "4/5",
  offset: "3/4",
  portrait: "4/5",
};

export function ProjectCard({
  project,
  index,
  className,
  priority = false,
  ratio,
  sizes,
  cover,
}: {
  project: Project;
  index?: number;
  className?: string;
  priority?: boolean;
  ratio?: "4/5" | "3/4" | "1/1" | "3/2";
  sizes?: string;
  /** Replaces the project's own cover for this placement only. */
  cover?: { src: string; alt: string };
}) {
  const image = cover ?? project.cover;
  const href = project.caseStudy ? "/portfolio" : undefined;

  const media = (
    <MediaReveal
      src={image.src}
      alt={image.alt}
      ratio={ratio ?? ratioFor[project.layout]}
      sizes={sizes ?? sizesFor[project.layout]}
      priority={priority}
      quality={82}
      imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
    />
  );

  const meta = (
    <div className="mt-6 flex items-baseline justify-between gap-6">
      <div>
        <h3 className="t-h3 font-display">
          <span className="transition-colors duration-300 group-hover:text-ember [.on-dark_&]:group-hover:text-ember-light">
            {project.title}
          </span>
        </h3>
        <p className="t-label text-neutral mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 leading-[1.5] [.on-dark_&]:text-paper/60">
          <span>{project.discipline}</span>
          {/* Client, year and location only render when JP has confirmed them. */}
          {project.client ? (
            <>
              <Dot />
              <span>{project.client}</span>
            </>
          ) : null}
          {project.year ? (
            <>
              <Dot />
              <span>{project.year}</span>
            </>
          ) : null}
          {project.location ? (
            <>
              <Dot />
              <span>{project.location}</span>
            </>
          ) : null}
        </p>
      </div>
      {typeof index === "number" ? (
        <span className="t-label text-ink-3 shrink-0 tabular-nums [.on-dark_&]:text-paper/50">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
    </div>
  );

  const body = (
    <>
      <div
        className="relative overflow-hidden"
        data-cursor={href ? "View" : undefined}
      >
        {media}
      </div>
      {meta}
      {href ? (
        <span className="t-label text-ember mt-4 inline-flex items-center gap-2 opacity-0 [.on-dark_&]:text-ember-light transition-opacity duration-300 group-hover:opacity-100">
          View portfolio
          <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={clsx("group block", className)}>
        {body}
      </Link>
    );
  }

  return (
    <article className={clsx("group block", className)}>{body}</article>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="bg-neutral-2 inline-block h-1 w-1 rounded-full [.on-dark_&]:bg-paper/40"
    />
  );
}
