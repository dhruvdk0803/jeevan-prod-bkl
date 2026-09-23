import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { Card, PageHeader } from "@/components/admin/ui";
import { NewUserForm } from "./NewUserForm";

export const metadata: Metadata = { title: "Invite user" };

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="Invite user" back={{ href: "/admin/users", label: "Users" }} />
      <Card className="max-w-lg">
        <NewUserForm minPasswordLength={PASSWORD_MIN_LENGTH} />
      </Card>
    </div>
  );
}
