import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/admin/ui";
import { getStaticRoute } from "@/lib/cms/static-routes";
import { keyToPath } from "../route-key";
import { SeoForm } from "../SeoForm";

export const metadata = { title: "Edit page SEO" };

export default async function EditPageSeo({ params }: { params: Promise<{ key: string }> }) {
  await requireUser();
  const { key } = await params;
  const path = keyToPath(key);
  const route = getStaticRoute(path);
  if (!route) notFound();

  const db = await getDb();
  const [override] = await db.select().from(schema.pageSeo).where(eq(schema.pageSeo.path, path)).limit(1);

  return (
    <div>
      <PageHeader title={route.label} description={route.path} back={{ href: "/admin/seo", label: "SEO" }} />
      <Card>
        <SeoForm route={route} override={override ?? null} />
      </Card>
    </div>
  );
}
