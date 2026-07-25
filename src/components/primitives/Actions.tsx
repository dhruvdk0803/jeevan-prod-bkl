import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/**
 * Buttons and links.
 *
 * Every interaction here is CSS-driven (group-hover / transitions) rather than
 * JS-driven, so these stay server components and cost nothing at runtime.
 */

const base =
  "inline-flex items-center justify-center gap-3 rounded-full t-label transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] px-7 py-4 min-h-11";

export function Button({
  href,
  children,
  variant = "solid",
  className,
  external,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "light" | "ghost";
  className?: string;
  external?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = clsx(
    base,
    variant === "solid" && "bg-ink text-paper hover:bg-ember",
    variant === "outline" &&
      "border border-ink/50 text-ink hover:border-ink hover:bg-ink hover:text-paper",
    variant === "light" && "bg-paper text-ink hover:bg-ember hover:text-paper",
    variant === "ghost" &&
      "border border-paper/35 text-paper hover:border-paper hover:bg-paper hover:text-ink",
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
        <Arrow className="-rotate-45" />
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      <Arrow />
    </Link>
  );
}

/** Editorial text link — the arrow slides on hover. */
export function ArrowLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100"
        />
      </span>
      <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
    </>
  );

  const cls = clsx(
    "group t-label inline-flex items-center gap-2.5 py-2 text-ink hover:text-ember transition-colors duration-300",
    className,
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={clsx("h-3 w-3 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M1 8h13M9 3l5 5-5 5" strokeLinecap="square" />
    </svg>
  );
}

/**
 * The recurring closing CTA. Appears at the foot of every content page so the
 * narrative always lands on "work with us".
 */
export function CTASection({
  eyebrow = "Start a project",
  lines,
  body,
  href = "/contact",
  label = "Let's work together",
  className,
}: {
  eyebrow?: string;
  lines: string[];
  body?: string;
  href?: string;
  label?: string;
  className?: string;
}) {
  return (
    <section
      className={clsx("on-dark bg-ink text-paper", className)}
      data-theme-dark
      aria-labelledby="cta-heading"
    >
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
        <p className="t-label text-ember-light mb-8">{eyebrow}</p>
        <h2 className="t-statement max-w-[18ch]" data-reveal="mask" id="cta-heading">
          {lines.map((l, i) => (
            <span className="line-mask" key={i}>
              <span>{l}</span>
            </span>
          ))}
        </h2>
        {body ? (
          <p className="t-lead mt-8 max-w-[46ch] text-paper/65" data-reveal="fade-up">
            {body}
          </p>
        ) : null}
        <div className="mt-12" data-reveal="fade-up" data-reveal-delay={0.1}>
          <Button href={href} variant="light">
            {label}
          </Button>
        </div>
      </div>
    </section>
  );
}
