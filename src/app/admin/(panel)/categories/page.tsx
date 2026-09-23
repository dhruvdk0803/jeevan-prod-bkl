import Link from "next/link";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, EmptyState, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export const metadata = { title: "Categories" };

async function getCategoriesWithCounts() {
  const db = await getDb();
  const categories = await db.select().from(schema.categories).orderBy(schema.categories.name);
  const posts = await db.select({ categoryId: schema.posts.categoryId }).from(schema.posts);
  const counts = new Map<string, number>();
  for (const p of posts) {
    if (!p.categoryId) continue;
    counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  }
  return categories.map((c) => ({ ...c, postCount: counts.get(c.id) ?? 0 }));
}

export default async function CategoriesPage() {
  await requireUser();
  const categories = await getCategoriesWithCounts();

  return (
    <div>
      <PageHeader title="Categories" description="Group posts into topics. Each category can have its own SEO meta title and description." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {categories.length === 0 ? (
            <EmptyState title="No categories yet" description="Create your first category using the form." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Slug</Th>
                  <Th>Posts</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-medium">{c.name}</Td>
                    <Td className="text-neutral">/{c.slug}</Td>
                    <Td>{c.postCount}</Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/admin/categories/${c.id}/edit`} className="text-ink hover:underline text-[0.8rem] font-medium">
                          Edit
                        </Link>
                        <DeleteCategoryButton id={c.id} name={c.name} postCount={c.postCount} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <Card title="New category">
          <CategoryForm />
        </Card>
      </div>
    </div>
  );
}
