import { clsx } from "clsx";
import type { ElementType, ReactNode } from "react";

/**
 * Typographic primitives. All server components — the motion runtime picks
 * them up through `data-reveal` attributes, so nothing here ships JS.
 */

/**
 * AnimatedHeading — renders each line inside its own clipping mask so the
 * motion layer can slide lines up one after another.
 *
 * Lines are authored explicitly rather than measured at runtime: it keeps the
 * component server-rendered, avoids a layout-thrashing split-text pass, and
 * gives the art director control over where lines break.
 */
export function AnimatedHeading({
  lines,
  as: Tag = "h2",
  className,
  size = "statement",
  delay,
  id,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  size?: "hero" | "statement" | "h2" | "h3";
  delay?: number;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={clsx(`t-${size}`, className)}
      data-reveal="mask"
      data-reveal-delay={delay}
    >
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Small uppercase tracked label — the site's connective tissue. */
export function Label({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={clsx("t-label text-neutral", className)}>{children}</Tag>;
}

/** Numbered label: "01 — Stories" */
export function IndexLabel({
  index,
  children,
  className,
}: {
  index: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("t-label text-neutral flex items-baseline gap-3", className)}>
      <span className="tabular-nums">{index}</span>
      {children ? (
        <>
          <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
          <span>{children}</span>
        </>
      ) : null}
    </p>
  );
}

/**
 * SectionIntro — the standard editorial section opener: eyebrow label, a
 * masked heading, and optional supporting copy.
 */
export function SectionIntro({
  eyebrow,
  lines,
  children,
  align = "start",
  size = "h2",
  as = "h2",
  className,
  id,
}: {
  eyebrow?: string;
  lines: ReactNode[];
  children?: ReactNode;
  align?: "start" | "center";
  size?: "hero" | "statement" | "h2" | "h3";
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Label className="mb-6" >{eyebrow}</Label>
      ) : null}
      <AnimatedHeading lines={lines} as={as} size={size} id={id} />
      {children ? (
        <div
          className="t-lead text-ink-3 mt-7 max-w-[52ch]"
          data-reveal="fade-up"
          data-reveal-delay={0.15}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
