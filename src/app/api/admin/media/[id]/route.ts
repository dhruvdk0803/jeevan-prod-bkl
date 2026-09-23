import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteStored } from "@/lib/cms/storage";

/**
 * `PATCH /api/admin/media/:id` (JSON `{ alt }`) — rename an image's alt text.
 * `DELETE /api/admin/media/:id` — remove the file (blob/local) and its row.
 */

const patchSchema = z.object({ alt: z.string().trim().min(1, "Alt text is required.").max(300) });

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const db = await getDb();
  const [row] = await db
    .update(schema.media)
    .set({ alt: parsed.data.alt })
    .where(eq(schema.media.id, id))
    .returning();
  if (!row) return Response.json({ error: "Not found." }, { status: 404 });

  return Response.json(row);
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await ctx.params;
  const db = await getDb();
  const [row] = await db.delete(schema.media).where(eq(schema.media.id, id)).returning();
  if (!row) return Response.json({ error: "Not found." }, { status: 404 });

  await deleteStored(row.pathname, row.url);

  return Response.json({ ok: true });
}
