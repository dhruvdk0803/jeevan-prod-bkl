"use server";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { type ActionState, zodFieldErrors } from "@/lib/cms/action-state";
import { CMS_TAGS, invalidate } from "@/lib/cms/tags";
import { SLUG_PATTERN, slugify } from "@/lib/cms/slug";

const tagSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required.").max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required.")
    .max(96)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only."),
});

export async function saveTag(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const raw = {
    id: (formData.get("id") as string) || undefined,
    name: (formData.get("name") as string) ?? "",
    slug: ((formData.get("slug") as string) || slugify((formData.get("name") as string) ?? "")).trim(),
  };
  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const { id, name, slug } = parsed.data;

  const db = await getDb();
  const dupe = await db
    .select({ id: schema.tags.id })
    .from(schema.tags)
    .where(id ? and(eq(schema.tags.slug, slug), ne(schema.tags.id, id)) : eq(schema.tags.slug, slug))
    .limit(1);
  if (dupe.length > 0) {
    return { ok: false, message: "That slug is already in use.", fieldErrors: { slug: "Already in use." } };
  }

  if (id) {
    const [row] = await db.update(schema.tags).set({ name, slug }).where(eq(schema.tags.id, id)).returning();
    if (!row) return { ok: false, message: "Tag not found." };
  } else {
    await db.insert(schema.tags).values({ name, slug });
  }

  invalidate(CMS_TAGS.tags, CMS_TAGS.posts);
  redirect("/admin/tags");
}

export async function deleteTag(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Missing tag." };

  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(schema.postTags).where(eq(schema.postTags.tagId, id));
  await db.delete(schema.tags).where(eq(schema.tags.id, id));
  invalidate(CMS_TAGS.tags, CMS_TAGS.posts);
  revalidatePath("/admin/tags");

  return { ok: true, message: n > 0 ? `Tag deleted and removed from ${n} post${n === 1 ? "" : "s"}.` : "Tag deleted." };
}
