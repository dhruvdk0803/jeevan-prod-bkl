import { clsx } from "clsx";
import type { Service, WorldMeta } from "@/content/types";
import { services as allServices } from "@/content/services";
import { projectsByWorld } from "@/content/projects";
import { AnimatedHeading, IndexLabel, Label } from "@/components/primitives/Type";
import { ProjectCard } from "@/components/primitives/ProjectCard";

/**
 * One full-bleed "room" per world. Each world gets its own theme so moving
 * between them reads as moving between rooms in a building, not scrolling a
 * repeating template:
 *  - Stories   → paper, serif-forward, generous whitespace (print/editorial)
 *  - Brands    → sand, tighter grid, ember-forward chips (studio wall)
 *  - Experiences → dark ink, on-dark, high contrast (the room at night)
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
  dark: "border border-paper/25 text-paper/75",
};

export function WorldSection({ world, theme }: { world: WorldMeta; theme: Theme }) {
  const worldServices: Service[] = allServices.filter((s) => s.world === world.id);
  const relatedProjects = projectsByWorld(world.id).slice(0, 3);

  return (
    <section
      id={world.id}
      aria-labelledby={`${world.id}-heading`}
      data-theme-dark={theme === "dark" ? true : undefined}
      className={clsx(
        "scroll-mt-[var(--nav-h)] py-[clamp(5rem,12vw,10rem)]",
        themeClasses[theme],
      )}
    >
      <div className="gutter mx-auto max-w-[110rem]">
        <div className="grid gap-x-14 gap-y-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <IndexLabel index={world.index} className={theme === "dark" ? "text-paper/50" : undefined}>
              {world.discipline}
            </IndexLabel>
            <AnimatedHeading
              as="h2"
              size="statement"
              id={`${world.id}-heading`}
              className="mt-6"
              lines={[world.title]}
            />
            <p
              className={clsx(
                "t-lead mt-7 max-w-[36ch]",
                theme === "dark" ? "text-paper/70" : "text-ink-3",
              )}
              data-reveal="fade-up"
              data-reveal-delay={0.1}
            >
              {world.idea}
            </p>
            <p
              className={clsx(
                "t-body mt-5 max-w-[42ch]",
                theme === "dark" ? "text-paper/55" : "text-neutral",
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
                    className={clsx(i > 0 && (theme === "dark" ? "border-t border-paper/15 pt-12" : "rule pt-12"))}
                    data-reveal="fade-up"
                    data-reveal-delay={i * 0.08}
                  >
                    <h3 className="t-h3 font-display">{service.name}</h3>
                    <p
                      className={clsx(
                        "t-body mt-4 max-w-[52ch]",
                        theme === "dark" ? "text-paper/70" : "text-ink-3",
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
                  theme === "dark" ? "text-paper/60" : "text-neutral",
                )}
              >
                Full details for this world are being finalized — reach out
                and we&rsquo;ll walk you through what&rsquo;s possible.
              </p>
            )}
          </div>
        </div>

        {relatedProjects.length > 0 ? (
          <div className="mt-20">
            <Label className={clsx("mb-8", theme === "dark" ? "text-paper/50" : undefined)}>
              From the work
            </Label>
            <div className="grid gap-x-10 gap-y-14 md:grid-cols-3">
              {relatedProjects.map((project, i) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  index={i}
                  ratio="4/5"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
