"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { worlds } from "@/content/site";
import { Arrow } from "@/components/primitives/Actions";

/**
 * ThreeWorlds — the homepage's signature interaction.
 *
 * Desktop: a typographic index. Pointing at (or focusing) a world cross-fades
 * the large plate, shifts the section tint, and brings that world's
 * capabilities forward. It reads as one instrument rather than three cards.
 *
 * Mobile: the same content as a stacked editorial sequence. No hover
 * dependency — every world's image, idea and capabilities are always visible,
 * because on touch there is no "hover to reveal".
 */

const tint: Record<string, string> = {
  stories: "bg-paper",
  brands: "bg-sand",
  experiences: "bg-paper-2",
};

export function ThreeWorlds() {
  const [active, setActive] = useState(0);
  const current = worlds[active];

  return (
    <section
      aria-labelledby="worlds-heading"
      className={clsx(
        "transition-colors duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        tint[current.id],
      )}
    >
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
        <div className="mb-[clamp(3rem,6vw,5rem)] max-w-[46rem]">
          <p className="t-label text-neutral mb-6">What we do</p>
          <h2 id="worlds-heading" className="t-statement" data-reveal="mask">
            <span className="line-mask">
              <span>Stories become media.</span>
            </span>
            <span className="line-mask">
              <span>Ideas become brands.</span>
            </span>
            <span className="line-mask">
              <span>People become communities.</span>
            </span>
          </h2>
        </div>

        {/* ---------- Desktop: linked index + cross-fading plate ---------- */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-[clamp(2rem,5vw,6rem)]">
          <ul className="lg:col-span-7">
            {worlds.map((world, i) => {
              const isActive = i === active;
              return (
                <li key={world.id} className="rule">
                  <Link
                    href={world.href}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group block py-[clamp(1.5rem,3vw,2.75rem)]"
                  >
                    <div className="flex items-baseline gap-6">
                      <span
                        className={clsx(
                          "t-label shrink-0 tabular-nums transition-colors duration-500",
                          isActive ? "text-ember" : "text-ink-3",
                        )}
                      >
                        {world.index}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-5">
                          <h3
                            className={clsx(
                              "t-h2 font-display transition-[transform,color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                              isActive
                                ? "translate-x-2 text-ink"
                                : "text-ink/50 group-hover:text-ink",
                            )}
                          >
                            {world.title}
                          </h3>
                          <span className="t-label text-neutral">{world.discipline}</span>
                        </div>

                        {/* Supporting copy expands for the active world only. */}
                        <div
                          className={clsx(
                            "grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            isActive
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="overflow-hidden">
                            <p className="t-body text-ink-3 mt-4 max-w-[46ch]">{world.blurb}</p>
                            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                              {world.capabilities.map((c) => (
                                <li key={c} className="t-label text-neutral">
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Arrow
                        className={clsx(
                          "mt-2 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isActive
                            ? "translate-x-0 text-ember opacity-100"
                            : "-translate-x-3 opacity-0",
                        )}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Plate. Decorative in this context — the index above carries the
              meaning — so images are aria-hidden and the stack isn't announced. */}
          <div
            className="relative aspect-[4/5] overflow-hidden lg:col-span-5 lg:sticky lg:top-[calc(var(--nav-h)+2rem)]"
            aria-hidden="true"
          >
            {worlds.map((world, i) => (
              <Image
                key={world.id}
                src={world.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 0px, 38vw"
                quality={82}
                className={clsx(
                  "h-full w-full object-cover transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  i === active ? "scale-100 opacity-100" : "scale-105 opacity-0",
                )}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-7">
              <p className="t-h3 font-display text-paper">{current.idea}</p>
            </div>
          </div>
        </div>

        {/* ---------- Mobile / tablet: everything visible, no hover ---------- */}
        <div className="flex flex-col gap-14 lg:hidden">
          {worlds.map((world) => (
            <article key={world.id} className="rule pt-8">
              <div className="flex items-baseline gap-4">
                <span className="t-label text-ember tabular-nums">{world.index}</span>
                <h3 className="t-h2 font-display">{world.title}</h3>
                <span className="t-label text-neutral">{world.discipline}</span>
              </div>

              <figure
                className="relative mt-6 aspect-[4/5] overflow-hidden"
                data-reveal="media"
              >
                <Image
                  src={world.image}
                  alt={world.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 0px"
                  quality={75}
                  className="h-full w-full object-cover"
                />
              </figure>

              <p className="t-h3 font-display mt-6">{world.idea}</p>
              <p className="t-body text-ink-3 mt-3">{world.blurb}</p>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {world.capabilities.map((c) => (
                  <li key={c} className="t-label text-neutral">
                    {c}
                  </li>
                ))}
              </ul>

              <Link
                href={world.href}
                className="t-label text-ember mt-6 inline-flex min-h-11 items-center gap-2"
              >
                Explore {world.title}
                <Arrow />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
