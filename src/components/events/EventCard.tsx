import { clsx } from "clsx";
import { MediaReveal } from "@/components/primitives/Media";
import { Label } from "@/components/primitives/Type";
import type { JPEvent } from "@/content/types";

/**
 * EventCard — one gathering. Every date-ish field is optional by schema, so
 * everything here is individually guarded: a card with only a name and a
 * description must still look intentional, not sparse.
 */
export function EventCard({
  event,
  priority = false,
  className,
}: {
  event: JPEvent;
  priority?: boolean;
  className?: string;
}) {
  const meta = [event.venue, event.city].filter(Boolean).join(", ");

  return (
    <article className={clsx("group", className)}>
      {event.image ? (
        <MediaReveal
          src={event.image.src}
          alt={event.image.alt}
          ratio="4/5"
          sizes="(max-width: 768px) 100vw, 40vw"
          priority={priority}
          quality={82}
          className="mb-8"
        />
      ) : null}
      <div>
        {meta ? <Label className="text-ember mb-3">{meta}</Label> : null}
        <h3 className="t-h3 font-display">{event.name}</h3>
        {event.date || event.timeLabel ? (
          <p className="t-label text-neutral mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {event.date ? <span>{event.date}</span> : null}
            {event.timeLabel ? <span>{event.timeLabel}</span> : null}
          </p>
        ) : null}
        <p className="t-body text-ink-3 mt-5 max-w-[52ch]">{event.description}</p>
      </div>
    </article>
  );
}
