"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { attemptLogin } from "@/lib/auth/session";
import type { ActionState } from "@/lib/cms/action-state";

/** Server Action backing the `/admin/login` form. */

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

/** Only ever redirect somewhere inside /admin — never off-site, never "//". */
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/admin") && !next.startsWith("//")) return next;
  return "/admin";
}

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0] ?? "form"), i.message]),
      ),
    };
  }

  const result = await attemptLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  redirect(safeNext(parsed.data.next));
}
