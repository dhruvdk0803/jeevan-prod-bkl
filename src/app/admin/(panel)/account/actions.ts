"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser, revokeUserSessions } from "@/lib/auth/session";
import { hashPassword, verifyPassword, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { zodFieldErrors, type ActionState } from "@/lib/cms/action-state";

/** Server Actions for `/admin/account` — always act on the signed-in user, never a client-sent id. */

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
});

export async function updateOwnProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    avatarUrl: formData.get("avatarUrl"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const db = await getDb();
  await db
    .update(schema.users)
    .set({ name: parsed.data.name, bio: parsed.data.bio || null, avatarUrl: parsed.data.avatarUrl || null, updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));
  revalidatePath("/admin/account");
  return { ok: true, message: "Profile saved." };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`),
});

export async function changeOwnPassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }

  const db = await getDb();
  const [row] = await db.select({ passwordHash: schema.users.passwordHash }).from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) {
    return { ok: false, message: "Current password is incorrect.", fieldErrors: { currentPassword: "Incorrect password." } };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.update(schema.users).set({ passwordHash, updatedAt: new Date() }).where(eq(schema.users.id, user.id));
  await revokeUserSessions(user.id, true);
  return { ok: true, message: "Password changed. You're still signed in here; other sessions were signed out." };
}
