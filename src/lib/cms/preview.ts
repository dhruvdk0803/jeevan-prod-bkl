import "server-only";
import { draftMode } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import type { PostFull } from "./types";

/**
 * Draft preview. `GET /api/admin/preview?id=<postId>` (owned by the post
 * editor) verifies the session, enables Draft Mode and redirects to
 * `/blog/<slug>`. The public post page then calls this: when Draft Mode is on
 * AND a signed-in CMS user is present, it returns the post regardless of
 * status/schedule, uncached. Otherwise null — so a stray draft cookie can
 * never expose unpublished content to the public.
 */
export async function getPreviewPost(slug: string): Promise<PostFull | null> {
  if (!(await draftMode()).isEnabled) return null;
  if (!(await getCurrentUser())) return null;
  const db = await getDb();
  const { posts, users, categories, tags, postTags } = schema;
  const [row] = await db
    .select({
      post: posts,
      categoryName: categories.name,
      categorySlug: categories.slug,
      author: { id: users.id, name: users.name, bio: users.bio, avatarUrl: users.avatarUrl },
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug)))
    .limit(1);
  if (!row) return null;
  const p = row.post;
  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, p.id));
  const now = new Date().toISOString();
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    coverImageAlt: p.coverImageAlt,
    coverImageWidth: p.coverImageWidth,
    coverImageHeight: p.coverImageHeight,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : now,
    updatedAt: p.updatedAt.toISOString(),
    readingMinutes: p.readingMinutes,
    category: row.categorySlug ? { name: row.categoryName!, slug: row.categorySlug } : null,
    content: p.content,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    focusKeyword: p.focusKeyword,
    canonicalUrl: p.canonicalUrl,
    ogImageUrl: p.ogImageUrl,
    noindex: true, // previews are never indexable
    categoryId: p.categoryId,
    author: row.author?.id ? row.author : null,
    tags: tagRows,
  };
}
