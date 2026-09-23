import { requireUser } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/shell/AdminShell";

/**
 * Authenticated shell for every `/admin/*` page except `/admin/login`.
 * `requireUser()` is the REAL auth check — `proxy.ts` only optimistically
 * gates on cookie presence.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
