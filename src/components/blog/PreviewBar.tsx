import Link from "next/link";

/**
 * Slim bar shown at the top of a post when Draft Mode is on (`getPreviewPost`
 * returned a result). Links to the disable route, which clears the draft
 * cookie and redirects back to the same post.
 */
export function PreviewBar({ slug }: { slug: string }) {
  return (
    <div className="bg-ember text-paper sticky top-0 z-50" role="status">
      <div className="gutter mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-3 py-3">
        <p className="t-label">Preview mode — this post is not yet published</p>
        <Link
          href={`/api/admin/preview/disable?to=${encodeURIComponent(`/blog/${slug}`)}`}
          className="t-label min-h-11 inline-flex items-center underline underline-offset-2"
        >
          Exit preview
        </Link>
      </div>
    </div>
  );
}
