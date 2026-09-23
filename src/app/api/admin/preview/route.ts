import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * `GET /api/admin/preview?id=<postId>` — enables Draft Mode and sends the
 * signed-in editor to the live post URL, so `getPreviewPost` (lib/cms/
 * preview.ts) can serve it regardless of status/schedule. Consumed by the
 * "Preview" button in the post editor and by Agent D's public post page.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

  const db = await getDb();
  const [post] = await db.select({ slug: schema.posts.slug }).from(schema.posts).where(eq(schema.posts.id, id));
  if (!post) return Response.json({ error: "Post not found." }, { status: 404 });

  (await draftMode()).enable();
  redirect(`/blog/${post.slug}`);
}
