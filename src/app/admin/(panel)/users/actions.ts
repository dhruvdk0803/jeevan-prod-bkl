"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin, revokeUserSessions } from "@/lib/auth/session";
import { hashPassword, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { zodFieldErrors, type ActionState } from "@/lib/cms/action-state";

/** Server Actions for `/admin/users`. Every export requires an admin. */

const roleSchema = z.enum(["admin", "editor"]);
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);

/** True if `userId` is currently an admin and the only one. */
async function isLastAdmin(db: Awaited<ReturnType<typeof getDb>>, userId: string) {
  const [target] = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, userId));
  if (!target || target.role !== "admin") return false;
  const [{ n }] = await db.select({ n: count() }).from(schema.users).where(eq(schema.users.role, "admin"));
  return n <= 1;
}

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(120),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  role: roleSchema,
  password: passwordSchema,
});

export async function createUser(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }

  const db = await getDb();
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, parsed.data.email));
  if (existing) {
    return { ok: false, message: "A user with that email already exists.", fieldErrors: { email: "Already in use." } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [created] = await db
    .insert(schema.users)
    .values({ name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash })
    .returning({ id: schema.users.id });

  revalidatePath("/admin/users");
  redirect(`/admin/users/${created.id}`);
}

const updateRoleSchema = z.object({ userId: z.uuid(), role: roleSchema });

export async function updateRole(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateRoleSchema.safeParse({ userId: formData.get("userId"), role: formData.get("role") });
  if (!parsed.success) return { ok: false, message: "Invalid role." };

  const db = await getDb();
  if (parsed.data.role !== "admin" && (await isLastAdmin(db, parsed.data.userId))) {
    return { ok: false, message: "Can't demote the last admin. Promote another user first." };
  }

  await db.update(schema.users).set({ role: parsed.data.role, updatedAt: new Date() }).where(eq(schema.users.id, parsed.data.userId));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { ok: true, message: "Role updated." };
}

const profileSchema = z.object({
  userId: z.uuid(),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
});

export async function updateUserProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = profileSchema.safeParse({
    userId: formData.get("userId"),
    bio: formData.get("bio"),
    avatarUrl: formData.get("avatarUrl"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const db = await getDb();
  await db
    .update(schema.users)
    .set({ bio: parsed.data.bio || null, avatarUrl: parsed.data.avatarUrl || null, updatedAt: new Date() })
    .where(eq(schema.users.id, parsed.data.userId));
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { ok: true, message: "Profile saved." };
}

const resetPasswordSchema = z.object({ userId: z.uuid(), password: passwordSchema });

export async function resetUserPassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = resetPasswordSchema.safeParse({ userId: formData.get("userId"), password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const db = await getDb();
  const passwordHash = await hashPassword(parsed.data.password);
  await db.update(schema.users).set({ passwordHash, updatedAt: new Date() }).where(eq(schema.users.id, parsed.data.userId));
  await revokeUserSessions(parsed.data.userId);
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { ok: true, message: "Password reset. That user's sessions were signed out everywhere." };
}

const deleteUserSchema = z.object({ userId: z.uuid() });

export async function deleteUser(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const parsed = deleteUserSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { ok: false, message: "Invalid user." };

  if (parsed.data.userId === me.id) {
    return { ok: false, message: "You can't delete your own account." };
  }
  const db = await getDb();
  if (await isLastAdmin(db, parsed.data.userId)) {
    return { ok: false, message: "Can't delete the last admin. Promote another user first." };
  }

  await revokeUserSessions(parsed.data.userId);
  await db.delete(schema.users).where(eq(schema.users.id, parsed.data.userId));
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
