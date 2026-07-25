import Image from "next/image";
import { clsx } from "clsx";
import type { ReactNode } from "react";

type Ratio = "4/5" | "3/4" | "1/1" | "16/9" | "3/2" | "21/9" | "auto";

const ratioClass: Record<Ratio, string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "21/9": "aspect-[21/9]",
  auto: "",
};

/**
 * MediaReveal — the single image primitive for the whole site.
 *
 * Wraps next/image in a clipping frame that the motion layer wipes open while
 * the image settles from 1.06 → 1. Because the wipe lives on the wrapper and
 * the scale lives on the <img>, both animate on compositor-friendly
 * properties only (clip-path + transform) — no layout thrash.
 *
 * `sizes` is required-by-convention here: this site is image-heavy and a
 * missing `sizes` makes the browser fetch a 3840px file for a thumbnail.
 */
export function MediaReveal({
  src,
  alt,
  width,
  height,
  ratio = "4/5",
  sizes,
  className,
  imgClassName,
  priority = false,
  quality = 75,
  delay,
  parallax,
  overlay,
  children,
  animate = true,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  ratio?: Ratio;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Marks the LCP image. Exactly one per page. */
  priority?: boolean;
  quality?: 70 | 75 | 82;
  delay?: number;
  /** 0.05–0.2 is the tasteful range. */
  parallax?: number;
  /** Scrim strength for text laid over media. */
  overlay?: "none" | "soft" | "strong" | "bottom";
  children?: ReactNode;
  animate?: boolean;
}) {
  const useFill = ratio !== "auto";

  return (
    <figure
      className={clsx("relative overflow-hidden bg-paper-2", ratioClass[ratio], className)}
      data-reveal={animate ? "media" : undefined}
      data-reveal-delay={delay}
    >
      <div
        className={clsx("absolute inset-0", parallax && "scale-110")}
        data-parallax={parallax}
      >
        <Image
          src={src}
          alt={alt}
          {...(useFill
            ? { fill: true }
            : { width: width ?? 1080, height: height ?? 1350 })}
          sizes={sizes}
          quality={quality}
          // v16: `priority` is deprecated in favour of `preload`.
          preload={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={clsx("h-full w-full object-cover", imgClassName)}
        />
      </div>

      {overlay && overlay !== "none" ? (
        <div
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-0",
            overlay === "soft" && "bg-ink/25",
            overlay === "strong" && "bg-ink/55",
            overlay === "bottom" &&
              "bg-gradient-to-t from-ink/80 via-ink/25 to-transparent",
          )}
        />
      ) : null}

      {children}
    </figure>
  );
}

/**
 * Full-bleed cinematic band — used for the section breaks that give the page
 * its visual rhythm between typographic passages.
 */
export function CinematicBand({
  src,
  alt,
  sizes = "100vw",
  className,
  children,
  parallax = 0.1,
  overlay = "strong",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  children?: ReactNode;
  parallax?: number;
  overlay?: "none" | "soft" | "strong" | "bottom";
  priority?: boolean;
}) {
  return (
    <section
      className={clsx(
        "on-dark relative isolate flex min-h-[70svh] items-end overflow-hidden text-paper md:min-h-[85svh]",
        className,
      )}
      data-theme-dark
    >
      <div className="absolute inset-0 -z-10 scale-110" data-parallax={parallax}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={82}
          preload={priority}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      </div>
      {overlay !== "none" ? (
        <div
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 -z-10",
            overlay === "soft" && "bg-ink/30",
            overlay === "strong" && "bg-ink/60",
            overlay === "bottom" &&
              "bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10",
          )}
        />
      ) : null}
      {children}
    </section>
  );
}
