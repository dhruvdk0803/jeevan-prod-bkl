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
 * A card only becomes a link when the project actually has a case study, so
 * the site never ships a hover affordance that leads nowhere.
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
}: {
  project: Project;
  index?: number;
  className?: string;
  priority?: boolean;
  ratio?: "4/5" | "3/4" | "1/1" | "3/2";
  sizes?: string;
}) {
  const href = project.caseStudy ? `/work/${project.slug}` : undefined;

  const media = (
    <MediaReveal
      src={project.cover.src}
      alt={project.cover.alt}
      ratio={ratio ?? ratioFor[project.layout]}
      sizes={sizes ?? sizesFor[project.layout]}
      priority={priority}
      quality={82}
      imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
    />
  );

  const meta = (
    <div className="mt-6 flex items-start justify-between gap-6">
      <div>
        <h3 className="t-h3 font-display">
          <span className="transition-colors duration-300 group-hover:text-ember">
            {project.title}
          </span>
        </h3>
        <p className="t-label text-neutral mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
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
        <span className="t-label text-ink-3 shrink-0 tabular-nums">
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
        <span className="t-label text-ember mt-4 inline-flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View case study
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
    <span aria-hidden="true" className="bg-neutral-2 inline-block h-1 w-1 rounded-full" />
  );
}

/**
 * ProjectRhythm — a compact editorial index of featured work.
 *
 * Four across on desktop at the photographs' native 4:5, with alternating
 * vertical offsets so the row reads as a considered composition rather than a
 * grid. Deliberately small: the work is shown at a scale where the titles and
 * disciplines carry equal weight, instead of full-width slabs that crop
 * portrait photographs into wide letterboxes.
 */
export function ProjectRhythm({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-[clamp(1rem,2.5vw,2rem)] gap-y-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-4">
      {projects.map((project, i) => (
        <ProjectCard
          key={project.slug}
          project={project}
          index={i}
          ratio="4/5"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 46vw, 22vw"
          // Every other card drops, giving the row a staggered baseline.
          className={clsx(i % 2 === 1 && "lg:mt-[clamp(2rem,5vw,4.5rem)]")}
        />
      ))}
    </div>
  );
}
