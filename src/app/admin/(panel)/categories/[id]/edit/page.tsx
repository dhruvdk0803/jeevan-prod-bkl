import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "../../CategoryForm";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getDb();
  const [category] = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
  if (!category) notFound();

  return (
    <div>
      <PageHeader title={`Edit "${category.name}"`} back={{ href: "/admin/categories", label: "Categories" }} />
      <Card className="max-w-xl">
        <CategoryForm category={category} />
      </Card>
    </div>
  );
}
