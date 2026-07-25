import Image from "next/image";
import { clsx } from "clsx";
import { partners, SHOW_PARTNERS } from "@/content/partners";

/**
 * BrandMarquee — the continuously scrolling strip of brands JP has worked with.
 *
 * The list is rendered twice inside one track that translates -50%, which
 * makes the loop seamless. The second copy is `aria-hidden` so screen readers
 * hear each brand once. The whole animation is disabled under
 * `prefers-reduced-motion` by the `.marquee-track` rule in globals.css.
 *
 * Renders nothing if the kill-switch is off or the list is empty, so pages can
 * drop it in unconditionally. See NEEDS-FROM-CLIENT.md — attribution rights
 * for these logos still need JP's confirmation.
 */
export function BrandMarquee({
  heading = "Brands we've worked with",
  variant = "light",
  className,
  speed = 42,
}: {
  heading?: string;
  variant?: "light" | "dark";
  className?: string;
  /** Seconds for one full loop. Slower reads as more premium. */
  speed?: number;
}) {
  if (!SHOW_PARTNERS || partners.length === 0) return null;

  const dark = variant === "dark";

  return (
    <section
      className={clsx(
        "py-[clamp(3rem,6vw,5rem)]",
        dark ? "on-dark bg-ink text-paper" : "bg-paper-2",
        className,
      )}
      aria-labelledby="brand-marquee-heading"
      {...(dark ? { "data-theme-dark": true } : {})}
    >
      <div className="gutter mx-auto max-w-[110rem]">
        <h2
          id="brand-marquee-heading"
          className={clsx("t-label mb-9", dark ? "text-paper/50" : "text-neutral")}
        >
          {heading}
        </h2>
      </div>

      {/* Edge fades keep the loop from visibly "starting" at the viewport edge. */}
      <div className="relative">
        <div
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-[8vw] bg-gradient-to-r to-transparent",
            dark ? "from-ink" : "from-paper-2",
          )}
        />
        <div
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-[8vw] bg-gradient-to-l to-transparent",
            dark ? "from-ink" : "from-paper-2",
          )}
        />

        <div className="hide-scrollbar overflow-hidden">
          <div
            className="marquee-track flex w-max items-center gap-[clamp(2.5rem,5vw,4.5rem)]"
            style={{ animationDuration: `${speed}s` }}
          >
            {[...partners, ...partners].map((partner, i) => {
              const isClone = i >= partners.length;
              return (
                <div
                  key={`${partner.name}-${i}`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full opacity-60 grayscale transition-[opacity,filter] duration-500 hover:opacity-100 hover:grayscale-0 md:h-16 md:w-16"
                  aria-hidden={isClone ? "true" : undefined}
                >
                  {partner.logo ? (
                    <Image
                      src={partner.logo.src}
                      alt={isClone ? "" : partner.logo.alt}
                      fill
                      sizes="64px"
                      quality={75}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="gutter mx-auto max-w-[110rem]">
        <p className={clsx("t-label mt-9", dark ? "text-paper/40" : "text-neutral")}>
          Logos shown as they appear in JP&rsquo;s own client archive.
        </p>
      </div>
    </section>
  );
}
