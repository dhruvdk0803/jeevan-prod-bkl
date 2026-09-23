import Link from "next/link";
import { clsx } from "clsx";
import { MediaReveal } from "@/components/primitives/Media";
import type { PostCard as PostCardData } from "@/lib/cms/types";
import { formatPostDate } from "./format";

/**
 * PostCard — the editorial grid tile used on /blog, category, tag and
 * related-post lists. Posts aren't guaranteed a cover image (the editor
 * marks it optional), so there's a designed no-cover variant rather than a
 * broken `<img>` or a stretched placeholder.
 */
export function PostCard({
  post,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 31vw",
  className,
}: {
  post: PostCardData;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className={clsx("group block", className)}>
      {post.coverImageUrl ? (
        <div className="relative overflow-hidden" data-cursor="View">
          <MediaReveal
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            width={post.coverImageWidth ?? undefined}
            height={post.coverImageHeight ?? undefined}
            ratio="16/9"
            sizes={sizes}
            priority={priority}
            quality={82}
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="bg-paper-2 border-ink/10 relative flex aspect-[16/9] items-center justify-center overflow-hidden border"
        >
          <span className="t-label text-neutral-2">{post.category?.name ?? "Journal"}</span>
        </div>
      )}

      <div className="mt-6">
        <p className="t-label text-neutral flex flex-wrap items-center gap-x-3 gap-y-1">
          {post.category ? <span className="text-ember">{post.category.name}</span> : null}
          {post.category ? <Dot /> : null}
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <Dot />
          <span>{post.readingMinutes} min read</span>
        </p>
        <h3 className="t-h3 font-display mt-3">
          <span className="transition-colors duration-300 group-hover:text-ember">
            {post.title}
          </span>
        </h3>
        {post.excerpt ? (
          <p className="t-body text-ink-3 mt-3 max-w-[52ch] line-clamp-3">{post.excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}

function Dot() {
  return <span aria-hidden="true" className="bg-neutral-2 inline-block h-1 w-1 rounded-full" />;
}
