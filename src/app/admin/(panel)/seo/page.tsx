import Link from "next/link";
import { and, eq, isNull, or, isNotNull, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { Badge, Card, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { STATIC_ROUTES } from "@/lib/cms/static-routes";
import { routeKey } from "./route-key";

export const metadata = { title: "SEO" };

async function getHealth() {
  const db = await getDb();
  const { posts, media } = schema;

  const [missingMetaDescription, missingCoverAlt, missingExcerpt, noindexed, missingMediaAlt] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.status, "published"), or(isNull(posts.metaDescription), eq(posts.metaDescription, "")))),
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts)
      .where(
          and(
            eq(posts.status, "published"),
            // Only posts that HAVE a cover image can be missing its alt text.
            isNotNull(posts.coverImageUrl),
            ne(posts.coverImageUrl, ""),
            or(isNull(posts.coverImageAlt), eq(posts.coverImageAlt, "")),
          ),
        ),
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.status, "published"), or(isNull(posts.excerpt), eq(posts.excerpt, "")))),
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.status, "published"), eq(posts.noindex, true))),
    db.select({ id: media.id, filename: media.filename }).from(media).where(eq(media.alt, "")),
  ]);

  return { missingMetaDescription, missingCoverAlt, missingExcerpt, noindexed, missingMediaAlt };
}

export default async function SeoPage() {
  await requireUser();
  const db = await getDb();
  const overrides = await db.select().from(schema.pageSeo);
  const overrideByPath = new Map(overrides.map((o) => [o.path, o]));
  const health = await getHealth();

  const healthItems = [
    { label: "Published posts missing meta description", posts: health.missingMetaDescription },
    { label: "Published posts missing cover image alt text", posts: health.missingCoverAlt },
    { label: "Published posts missing excerpt", posts: health.missingExcerpt },
    { label: "Published posts marked noindex", posts: health.noindexed },
  ];

  return (
    <div>
      <PageHeader title="SEO" description="Per-page meta title, description and social image overrides, plus a health check across published content." />

      <Card title="SEO health" className="mb-6">
        <ul className="flex flex-col divide-y divide-ink/5">
          {healthItems.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-ink text-sm">{item.label}</span>
              {item.posts.length === 0 ? (
                <Badge tone="success">0</Badge>
              ) : (
                <div className="flex flex-wrap justify-end gap-1.5">
                  {item.posts.slice(0, 5).map((p) => (
                    <Link key={p.id} href={`/admin/posts/${p.id}/edit`}>
                      <Badge tone="warning">{p.title}</Badge>
                    </Link>
                  ))}
                  {item.posts.length > 5 ? <Badge tone="warning">+{item.posts.length - 5} more</Badge> : null}
                </div>
              )}
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-ink text-sm">Media missing alt text</span>
            {health.missingMediaAlt.length === 0 ? (
              <Badge tone="success">0</Badge>
            ) : (
              <Link href="/admin/media">
                <Badge tone="warning">{health.missingMediaAlt.length} image{health.missingMediaAlt.length === 1 ? "" : "s"}</Badge>
              </Link>
            )}
          </li>
        </ul>
      </Card>

      <Card title="Page overrides" description="Static marketing pages. Overrides here take priority over each page's built-in defaults.">
        <Table>
          <thead>
            <tr>
              <Th>Page</Th>
              <Th>Path</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {STATIC_ROUTES.map((route) => {
              const override = overrideByPath.get(route.path);
              return (
                <tr key={route.path}>
                  <Td className="font-medium">{route.label}</Td>
                  <Td className="text-neutral">{route.path}</Td>
                  <Td>
                    {override ? (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="info">Customized</Badge>
                        {override.noindex ? <Badge tone="warning">Noindex</Badge> : null}
                      </div>
                    ) : (
                      <Badge tone="neutral">Default</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <Link href={`/admin/seo/${routeKey(route.path)}`} className="text-ink hover:underline text-[0.8rem] font-medium">
                      Edit
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
