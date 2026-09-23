import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/admin/ui";
import { RedirectForm } from "../../RedirectForm";

export const metadata = { title: "Edit redirect" };

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getDb();
  const [redirect] = await db.select().from(schema.redirects).where(eq(schema.redirects.id, id)).limit(1);
  if (!redirect) notFound();

  return (
    <div>
      <PageHeader title={`Edit redirect`} back={{ href: "/admin/redirects", label: "Redirects" }} />
      <Card className="max-w-xl">
        <RedirectForm redirect={redirect} />
      </Card>
    </div>
  );
}
