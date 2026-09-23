"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth/session";

/** Signs the current user out and returns them to the login screen. */
export async function signOut() {
  await destroySession();
  redirect("/admin/login");
}
