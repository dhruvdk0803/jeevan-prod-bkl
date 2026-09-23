"use server";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { type ActionState, zodFieldErrors } from "@/lib/cms/action-state";
import { CMS_TAGS, invalidate } from "@/lib/cms/tags";

/** Normalise a redirect source/relative-destination path: lower-case, strip query/hash, no trailing slash except "/". */
function normalisePath(raw: string): string {
  let p = raw.trim().toLowerCase();
  const cut = p.search(/[?#]/);
  if (cut !== -1) p = p.slice(0, cut);
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p;
}

const RESERVED_PREFIXES = ["/admin", "/api", "/_next"];

const redirectSchema = z
  .object({
    id: z.string().uuid().optional(),
    source: z
      .string()
      .trim()
      .min(1, "Source is required.")
      .transform(normalisePath)
      .refine((v) => v.startsWith("/"), "Source must start with \"/\".")
      .refine((v) => !RESERVED_PREFIXES.some((p) => v === p || v.startsWith(`${p}/`)), "Can't redirect an admin, API or internal route."),
    destination: z.string().trim().min(1, "Destination is required."),
    permanent: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const isAbsolute = /^https?:\/\//i.test(data.destination);
    if (!isAbsolute) {
      if (!data.destination.startsWith("/")) {
        ctx.addIssue({ code: "custom", path: ["destination"], message: "Use a path starting with \"/\", or an absolute http(s) URL." });
        return;
      }
    }
    const dest = isAbsolute ? data.destination.trim() : normalisePath(data.destination);
    if (dest === data.source) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Source and destination can't be the same." });
    }
  });

export async function saveRedirect(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const raw = {
    id: (formData.get("id") as string) || undefined,
    source: (formData.get("source") as string) ?? "",
    destination: (formData.get("destination") as string) ?? "",
    permanent: formData.get("permanent") === "on",
  };
  const parsed = redirectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Check the fields below.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const { id, source, permanent } = parsed.data;
  const isAbsolute = /^https?:\/\//i.test(parsed.data.destination);
  const destination = isAbsolute ? parsed.data.destination.trim() : normalisePath(parsed.data.destination);

  const db = await getDb();

  const dupe = await db
    .select({ id: schema.redirects.id })
    .from(schema.redirects)
    .where(id ? and(eq(schema.redirects.source, source), ne(schema.redirects.id, id)) : eq(schema.redirects.source, source))
    .limit(1);
  if (dupe.length > 0) {
    return { ok: false, message: "A redirect from that source already exists.", fieldErrors: { source: "Already in use." } };
  }

  // Reject a simple 2-hop loop: an existing rule that redirects `destination` back to `source`.
  if (!isAbsolute) {
    const [reverse] = await db.select().from(schema.redirects).where(eq(schema.redirects.source, destination)).limit(1);
    if (reverse && reverse.destination === source) {
      return { ok: false, message: "This would create a redirect loop with an existing rule.", fieldErrors: { destination: "Creates a loop." } };
    }
  }

  if (id) {
    const [row] = await db
      .update(schema.redirects)
      .set({ source, destination, permanent: Boolean(permanent), updatedAt: new Date() })
      .where(eq(schema.redirects.id, id))
      .returning();
    if (!row) return { ok: false, message: "Redirect not found." };
  } else {
    await db.insert(schema.redirects).values({ source, destination, permanent: Boolean(permanent) });
  }

  invalidate(CMS_TAGS.redirects);
  redirect("/admin/redirects");
}

export async function deleteRedirect(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Missing redirect." };

  const db = await getDb();
  await db.delete(schema.redirects).where(eq(schema.redirects.id, id));
  invalidate(CMS_TAGS.redirects);
  revalidatePath("/admin/redirects");

  return { ok: true, message: "Redirect deleted." };
}
