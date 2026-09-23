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

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required.")
    .max(96)
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only."),
  description: z.string().trim().max(500).optional(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(200).optional(),
});

/** Create or update a category, depending on whether `id` is present. */
export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const raw = {
    id: (formData.get("id") as string) || undefined,
    name: (formData.get("name") as string) ?? "",
    slug: ((formData.get("slug") as string) || slugify((formData.get("name") as string) ?? "")).trim(),
    description: (formData.get("description") as string) ?? "",
    metaTitle: (formData.get("metaTitle") as string) ?? "",
    metaDescription: (formData.get("metaDescription") as string) ?? "",
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const { id, name, slug, description, metaTitle, metaDescription } = parsed.data;

  const db = await getDb();
  const dupe = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(id ? and(eq(schema.categories.slug, slug), ne(schema.categories.id, id)) : eq(schema.categories.slug, slug))
    .limit(1);
  if (dupe.length > 0) {
    return { ok: false, message: "That slug is already in use.", fieldErrors: { slug: "Already in use." } };
  }

  const values = {
    name,
    slug,
    description: description || null,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
  };

  if (id) {
    const [row] = await db.update(schema.categories).set(values).where(eq(schema.categories.id, id)).returning();
    if (!row) return { ok: false, message: "Category not found." };
  } else {
    await db.insert(schema.categories).values(values);
  }

  invalidate(CMS_TAGS.categories, CMS_TAGS.posts);
  redirect("/admin/categories");
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Missing category." };

  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(schema.posts).where(eq(schema.posts.categoryId, id));
  await db.delete(schema.categories).where(eq(schema.categories.id, id));
  invalidate(CMS_TAGS.categories, CMS_TAGS.posts);
  revalidatePath("/admin/categories");

  return {
    ok: true,
    message: n > 0 ? `Category deleted. ${n} post${n === 1 ? "" : "s"} now have no category.` : "Category deleted.",
  };
}
