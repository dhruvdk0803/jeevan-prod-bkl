import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { RoleForm, ProfileForm, ResetPasswordForm, DeleteUserForm } from "./EditUserForms";

export const metadata: Metadata = { title: "Edit user" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;

  const db = await getDb();
  const [user] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      bio: schema.users.bio,
      avatarUrl: schema.users.avatarUrl,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);

  if (!user) notFound();

  const isSelf = user.id === me.id;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user.name}
        description={
          <>
            {user.email} <Badge tone={user.role === "admin" ? "info" : "neutral"}>{user.role}</Badge>
          </>
        }
        back={{ href: "/admin/users", label: "Users" }}
      />

      <Card title="Role" className="max-w-lg">
        <RoleForm userId={user.id} role={user.role} disabled={isSelf} />
        {isSelf ? <p className="text-neutral mt-2 text-[0.75rem]">You can&rsquo;t change your own role.</p> : null}
      </Card>

      <Card title="Public byline" description="Shown on posts and used for author schema." className="max-w-lg">
        <ProfileForm userId={user.id} bio={user.bio ?? ""} avatarUrl={user.avatarUrl ?? ""} />
      </Card>

      <Card title="Reset password" description="Sets a new password and signs that user out everywhere." className="max-w-lg">
        <ResetPasswordForm userId={user.id} minPasswordLength={PASSWORD_MIN_LENGTH} />
      </Card>

      <Card title="Delete user" className="max-w-lg">
        {isSelf ? (
          <p className="text-neutral text-sm">You can&rsquo;t delete your own account.</p>
        ) : (
          <DeleteUserForm userId={user.id} userName={user.name} />
        )}
      </Card>
    </div>
  );
}
