"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { type ActionState, zodFieldErrors } from "@/lib/cms/action-state";
import { CMS_TAGS, invalidate } from "@/lib/cms/tags";
import { getStaticRoute } from "@/lib/cms/static-routes";
import { routeKey } from "./route-key";

const seoSchema = z.object({
  path: z.string().min(1),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(200).optional(),
  ogImageUrl: z.string().trim().max(2000).optional(),
  noindex: z.boolean().optional(),
});

/** Upserts a page's SEO override. Clearing every field deletes the row (falls back to page defaults). */
export async function savePageSeo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const path = formData.get("path") as string;
  if (!getStaticRoute(path)) return { ok: false, message: "Unknown route." };

  const parsed = seoSchema.safeParse({
    path,
    metaTitle: (formData.get("metaTitle") as string) ?? "",
    metaDescription: (formData.get("metaDescription") as string) ?? "",
    ogImageUrl: (formData.get("ogImageUrl") as string) ?? "",
    noindex: formData.get("noindex") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const { metaTitle, metaDescription, ogImageUrl, noindex } = parsed.data;
  const isEmpty = !metaTitle && !metaDescription && !ogImageUrl && !noindex;

  const db = await getDb();
  if (isEmpty) {
    await db.delete(schema.pageSeo).where(eq(schema.pageSeo.path, path));
  } else {
    await db
      .insert(schema.pageSeo)
      .values({
        path,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImageUrl: ogImageUrl || null,
        noindex: Boolean(noindex),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.pageSeo.path,
        set: {
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          ogImageUrl: ogImageUrl || null,
          noindex: Boolean(noindex),
          updatedAt: new Date(),
        },
      });
  }

  invalidate(CMS_TAGS.pageSeo);
  redirect(`/admin/seo/${routeKey(path)}?saved=1`);
}
