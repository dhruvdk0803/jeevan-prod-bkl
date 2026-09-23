import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, gt, ilike, lte, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
  formatDate,
  formatDateTime,
} from "@/components/admin/ui";
import { createDraftPost } from "./actions";

export const metadata: Metadata = { title: "Posts" };

const PAGE_SIZE = 20;

type StatusFilter = "all" | "draft" | "scheduled" | "published";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

function postStatusBadge(status: "draft" | "published", publishedAt: Date | null) {
  if (status === "draft") return <Badge tone="neutral">Draft</Badge>;
  if (publishedAt && publishedAt.getTime() > Date.now()) return <Badge tone="info">Scheduled</Badge>;
  return <Badge tone="success">Published</Badge>;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const status = (typeof sp.status === "string" ? sp.status : "all") as StatusFilter;
  const categorySlug = typeof sp.category === "string" ? sp.category : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const db = await getDb();
  const categories = await db
    .select({ id: schema.categories.id, name: schema.categories.name, slug: schema.categories.slug })
    .from(schema.categories)
    .orderBy(asc(schema.categories.name));
  const categoryId = categorySlug ? categories.find((c) => c.slug === categorySlug)?.id : undefined;

  const now = new Date();
  const conditions: SQL[] = [];
  if (status === "draft") conditions.push(eq(schema.posts.status, "draft"));
  if (status === "published") conditions.push(and(eq(schema.posts.status, "published"), lte(schema.posts.publishedAt, now))!);
  if (status === "scheduled") conditions.push(and(eq(schema.posts.status, "published"), gt(schema.posts.publishedAt, now))!);
  if (categoryId) conditions.push(eq(schema.posts.categoryId, categoryId));
  if (q) conditions.push(ilike(schema.posts.title, `%${q}%`));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: schema.posts.id,
      title: schema.posts.title,
      slug: schema.posts.slug,
      status: schema.posts.status,
      publishedAt: schema.posts.publishedAt,
      updatedAt: schema.posts.updatedAt,
      noindex: schema.posts.noindex,
      categoryName: schema.categories.name,
      authorName: schema.users.name,
    })
    .from(schema.posts)
    .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
    .where(where)
    .orderBy(desc(schema.posts.updatedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const hasNextPage = rows.length === PAGE_SIZE;
  const qs = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (categorySlug) params.set("category", categorySlug);
    if (q) params.set("q", q);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Write, edit and publish the Jeevan Productions blog."
        actions={
          <form action={createDraftPost}>
            <Button type="submit" variant="primary">
              New post
            </Button>
          </form>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/posts${qs({ status: tab.value === "all" ? "" : tab.value, page: "" })}`}
            className={
              tab.value === status
                ? "bg-ink text-paper inline-flex h-8 items-center rounded-full px-3 text-[0.8rem] font-medium"
                : "border-ink/15 text-ink-3 hover:border-ink/30 inline-flex h-8 items-center rounded-full border px-3 text-[0.8rem] font-medium"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form className="border-ink/10 mb-5 flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end">
        <input type="hidden" name="status" value={status} />
        <Field label="Search" htmlFor="q" className="flex-1">
          <Input id="q" name="q" type="search" defaultValue={q} placeholder="Search by title…" />
        </Field>
        <Field label="Category" htmlFor="category" className="sm:w-56">
          <Select id="category" name="category" defaultValue={categorySlug}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={q || categorySlug || status !== "all" ? "No posts match" : "No posts yet"}
          description={
            q || categorySlug || status !== "all"
              ? "Try a different search or filter."
              : "Start writing the first Jeevan Productions post."
          }
          action={
            !(q || categorySlug || status !== "all") ? (
              <form action={createDraftPost}>
                <Button type="submit" variant="primary">
                  New post
                </Button>
              </form>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Category</Th>
                <Th>Author</Th>
                <Th>Published</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td className="max-w-80 font-medium">
                    <Link href={`/admin/posts/${p.id}`} className="hover:text-ember line-clamp-1">
                      {p.title}
                    </Link>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {postStatusBadge(p.status, p.publishedAt)}
                      {p.noindex ? <Badge tone="warning">Noindex</Badge> : null}
                    </div>
                  </Td>
                  <Td className="text-neutral">{p.categoryName ?? "—"}</Td>
                  <Td className="text-neutral">{p.authorName ?? "—"}</Td>
                  <Td className="text-neutral">{p.status === "published" ? formatDate(p.publishedAt) : "—"}</Td>
                  <Td className="text-neutral">{formatDateTime(p.updatedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          {(page > 1 || hasNextPage) && (
            <div className="mt-4 flex items-center justify-between">
              <Link
                href={`/admin/posts${qs({ page: page > 2 ? String(page - 1) : "" })}`}
                aria-disabled={page <= 1}
                className={
                  page <= 1
                    ? "pointer-events-none text-neutral-2 text-sm"
                    : "text-ink hover:text-ember text-sm font-medium"
                }
              >
                ← Newer
              </Link>
              <span className="text-neutral text-[0.8rem]">Page {page}</span>
              <Link
                href={`/admin/posts${qs({ page: String(page + 1) })}`}
                aria-disabled={!hasNextPage}
                className={
                  !hasNextPage
                    ? "pointer-events-none text-neutral-2 text-sm"
                    : "text-ink hover:text-ember text-sm font-medium"
                }
              >
                Older →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
