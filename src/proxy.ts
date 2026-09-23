import { NextResponse, type NextRequest } from "next/server";

/**
 * Two jobs, both cheap:
 *
 * 1. /admin gate — an OPTIMISTIC check that a session cookie exists, so
 *    signed-out visitors bounce to the login page without rendering anything.
 *    Real verification happens in `requireUser()` (lib/auth/session.ts) on
 *    every admin page, action and route handler. Never rely on this alone.
 * 2. CMS-managed redirects (Admin → Redirects) — 301/302s for moved or renamed
 *    URLs, which is what keeps old links and search rankings intact.
 */

const SESSION_COOKIE = "jp_admin_session"; // keep in sync with lib/auth/session.ts

type Rule = { source: string; destination: string; permanent: boolean };
let cache: { at: number; map: Map<string, Rule> } | null = null;
let inflight: Promise<void> | null = null;
const TTL = 60_000;

function refresh(origin: string) {
  inflight ??= fetch(`${origin}/api/cms/redirects`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  })
    .then(async (res) => {
      if (!res.ok) return;
      const list = (await res.json()) as Rule[];
      cache = { at: Date.now(), map: new Map(list.map((r) => [r.source.toLowerCase(), r])) };
    })
    .catch(() => {
      /* keep serving the last good set (or none) */
    })
    .finally(() => {
      inflight = null;
      cache ??= { at: Date.now(), map: new Map() };
    });
  return inflight;
}

/**
 * Stale-while-revalidate: a warm instance answers from memory instantly and
 * refreshes in the background. Only a cold instance waits — and never more
 * than 1.5s, so a slow database can't hold a page hostage.
 */
async function loadRules(origin: string): Promise<Map<string, Rule>> {
  if (cache) {
    if (Date.now() - cache.at > TTL) void refresh(origin);
    return cache.map;
  }
  await Promise.race([refresh(origin), new Promise((r) => setTimeout(r, 1500))]);
  // `cache` is assigned inside refresh(); TS can't see that across the await.
  return (cache as { map: Map<string, Rule> } | null)?.map ?? new Map();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login";
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!isLogin && !hasSession) {
      const url = new URL("/admin/login", request.url);
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  const key = (pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname).toLowerCase();
  const rule = (await loadRules(request.nextUrl.origin)).get(key);
  if (rule) {
    const target = new URL(rule.destination, request.url);
    if (target.href !== request.nextUrl.href) {
      // Carry the query string across unless the destination sets its own.
      if (!target.search) target.search = request.nextUrl.search;
      return NextResponse.redirect(target, rule.permanent ? 308 : 307);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes, static media and metadata files.
    "/((?!_next/static|_next/image|api/|media/|uploads/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image).*)",
  ],
};
