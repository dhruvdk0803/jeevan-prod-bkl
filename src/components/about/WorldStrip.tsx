import Link from "next/link";
import { worlds } from "@/content/site";
import { IndexLabel } from "@/components/primitives/Type";
import { MediaReveal } from "@/components/primitives/Media";
import { Arrow } from "@/components/primitives/Actions";

/**
 * WorldStrip — a compact summary of the three worlds (Stories / Brands /
 * Experiences) that the whole site is organised around.
 *
 * Written as a local equivalent of `src/components/work/WorldStrip.tsx`
 * (owned by another workstream) per the About-page build brief: if that
 * shared component doesn't exist yet, About gets its own copy here rather
 * than writing into the other agent's path. Keep this in sync with that
 * component's intent — a quiet, editorial index of the three worlds, each
 * linking through to its anchor on `/services` — if the two ever converge.
 */
export function WorldStrip() {
  return (
    <div className="flex flex-col">
      {worlds.map((world, i) => (
        <Link
          key={world.id}
          href={world.href}
          className="group rule grid grid-cols-1 items-center gap-x-8 gap-y-6 py-10 last:border-b md:grid-cols-12"
          data-reveal="fade-up"
          data-reveal-delay={i * 0.08}
        >
          <div className="md:col-span-1">
            <IndexLabel index={world.index} />
          </div>

          <div className="md:col-span-4">
            <h3 className="t-h2 font-display transition-colors duration-300 group-hover:text-ember">
              {world.title}
            </h3>
            <p className="t-label text-neutral mt-2">{world.discipline}</p>
          </div>

          <p className="t-body text-ink-3 md:col-span-4">{world.blurb}</p>

          <div className="flex items-center justify-between gap-6 md:col-span-3 md:justify-end">
            <div className="relative hidden h-20 w-16 shrink-0 overflow-hidden sm:block">
              <MediaReveal
                src={world.image}
                alt={world.imageAlt}
                ratio="4/5"
                sizes="120px"
                animate={false}
                imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
            {/* Visual affordance only — the whole row is already the link, and a
                nested <a> is invalid HTML (it broke hydration). */}
            <span
              aria-hidden="true"
              className="t-label text-ink group-hover:text-ember inline-flex shrink-0 items-center gap-2.5 py-2 transition-colors duration-300"
            >
              Explore
              <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
