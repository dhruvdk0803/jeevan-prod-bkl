import Link from "next/link";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, EmptyState, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { TagForm } from "./TagForm";
import { DeleteTagButton } from "./DeleteTagButton";

export const metadata = { title: "Tags" };

async function getTagsWithCounts() {
  const db = await getDb();
  const tags = await db.select().from(schema.tags).orderBy(schema.tags.name);
  const links = await db.select({ tagId: schema.postTags.tagId }).from(schema.postTags);
  const counts = new Map<string, number>();
  for (const l of links) counts.set(l.tagId, (counts.get(l.tagId) ?? 0) + 1);
  return tags.map((t) => ({ ...t, postCount: counts.get(t.id) ?? 0 }));
}

export default async function TagsPage() {
  await requireUser();
  const tags = await getTagsWithCounts();

  return (
    <div>
      <PageHeader title="Tags" description="Fine-grained labels for posts. Tag pages with fewer than two posts stay out of search results." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {tags.length === 0 ? (
            <EmptyState title="No tags yet" description="Create your first tag using the form." />
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
                {tags.map((t) => (
                  <tr key={t.id}>
                    <Td className="font-medium">{t.name}</Td>
                    <Td className="text-neutral">/{t.slug}</Td>
                    <Td>{t.postCount}</Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/admin/tags/${t.id}/edit`} className="text-ink hover:underline text-[0.8rem] font-medium">
                          Edit
                        </Link>
                        <DeleteTagButton id={t.id} name={t.name} postCount={t.postCount} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <Card title="New tag">
          <TagForm />
        </Card>
      </div>
    </div>
  );
}
