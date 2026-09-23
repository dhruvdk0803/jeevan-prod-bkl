import Link from "next/link";
import { clsx } from "clsx";

/**
 * Admin UI kit — the ONLY primitives admin screens should use, so every
 * screen looks like one product. Server-component safe (no hooks); client
 * components can import these too.
 *
 * Visual language: the site's warm paper + ink, sans UI type, Fraunces only
 * for page titles, ember strictly for focus/destructive/accents. Calm and
 * dense — this is a working tool, not a marketing page.
 */

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

/* ------------------------------------------------------------ layout */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link
            href={back.href}
            className="text-neutral hover:text-ink mb-2 inline-flex items-center gap-1.5 text-sm"
          >
            <span aria-hidden="true">←</span> {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-ink text-[1.75rem] leading-tight tracking-[-0.02em] md:text-[2rem]">
          {title}
        </h1>
        {description ? <p className="text-neutral mt-1.5 max-w-[65ch] text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={clsx("border-ink/10 rounded-xl border bg-white shadow-[0_1px_2px_rgba(19,19,25,0.04)]", className)}>
      {title || actions ? (
        <div className="border-ink/10 flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            {title ? <h2 className="text-ink text-[0.95rem] font-semibold">{title}</h2> : null}
            {description ? <p className="text-neutral mt-0.5 text-[0.8rem]">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={padded ? "p-5" : undefined}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------ actions */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const buttonClass = (variant: ButtonVariant = "secondary", size: ButtonSize = "md", extra?: string) =>
  clsx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "h-8 px-3 text-[0.8rem]" : "h-10 px-4 text-sm",
    variant === "primary" && "bg-ink text-paper hover:bg-ink-2",
    variant === "secondary" && "border-ink/15 text-ink hover:border-ink/30 hover:bg-paper border bg-white",
    variant === "ghost" && "text-ink-3 hover:bg-ink/5 hover:text-ink",
    variant === "danger" && "bg-ember text-white hover:bg-ember-deep",
    extra,
  );

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type="button" {...props} className={buttonClass(variant, size, className)} />;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------ forms */

const controlClass =
  "border-ink/15 text-ink placeholder:text-neutral-2 focus:border-ink/40 w-full rounded-lg border bg-white px-3 text-sm transition-colors aria-[invalid=true]:border-ember";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  counter,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  /** e.g. `{ value: 54, min: 50, max: 60 }` → coloured "54 / 60" readout. */
  counter?: { value: number; min?: number; max: number };
  children: React.ReactNode;
  className?: string;
}) {
  const counterTone = counter
    ? counter.value > counter.max || (counter.min !== undefined && counter.value > 0 && counter.value < counter.min)
      ? "text-ember"
      : counter.value === 0
        ? "text-neutral"
        : "text-emerald-700"
    : "";
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-ink text-[0.8rem] font-medium">
          {label}
        </label>
        {counter ? (
          <span className={clsx("text-[0.72rem] tabular-nums", counterTone)}>
            {counter.value} / {counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-ember text-[0.75rem]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-neutral text-[0.75rem]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(controlClass, "h-10", className)} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(controlClass, "min-h-24 py-2.5 leading-relaxed", className)} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(controlClass, "h-10 pr-8", className)} />;
}

export function Checkbox({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input type="checkbox" {...props} className="accent-ink mt-0.5 h-4 w-4 shrink-0" />
      <span>
        <span className="text-ink block text-sm">{label}</span>
        {hint ? <span className="text-neutral block text-[0.75rem]">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------ feedback */

const toneClass: Record<Tone, string> = {
  neutral: "bg-ink/5 text-ink-3",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-ember/10 text-ember-deep",
  info: "bg-sky-50 text-sky-800",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[0.72rem] font-medium", toneClass[tone])}>
      {children}
    </span>
  );
}

export function Alert({ tone = "info", title, children }: { tone?: Tone; title?: string; children?: React.ReactNode }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={clsx("rounded-lg px-4 py-3 text-sm", toneClass[tone])}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-0.5" : undefined}>{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-ink/15 flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
      <p className="font-display text-ink text-xl">{title}</p>
      {description ? <p className="text-neutral mt-2 max-w-[48ch] text-sm">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ tables */

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-ink/10 overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={clsx("border-ink/10 text-neutral border-b px-4 py-2.5 text-[0.72rem] font-medium tracking-wide uppercase", className)}>
      {children}
    </th>
  );
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={clsx("border-ink/5 border-b px-4 py-3 align-middle", className)}>{children}</td>;
}

/**
 * Admin dates render on the server (UTC on Vercel), so pin them to the team's
 * timezone — Jeevan Productions is in San Diego — and label datetimes with it.
 */
const ADMIN_TZ = "America/Los_Angeles";

export const formatDate = (d: Date | string | null | undefined) =>
  d
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: ADMIN_TZ }).format(new Date(d))
    : "—";

export const formatDateTime = (d: Date | string | null | undefined) =>
  d
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: ADMIN_TZ,
        timeZoneName: "short",
      }).format(new Date(d))
    : "—";
