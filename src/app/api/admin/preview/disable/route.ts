import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * `GET /api/admin/preview/disable?to=` — turns Draft Mode off and returns the
 * visitor to `to` when it's a safe same-site relative path, else `/blog`.
 */
export async function GET(request: Request) {
  (await draftMode()).disable();

  const to = new URL(request.url).searchParams.get("to") ?? "";
  // Same-site paths only. Browsers treat "/\host" like "//host", so reject backslashes too.
  const safe = to.startsWith("/") && !to.startsWith("//") && !to.includes("\\") && !to.includes("://") ? to : "/blog";
  redirect(safe);
}
