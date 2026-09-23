import { clsx } from "clsx";

type TocEntry = { id: string; text: string; level: 2 | 3 };

/**
 * Table of contents built from the post's real h2/h3s (see `withHeadingIds`).
 * Sticky in the right rail on desktop; a collapsible `<details>` on mobile so
 * it doesn't push the article body down on small screens.
 */
export function TableOfContents({ toc, className }: { toc: TocEntry[]; className?: string }) {
  if (toc.length < 2) return null;

  const list = (
    <ol className="space-y-3">
      {toc.map((entry) => (
        <li key={entry.id} className={clsx(entry.level === 3 && "pl-4")}>
          <a
            href={`#${entry.id}`}
            className="t-label text-ink-3 hover:text-ember block leading-snug normal-case tracking-normal transition-colors duration-300"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-label="Table of contents" className={className}>
      {/* Mobile: collapsible */}
      <details className="rule pt-6 lg:hidden">
        <summary className="t-label text-ink cursor-pointer list-none">
          Contents
        </summary>
        <div className="mt-5">{list}</div>
      </details>

      {/* Desktop: sticky rail */}
      <div className="sticky top-[calc(var(--nav-h)+2rem)] hidden lg:block">
        <p className="t-label text-neutral mb-5">Contents</p>
        {list}
      </div>
    </nav>
  );
}
