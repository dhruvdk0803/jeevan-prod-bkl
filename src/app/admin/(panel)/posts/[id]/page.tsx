import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { PostEditor } from "@/components/admin/editor/PostEditor";

export const metadata = { title: "Edit post" };

/**
 * `/admin/posts/[id]` — the post editor. Loads the post plus the taxonomy
 * the sidebar needs, then hands everything to the client editor component.
 */
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const db = await getDb();
  const [row] = await db
    .select({ post: schema.posts, authorName: schema.users.name })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
    .where(eq(schema.posts.id, id));
  if (!row) notFound();

  const [categories, tagRows, allTags] = await Promise.all([
    db
      .select({ id: schema.categories.id, name: schema.categories.name })
      .from(schema.categories)
      .orderBy(asc(schema.categories.name)),
    db
      .select({ id: schema.tags.id, name: schema.tags.name })
      .from(schema.postTags)
      .innerJoin(schema.tags, eq(schema.postTags.tagId, schema.tags.id))
      .where(eq(schema.postTags.postId, id)),
    db.select({ name: schema.tags.name }).from(schema.tags).orderBy(asc(schema.tags.name)),
  ]);

  const p = row.post;

  return (
    <PostEditor
      post={{
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt ?? "",
        content: p.content,
        contentJson: p.contentJson ?? null,
        coverImageUrl: p.coverImageUrl,
        coverImageAlt: p.coverImageAlt,
        coverImageWidth: p.coverImageWidth,
        coverImageHeight: p.coverImageHeight,
        status: p.status,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
        categoryId: p.categoryId,
        metaTitle: p.metaTitle ?? "",
        metaDescription: p.metaDescription ?? "",
        focusKeyword: p.focusKeyword ?? "",
        canonicalUrl: p.canonicalUrl ?? "",
        ogImageUrl: p.ogImageUrl,
        noindex: p.noindex,
        updatedAt: p.updatedAt.toISOString(),
        tags: tagRows,
        authorName: row.authorName,
      }}
      categories={categories}
      allTagNames={allTags.map((t) => t.name)}
    />
  );
}
