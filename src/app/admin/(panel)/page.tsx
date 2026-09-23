import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/cms/public";
import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  Table,
  Td,
  Th,
  formatDateTime,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

type RecentPost = {
  id: string;
  title: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  updatedAt: Date;
};

async function loadDashboard() {
  const db = await getDb();
  const now = new Date();

  const [[published], [scheduled], [drafts], [categories], [media], recentPosts] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.status, "published"),
          or(isNull(schema.posts.publishedAt), lte(schema.posts.publishedAt, now)),
        ),
      ),
    db
      .select({ n: count() })
      .from(schema.posts)
      .where(and(eq(schema.posts.status, "published"), gt(schema.posts.publishedAt, now))),
    db.select({ n: count() }).from(schema.posts).where(eq(schema.posts.status, "draft")),
    db.select({ n: count() }).from(schema.categories),
    db.select({ n: count() }).from(schema.media),
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        status: schema.posts.status,
        publishedAt: schema.posts.publishedAt,
        updatedAt: schema.posts.updatedAt,
      })
      .from(schema.posts)
      .orderBy(desc(schema.posts.updatedAt))
      .limit(8),
  ]);

  return {
    counts: {
      published: published.n,
      scheduled: scheduled.n,
      drafts: drafts.n,
      categories: categories.n,
      media: media.n,
    },
    recentPosts: recentPosts as RecentPost[],
  };
}

function statusBadge(post: RecentPost) {
  if (post.status === "draft") return <Badge tone="warning">Draft</Badge>;
  if (post.publishedAt && post.publishedAt.getTime() > Date.now()) {
    return <Badge tone="info">Scheduled</Badge>;
  }
  return <Badge tone="success">Published</Badge>;
}

function ChecklistItem({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-2.5 py-1.5 text-sm">
      <span
        aria-hidden="true"
        className={ok ? "text-emerald-700 mt-0.5" : "text-neutral-2 mt-0.5"}
      >
        {ok ? "✓" : "○"}
      </span>
      <span>
        <span className={ok ? "text-ink" : "text-ink-3"}>{label}</span>
        {!ok && hint ? <span className="text-neutral block text-[0.75rem]">{hint}</span> : null}
      </span>
    </li>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [{ counts, recentPosts }, settings, user] = await Promise.all([
    loadDashboard(),
    getSiteSettings(),
    getCurrentUser(),
  ]);
  const isAdmin = user?.role === "admin";

  const hasPublished = counts.published > 0;
  const checklist = [
    {
      ok: Boolean(settings.googleSiteVerification),
      label: "Search Console verification set",
      hint: "Add a verification token in Settings.",
    },
    {
      ok: Boolean(settings.seoDescriptionDefault),
      label: "Default meta description set",
      hint: "Used as a fallback when a page has no override.",
    },
    { ok: Boolean(settings.ga4MeasurementId), label: "GA4 measurement ID set", hint: "Enables analytics tracking." },
    { ok: hasPublished, label: "At least one published post", hint: "Publish your first post from Posts." },
  ];

  return (
    <div className="flex flex-col gap-8">
      {error === "forbidden" ? (
        <Alert tone="danger" title="You don't have access to that page">
          That area is limited to admins.
        </Alert>
      ) : null}

      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Published" value={counts.published} />
        <StatCard label="Scheduled" value={counts.scheduled} />
        <StatCard label="Drafts" value={counts.drafts} />
        <StatCard label="Categories" value={counts.categories} />
        <StatCard label="Media" value={counts.media} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Recent posts" description="Last 8 posts by edit time.">
            {recentPosts.length === 0 ? (
              <EmptyState
                title="No posts yet"
                description="New posts you write will show up here."
                action={<ButtonLink href="/admin/posts/new">New post</ButtonLink>}
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Title</Th>
                    <Th>Status</Th>
                    <Th>Updated</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.map((post) => (
                    <tr key={post.id}>
                      <Td className="font-medium">
                        <Link href={`/admin/posts/${post.id}`} className="hover:text-ember">
                          {post.title || "Untitled"}
                        </Link>
                      </Td>
                      <Td>{statusBadge(post)}</Td>
                      <Td className="text-neutral">{formatDateTime(post.updatedAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Quick actions">
            <div className="flex flex-col gap-2">
              <ButtonLink href="/admin/posts/new" variant="primary">
                New post
              </ButtonLink>
              <ButtonLink href="/admin/media" variant="secondary">
                Media library
              </ButtonLink>
              <ButtonLink href="/admin/seo" variant="secondary">
                SEO settings
              </ButtonLink>
            </div>
          </Card>

          <Card title="SEO setup checklist">
            <ul className="flex flex-col">
              {checklist.map((item) => (
                <ChecklistItem key={item.label} ok={item.ok} label={item.label} hint={item.hint} />
              ))}
            </ul>
            {isAdmin ? (
              <Link href="/admin/settings" className="text-ember mt-3 inline-block text-sm font-medium hover:underline">
                Go to Settings →
              </Link>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-ink/10 rounded-xl border bg-white px-4 py-3.5">
      <p className="text-neutral text-[0.72rem] font-medium tracking-wide uppercase">{label}</p>
      <p className="font-display text-ink mt-1 text-2xl tracking-[-0.02em]">{value}</p>
    </div>
  );
}
