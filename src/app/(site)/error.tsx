"use client";

import { useEffect } from "react";
import Link from "next/link";
import { site } from "@/content/site";

/**
 * Root error boundary. Per NEXT16-NOTES.md section 8, v16.2 introduces
 * `unstable_retry()` as the preferred reset prop over `reset()` — it
 * re-fetches/re-renders the boundary's children rather than just clearing
 * error state, so we use it here. No stack trace or error message is ever
 * shown to the visitor.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section aria-labelledby="error-heading" className="bg-paper text-ink">
      <div className="gutter mx-auto flex min-h-[calc(100svh-var(--nav-h))] max-w-[110rem] flex-col justify-center py-[clamp(5rem,12vw,8rem)]">
        <p className="t-label text-neutral mb-8">Something went wrong</p>
        <h1 id="error-heading" className="t-hero">
          The reel slipped.
        </h1>
        <p className="t-lead text-ink-3 mt-8 max-w-[46ch]">
          Something broke loading this page. It&rsquo;s on us, not you — try again,
          or head back to the homepage. If it keeps happening, reach us at{" "}
          <a href={`mailto:${site.email}`} className="text-ember underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 t-label text-paper transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ember"
          >
            Try again
          </button>
          <Link href="/" className="t-label inline-flex items-center gap-2.5 py-2 text-ink hover:text-ember">
            Back to the homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
