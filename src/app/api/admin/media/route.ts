import { count, desc, ilike, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { UploadError, storeUpload } from "@/lib/cms/storage";

/**
 * `GET /api/admin/media?q=&page=` — search/paginate the media library.
 * `POST /api/admin/media` (multipart: `file`, `alt`) — upload a new image.
 *
 * Both require a signed-in admin user (any role). Unauthenticated requests
 * get a 401 JSON body, never a redirect — this is an API route consumed by
 * client components (MediaPicker, MediaLibrary).
 */

const PAGE_SIZE = 40;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const db = await getDb();
  const where = q
    ? or(ilike(schema.media.filename, `%${q}%`), ilike(schema.media.alt, `%${q}%`))
    : undefined;

  const [items, [{ n }]] = await Promise.all([
    db
      .select()
      .from(schema.media)
      .where(where)
      .orderBy(desc(schema.media.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(schema.media).where(where),
  ]);

  return Response.json({ items, total: n });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim();

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file." }, { status: 400 });
  }
  if (!alt) {
    return Response.json({ error: "Alt text is required." }, { status: 400 });
  }

  let stored;
  try {
    stored = await storeUpload(file);
  } catch (err) {
    if (err instanceof UploadError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const db = await getDb();
  const [row] = await db
    .insert(schema.media)
    .values({
      url: stored.url,
      pathname: stored.pathname,
      filename: file.name.slice(0, 200) || "upload",
      mimeType: stored.mimeType,
      size: stored.size,
      width: stored.width,
      height: stored.height,
      alt,
      uploadedBy: user.id,
    })
    .returning();

  return Response.json(row, { status: 201 });
}
