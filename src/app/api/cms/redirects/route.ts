import { getRedirectRules } from "@/lib/cms/public";

/**
 * Redirect rules as JSON, for `proxy.ts`. Proxy can't use the Next data cache
 * directly, so it fetches this (cached + tag-invalidated) endpoint instead and
 * memoises the result in-process for a minute.
 */
export async function GET() {
  const rules = await getRedirectRules();
  return Response.json(rules, { headers: { "Cache-Control": "no-store" } });
}
