import Link from "next/link";
import { clsx } from "clsx";
import type { Service, WorldMeta } from "@/content/types";
import { services as allServices } from "@/content/services";
import { projectsByWorld } from "@/content/projects";
import { serviceCovers } from "@/content/site-photos";
import { AnimatedHeading, IndexLabel, Label } from "@/components/primitives/Type";
import { ProjectCard } from "@/components/primitives/ProjectCard";
import { Arrow } from "@/components/primitives/Actions";

/**
 * One full-bleed "room" per world. Each world gets its own theme so moving
 * between them reads as moving between rooms in a building, not scrolling a
 * repeating template:
 *  - Stories   → paper, serif-forward, generous whitespace (print/editorial)
 *  - Brands    → sand, tighter grid, ember-forward chips (studio wall)
 *  - Experiences → dark ink, on-dark, high contrast (the room at night)
 *
 * All three share one skeleton so they line up with each other: the index
 * label sits above a 5/7 split (world copy left, services right) whose two
 * columns start on the same line, and the project row below sits on the same
 * twelve-column grid, so card edges fall on the copy and services columns.
 */

type Theme = "paper" | "sand" | "dark";

const themeClasses: Record<Theme, string> = {
  paper: "bg-paper text-ink",
  sand: "bg-sand text-ink",
  dark: "on-dark bg-ink text-paper",
};

const chipClasses: Record<Theme, string> = {
  paper: "border border-ink/15 text-ink-3",
  sand: "border border-ember/25 text-ember-deep bg-white/40",
  dark: "border border-paper/25 text-paper/80",
};

function WorkLink({ dark, className }: { dark: boolean; className?: string }) {
  return (
    <Link
      href="/work"
      className={clsx(
        "group t-label inline-flex shrink-0 items-center gap-2.5 py-2 transition-colors duration-300",
        dark ? "text-paper/80 hover:text-ember-light" : "text-ink hover:text-ember",
        className,
      )}
    >
      <span className="relative">
        See all work
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100"
        />
      </span>
      <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
    </Link>
  );
}

export function WorldSection({ world, theme }: { world: WorldMeta; theme: Theme }) {
  const worldServices: Service[] = allServices.filter((s) => s.world === world.id);
  const relatedProjects = projectsByWorld(world.id).slice(0, 3);
  const dark = theme === "dark";
  const single = relatedProjects.length === 1 ? relatedProjects[0] : undefined;

  return (
    <section
      id={world.id}
      aria-labelledby={`${world.id}-heading`}
      data-theme-dark={dark ? true : undefined}
      className={clsx(
        "scroll-mt-[var(--nav-h)] py-[clamp(5rem,12vw,10rem)]",
        themeClasses[theme],
      )}
    >
      <div className="gutter mx-auto max-w-[110rem]">
        <IndexLabel index={world.index} className={clsx("mb-6", dark && "text-paper/60")}>
          {world.discipline}
        </IndexLabel>

        <div className="grid gap-x-14 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <AnimatedHeading
              as="h2"
              size="statement"
              id={`${world.id}-heading`}
              lines={[world.title]}
            />
            <p
              className={clsx(
                "t-lead mt-7 max-w-[36ch]",
                dark ? "text-paper/75" : "text-ink-3",
              )}
              data-reveal="fade-up"
              data-reveal-delay={0.1}
            >
              {world.idea}
            </p>
            <p
              className={clsx(
                "t-body mt-5 max-w-[42ch]",
                dark ? "text-paper/60" : "text-neutral",
              )}
              data-reveal="fade-up"
              data-reveal-delay={0.15}
            >
              {world.blurb}
            </p>
          </div>

          <div className="md:col-span-7">
            {worldServices.length > 0 ? (
              <div className="flex flex-col gap-12">
                {worldServices.map((service, i) => (
                  <div
                    key={service.id}
                    className={clsx(i > 0 && (dark ? "border-t border-paper/15 pt-12" : "rule pt-12"))}
                    data-reveal="fade-up"
                    data-reveal-delay={i * 0.08}
                  >
                    <h3 className="t-h3 font-display">{service.name}</h3>
                    <p
                      className={clsx(
                        "t-body mt-4 max-w-[52ch]",
                        dark ? "text-paper/70" : "text-ink-3",
                      )}
                    >
                      {service.description}
                    </p>
                    {service.includes.length > 0 ? (
                      <ul className="mt-6 flex flex-wrap gap-2.5">
                        {service.includes.map((item) => (
                          <li
                            key={item}
                            className={clsx(
                              "t-label rounded-full px-4 py-2",
                              chipClasses[theme],
                            )}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p
                className={clsx(
                  "t-body",
                  dark ? "text-paper/60" : "text-neutral",
                )}
              >
                Full details for this world are being finalized. Reach out
                and we&rsquo;ll walk you through what&rsquo;s possible.
              </p>
            )}
          </div>
        </div>

        {relatedProjects.length > 0 ? (
          <div className="mt-[clamp(4rem,8vw,6rem)]">
            <div className="mb-8 flex items-center justify-between gap-6">
              <Label className={dark ? "text-paper/60" : undefined}>From the work</Label>
              {single ? null : <WorkLink dark={dark} />}
            </div>

            {single ? (
              // One project: the card keeps the same size as the 3-up rows and
              // the project's own summary sits on the services column, so the
              // row echoes the split above instead of leaving a lone card
              // stranded at the left of an empty 3-up grid.
              <div className="grid gap-x-14 gap-y-10 md:grid-cols-12 md:items-end">
                <ProjectCard
                  project={single}
                  cover={serviceCovers[single.slug]}
                  index={0}
                  ratio="4/5"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="md:col-span-4"
                />
                <div className="md:col-span-7 md:col-start-6" data-reveal="fade-up" data-reveal-delay={0.1}>
                  <p
                    className={clsx(
                      "t-lead max-w-[36ch]",
                      dark ? "text-paper/75" : "text-ink-3",
                    )}
                  >
                    {single.summary}
                  </p>
                  <WorkLink dark={dark} className="mt-5" />
                </div>
              </div>
            ) : (
              <div className="grid gap-x-14 gap-y-14 md:grid-cols-12">
                {relatedProjects.map((project, i) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    cover={serviceCovers[project.slug]}
                    index={i}
                    ratio="4/5"
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="md:col-span-4"
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
