import "server-only";
import { revalidateTag } from "next/cache";

/**
 * Cache tags for every public CMS read (see lib/cms/public.ts).
 *
 * After ANY write, call `invalidate(...)` with the affected tags. It expires
 * the entries immediately (`expire: 0`), so the next public request re-reads
 * the database — works from both Server Actions and Route Handlers.
 */
export const CMS_TAGS = {
  posts: "cms:posts",
  post: (slug: string) => `cms:post:${slug}`,
  categories: "cms:categories",
  tags: "cms:tags",
  settings: "cms:settings",
  pageSeo: "cms:page-seo",
  redirects: "cms:redirects",
  authors: "cms:authors",
} as const;

export function invalidate(...tags: string[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
}

/** Everything a post write can affect: lists, the post itself, taxonomy counts. */
export function invalidatePost(...slugs: (string | null | undefined)[]) {
  invalidate(
    CMS_TAGS.posts,
    CMS_TAGS.categories,
    CMS_TAGS.tags,
    ...slugs.filter((s): s is string => Boolean(s)).map(CMS_TAGS.post),
  );
}
