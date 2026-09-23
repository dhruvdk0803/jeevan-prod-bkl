import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/admin/ui";
import { ProfileForm, PasswordForm } from "./AccountForms";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const sessionUser = await requireUser();
  const db = await getDb();
  const [user] = await db
    .select({ name: schema.users.name, bio: schema.users.bio, avatarUrl: schema.users.avatarUrl })
    .from(schema.users)
    .where(eq(schema.users.id, sessionUser.id))
    .limit(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Account" description="Your profile and login." />

      <Card title="Profile" className="max-w-lg">
        <ProfileForm name={user?.name ?? sessionUser.name} bio={user?.bio ?? ""} avatarUrl={user?.avatarUrl ?? ""} />
      </Card>

      <Card title="Password" className="max-w-lg">
        <PasswordForm />
      </Card>
    </div>
  );
}
