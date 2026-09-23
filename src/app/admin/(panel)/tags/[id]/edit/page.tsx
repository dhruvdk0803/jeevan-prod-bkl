import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/admin/ui";
import { TagForm } from "../../TagForm";

export const metadata = { title: "Edit tag" };

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getDb();
  const [tag] = await db.select().from(schema.tags).where(eq(schema.tags.id, id)).limit(1);
  if (!tag) notFound();

  return (
    <div>
      <PageHeader title={`Edit "${tag.name}"`} back={{ href: "/admin/tags", label: "Tags" }} />
      <Card className="max-w-xl">
        <TagForm tag={tag} />
      </Card>
    </div>
  );
}
