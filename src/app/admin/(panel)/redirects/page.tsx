import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { RedirectForm } from "./RedirectForm";
import { DeleteRedirectButton } from "./DeleteRedirectButton";

export const metadata = { title: "Redirects" };

export default async function RedirectsPage() {
  await requireUser();
  const db = await getDb();
  const redirects = await db.select().from(schema.redirects).orderBy(desc(schema.redirects.createdAt));

  return (
    <div>
      <PageHeader title="Redirects" description="Send an old URL to a new one — keeps links and search rankings working after a page moves or is renamed." />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          {redirects.length === 0 ? (
            <EmptyState title="No redirects yet" description="Create one using the form." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-medium">{r.source}</Td>
                    <Td className="text-neutral max-w-xs">
                      <span className="block truncate" title={r.destination}>
                        {r.destination}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={r.permanent ? "neutral" : "info"}>{r.permanent ? "301" : "302"}</Badge>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/admin/redirects/${r.id}/edit`} className="text-ink hover:underline text-[0.8rem] font-medium">
                          Edit
                        </Link>
                        <DeleteRedirectButton id={r.id} source={r.source} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <Card title="New redirect">
          <RedirectForm />
        </Card>
      </div>
    </div>
  );
}
