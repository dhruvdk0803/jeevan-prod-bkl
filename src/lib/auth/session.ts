import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, eq, gt, lt, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getDummyHash, hashPassword, verifyPassword } from "./password";

/**
 * Session auth for /admin.
 *
 * - Opaque random token in an httpOnly, SameSite=Lax cookie; only its SHA-256
 *   is stored, so a leaked sessions table can't be replayed.
 * - 14-day sliding expiry, refreshed when under half the lifetime remains.
 * - `proxy.ts` only does an optimistic "is there a cookie" redirect; the real
 *   check is `requireUser()` here, which every admin page, server action and
 *   admin route handler MUST call.
 */

export const SESSION_COOKIE = "jp_admin_session";
const SESSION_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSession(userId: string) {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY);
  const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await db.insert(schema.sessions).values({ id: sha256(token), userId, expiresAt, userAgent: ua });
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, userId));
  // Opportunistic cleanup of expired sessions.
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  await setSessionCookie(token, expiresAt);
}

/** Current user or null. Memoised per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let db;
  try {
    db = await getDb();
  } catch {
    return null;
  }
  const id = sha256(token);
  const [row] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;

  // Slide the expiry forward. Cookies can only be written from actions/route
  // handlers, so a failure here (during a page render) is expected and ignored.
  if (row.expiresAt.getTime() - Date.now() < (SESSION_DAYS / 2) * DAY) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY);
    try {
      await db.update(schema.sessions).set({ expiresAt }).where(eq(schema.sessions.id, id));
      await setSessionCookie(token, expiresAt);
    } catch {
      /* render context — cookie refresh happens on the next action */
    }
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

/** Use at the top of every admin page / server action / admin route handler. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin?error=forbidden");
  return user;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const db = await getDb();
      await db.delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
    } catch {
      /* cookie is cleared regardless */
    }
  }
  jar.delete(SESSION_COOKIE);
}

/* ---------------------------------------------------------------- login */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Verifies credentials with throttling (5 fails / 15 min per email, 20 per IP)
 * and constant-ish timing for unknown emails. Creates the session on success.
 */
export async function attemptLogin(emailRaw: string, password: string): Promise<LoginResult> {
  const db = await getDb();
  const email = emailRaw.trim().toLowerCase();
  const ip = await clientIp();
  const keys = [`email:${email}`, `ip:${ip}`];
  const since = new Date(Date.now() - WINDOW_MS);

  const [emailFails] = await db
    .select({ n: count() })
    .from(schema.loginAttempts)
    .where(and(eq(schema.loginAttempts.key, keys[0]), gt(schema.loginAttempts.createdAt, since)));
  const [ipFails] = await db
    .select({ n: count() })
    .from(schema.loginAttempts)
    .where(and(eq(schema.loginAttempts.key, keys[1]), gt(schema.loginAttempts.createdAt, since)));
  if (emailFails.n >= MAX_PER_EMAIL || ipFails.n >= MAX_PER_IP) {
    return { ok: false, error: "Too many attempts. Wait 15 minutes and try again." };
  }

  await bootstrapAdminFromEnv(email, password);

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : (await verifyPassword(password, await getDummyHash()), false);

  if (!user || !valid) {
    await db.insert(schema.loginAttempts).values(keys.map((key) => ({ key })));
    await db.delete(schema.loginAttempts).where(lt(schema.loginAttempts.createdAt, since));
    return { ok: false, error: "That email and password don't match." };
  }

  await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.key, keys[0]));
  await createSession(user.id);
  return { ok: true };
}

/**
 * First-run convenience: if the users table is empty and ADMIN_EMAIL +
 * ADMIN_PASSWORD are set, the first login with exactly those credentials
 * creates that admin. Does nothing once any user exists — after that, manage
 * people from /admin/users (and remove the env vars).
 */
async function bootstrapAdminFromEnv(email: string, password: string) {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envEmail || !envPassword || email !== envEmail || password !== envPassword) return;
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(schema.users);
  if (n > 0) return;
  await db
    .insert(schema.users)
    .values({ email: envEmail, name: "Admin", role: "admin", passwordHash: await hashPassword(envPassword) })
    .onConflictDoNothing();
}

/** Revoke every session for a user (password change, user removal). */
export async function revokeUserSessions(userId: string, exceptCurrent = false) {
  const db = await getDb();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (exceptCurrent && token) {
    await db
      .delete(schema.sessions)
      .where(and(eq(schema.sessions.userId, userId), sql`${schema.sessions.id} <> ${sha256(token)}`));
  } else {
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  }
}
