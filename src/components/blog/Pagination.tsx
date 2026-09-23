import Link from "next/link";
import { clsx } from "clsx";
import { Arrow } from "@/components/primitives/Actions";

/**
 * Accessible pagination nav for /blog and /blog/page/[page]. Page 1 always
 * links to the bare /blog URL (the [page] route itself redirects /page/1 →
 * /blog), so this never produces a self-referential /page/1 link.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  /** e.g. "/blog", "/blog/category/news" — pagination appends "/page/N". */
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => (p <= 1 ? basePath : `${basePath}/page/${p}`);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  // Keep the strip short: first, last, current neighbourhood.
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav aria-label="Blog pagination" className="mt-[clamp(3rem,6vw,5rem)] flex items-center justify-between gap-6">
      <PageLink href={prev ? hrefFor(prev) : undefined} label="Previous" disabled={!prev}>
        <Arrow className="rotate-180" />
        Previous
      </PageLink>

      <ul className="hidden items-center gap-2 sm:flex">
        {sorted.map((p, i) => (
          <li key={p} className="flex items-center gap-2">
            {i > 0 && sorted[i - 1] !== p - 1 ? <span className="text-neutral-2 px-1">…</span> : null}
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={clsx(
                "t-label flex h-10 w-10 min-h-11 items-center justify-center rounded-full tabular-nums transition-colors duration-300",
                p === page
                  ? "bg-ink text-paper"
                  : "text-ink-3 hover:bg-paper-2 hover:text-ink",
              )}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>

      <p className="t-label text-neutral sm:hidden">
        Page {page} of {totalPages}
      </p>

      <PageLink href={next ? hrefFor(next) : undefined} label="Next" disabled={!next}>
        Next
        <Arrow />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  label,
  disabled,
  children,
}: {
  href?: string;
  label: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "t-label inline-flex min-h-11 items-center gap-2 px-2 py-2 transition-colors duration-300";
  if (disabled || !href) {
    return (
      <span className={clsx(cls, "text-neutral-2 cursor-not-allowed")} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={clsx(cls, "text-ink hover:text-ember")} aria-label={label}>
      {children}
    </Link>
  );
}
