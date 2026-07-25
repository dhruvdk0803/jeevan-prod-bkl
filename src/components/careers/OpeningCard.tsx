import { ArrowLink } from "@/components/primitives/Actions";
import type { JobOpening } from "@/content/types";

/**
 * Renders one published opening. `openings` is empty today (see
 * `src/content/careers.ts`) — this component exists so the guarded grid in
 * `src/app/careers/page.tsx` can render published roles the moment JP adds
 * them, without any further page changes. Links down to the general
 * application form (`#apply`) rather than a per-role route, since no
 * role-detail pages exist in this build.
 */
export function OpeningCard({ opening }: { opening: JobOpening }) {
  return (
    <article className="rule flex flex-col justify-between gap-6 border-t-0 py-8 sm:flex-row sm:items-center sm:gap-10">
      <div>
        <p className="t-label mb-3 text-neutral">
          {opening.discipline} · {opening.type} · {opening.location}
        </p>
        <h3 className="t-h3">{opening.title}</h3>
        <p className="t-body mt-3 max-w-[60ch] text-ink-3">{opening.summary}</p>
      </div>
      <ArrowLink href="#apply" className="shrink-0">
        Apply for this role
      </ArrowLink>
    </article>
  );
}
