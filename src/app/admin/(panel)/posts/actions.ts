"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { sanitizePostHtml, readingMinutes } from "@/lib/cms/html";
import { slugify, SLUG_PATTERN } from "@/lib/cms/slug";
import { invalidate, invalidatePost, CMS_TAGS } from "@/lib/cms/tags";
import { zodFieldErrors, type ActionState } from "@/lib/cms/action-state";

/**
 * Server Actions for `/admin/posts` — list "new post", and the editor's save
 * / publish / unpublish / delete flows. Every export calls `requireUser()`
 * first; the editor treats the post `id` as an untrusted reference and reads
 * the row itself rather than trusting any client-sent content for identity.
 */

/** `POST /admin/posts` (list page "New post" button) — creates an empty draft and redirects into it. */
export async function createDraftPost() {
  const user = await requireUser();
  const db = await getDb();
  const slug = `untitled-${randomBytes(4).toString("hex")}`;
  const [row] = await db
    .insert(schema.posts)
    .values({ title: "Untitled post", slug, status: "draft", authorId: user.id })
    .returning({ id: schema.posts.id });
  invalidatePost(slug);
  redirect(`/admin/posts/${row.id}`);
}

const isoDateString = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date.");

const absoluteHttpUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be an absolute http(s) URL.");

const savePostSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title.").max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Enter a slug.")
      .max(96)
      .refine((v) => SLUG_PATTERN.test(v), "Use lower-case letters, numbers and hyphens only."),
    excerpt: z.string().trim().max(400),
    contentHtml: z.string(),
    contentJson: z.string(),
    coverImageUrl: z.string().trim(),
    coverImageAlt: z.string().trim(),
    coverImageWidth: z.string().trim(),
    coverImageHeight: z.string().trim(),
    categoryId: z.string().trim(),
    tagNames: z.array(z.string().trim().min(1).max(60)).max(30),
    status: z.enum(["draft", "published"]),
    publishedAt: isoDateString,
    metaTitle: z.string().trim().max(200),
    metaDescription: z.string().trim().max(400),
    focusKeyword: z.string().trim().max(120),
    canonicalUrl: absoluteHttpUrl,
    ogImageUrl: z.string().trim(),
    noindex: z.enum(["on", ""]),
  })
  .refine((data) => !data.coverImageUrl || data.coverImageAlt.length > 0, {
    message: "Alt text is required when a cover image is set.",
    path: ["coverImageAlt"],
  });

/**
 * Reads a text field, mapping "absent" (null — e.g. an unchecked checkbox or a
 * control that isn't rendered) to "" so the schema sees one consistent shape.
 */
function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function readTagNames(formData: FormData): string[] {
  return formData
    .getAll("tagNames")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

/** Upserts tags by slug and returns their ids, preserving input order (deduped). */
async function upsertTags(db: Awaited<ReturnType<typeof getDb>>, names: string[]): Promise<string[]> {
  const bySlug = new Map<string, string>();
  for (const name of names) {
    const slug = slugify(name);
    if (slug) bySlug.set(slug, name);
  }
  const ids: string[] = [];
  for (const [slug, name] of bySlug) {
    const [existing] = await db.select({ id: schema.tags.id }).from(schema.tags).where(eq(schema.tags.slug, slug));
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const [created] = await db.insert(schema.tags).values({ name, slug }).onConflictDoNothing().returning({ id: schema.tags.id });
    if (created) {
      ids.push(created.id);
    } else {
      // Lost a race with another save — the row exists now, read it back.
      const [row] = await db.select({ id: schema.tags.id }).from(schema.tags).where(eq(schema.tags.slug, slug));
      if (row) ids.push(row.id);
    }
  }
  return ids;
}

/** `savePost(id, prevState, formData)` — bind `id` on the client with `.bind(null, id)`. */
export async function savePost(id: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const db = await getDb();

  const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  if (!existing) return { ok: false, message: "Post not found." };

  const parsed = savePostSchema.safeParse({
    title: field(formData, "title"),
    slug: field(formData, "slug"),
    excerpt: field(formData, "excerpt"),
    contentHtml: field(formData, "contentHtml"),
    contentJson: field(formData, "contentJson"),
    coverImageUrl: field(formData, "coverImageUrl"),
    coverImageAlt: field(formData, "coverImageAlt"),
    coverImageWidth: field(formData, "coverImageWidth"),
    coverImageHeight: field(formData, "coverImageHeight"),
    categoryId: field(formData, "categoryId"),
    tagNames: readTagNames(formData),
    status: field(formData, "status"),
    publishedAt: field(formData, "publishedAt"),
    metaTitle: field(formData, "metaTitle"),
    metaDescription: field(formData, "metaDescription"),
    focusKeyword: field(formData, "focusKeyword"),
    canonicalUrl: field(formData, "canonicalUrl"),
    ogImageUrl: field(formData, "ogImageUrl"),
    noindex: field(formData, "noindex"),
  });
  if (!parsed.success) {
    const fieldErrors = zodFieldErrors(parsed.error.issues);
    // Only some fields render inline errors, so spell every problem out here too.
    return {
      ok: false,
      message: `Please fix: ${Object.values(fieldErrors).join(" ")}`,
      fieldErrors,
    };
  }
  const data = parsed.data;

  const [slugClash] = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(and(eq(schema.posts.slug, data.slug), ne(schema.posts.id, id)));
  if (slugClash) {
    return { ok: false, message: "That slug is already in use.", fieldErrors: { slug: "Already in use by another post." } };
  }

  const html = sanitizePostHtml(data.contentHtml);
  let contentJson: unknown = null;
  try {
    contentJson = data.contentJson ? JSON.parse(data.contentJson) : null;
  } catch {
    contentJson = null;
  }

  const wasPublished = existing.status === "published";
  const willBePublished = data.status === "published";
  const publishedAt = willBePublished
    ? data.publishedAt
      ? new Date(data.publishedAt)
      : (existing.publishedAt ?? new Date())
    : existing.publishedAt; // unpublishing keeps the historical date around

  const tagIds = await upsertTags(db, data.tagNames);

  await db.transaction(async (tx) => {
    await tx
      .update(schema.posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: html,
        contentJson,
        coverImageUrl: data.coverImageUrl || null,
        coverImageAlt: data.coverImageUrl ? data.coverImageAlt || null : null,
        coverImageWidth: data.coverImageWidth ? Number(data.coverImageWidth) || null : null,
        coverImageHeight: data.coverImageHeight ? Number(data.coverImageHeight) || null : null,
        categoryId: data.categoryId || null,
        status: data.status,
        publishedAt,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        focusKeyword: data.focusKeyword || null,
        canonicalUrl: data.canonicalUrl || null,
        ogImageUrl: data.ogImageUrl || null,
        noindex: data.noindex === "on",
        readingMinutes: readingMinutes(html),
        updatedAt: new Date(),
      })
      .where(eq(schema.posts.id, id));

    await tx.delete(schema.postTags).where(eq(schema.postTags.postId, id));
    if (tagIds.length) {
      await tx.insert(schema.postTags).values(tagIds.map((tagId) => ({ postId: id, tagId })));
    }

    // A published post's slug changing needs a permanent redirect from the old
    // URL, or the change quietly breaks every inbound link and search result.
    if (wasPublished && existing.slug !== data.slug) {
      await tx
        .insert(schema.redirects)
        .values({ source: `/blog/${existing.slug}`, destination: `/blog/${data.slug}`, permanent: true })
        .onConflictDoUpdate({
          target: schema.redirects.source,
          set: { destination: `/blog/${data.slug}`, permanent: true, updatedAt: new Date() },
        });
    }
  });

  invalidatePost(existing.slug, data.slug);
  if (wasPublished && existing.slug !== data.slug) invalidate(CMS_TAGS.redirects);

  return {
    ok: true,
    message:
      data.status === "published"
        ? existing.status === "published"
          ? "Post updated."
          : "Post published."
        : "Draft saved.",
    data: {
      id,
      slug: data.slug,
      status: data.status,
      publishedAt: publishedAt ? publishedAt.toISOString() : null,
      updatedAt: new Date().toISOString(), savedBy: user.id },
  };
}

/** `deletePost(id)` — removes the post and returns to the list. */
export async function deletePost(id: string): Promise<void> {
  await requireUser();
  const db = await getDb();
  const [existing] = await db.select({ slug: schema.posts.slug }).from(schema.posts).where(eq(schema.posts.id, id));
  if (existing) {
    await db.delete(schema.posts).where(eq(schema.posts.id, id));
    invalidatePost(existing.slug);
  }
  redirect("/admin/posts");
}
