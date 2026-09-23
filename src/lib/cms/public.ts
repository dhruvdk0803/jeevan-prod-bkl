import "server-only";
import { unstable_cache } from "next/cache";
import { and, count, desc, eq, inArray, lte, ne, sql } from "drizzle-orm";
import { DatabaseUnavailableError, getDb, schema } from "@/db";
import { CMS_TAGS } from "./tags";
import type {
  PageSeoOverride,
  PostCard,
  PostFull,
  PublicCategory,
  PublicTag,
  RedirectRule,
  SiteSettings,
  SitemapPost,
} from "./types";

/**
 * Public, cached reads for the marketing site. The ONLY module public pages
 * should import CMS data from.
 *
 * - Every function is wrapped in `unstable_cache` with tags from `tags.ts`, so
 *   admin writes invalidate exactly what they touched.
 * - A 5-minute `revalidate` backstop means scheduled posts go live within
 *   five minutes of their `publishedAt` without anyone pressing a button.
 * - With no database configured (e.g. a local `next build`), every read
 *   returns its empty fallback instead of failing the build.
 */

const { posts, users, categories, tags, postTags } = schema;
const BACKSTOP = 300;

/** Published AND not in the future. */
const isLive = () =>
  and(eq(posts.status, "published"), lte(posts.publishedAt, sql`now()`));

async function withDb<T>(fallback: T, fn: (db: Awaited<ReturnType<typeof getDb>>) => Promise<T>) {
  let db;
  try {
    db = await getDb();
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) return fallback;
    throw err;
  }
  return fn(db);
}

const iso = (d: Date | string | null | undefined) =>
  d ? new Date(d).toISOString() : new Date(0).toISOString();

const cardColumns = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  excerpt: posts.excerpt,
  coverImageUrl: posts.coverImageUrl,
  coverImageAlt: posts.coverImageAlt,
  coverImageWidth: posts.coverImageWidth,
  coverImageHeight: posts.coverImageHeight,
  publishedAt: posts.publishedAt,
  updatedAt: posts.updatedAt,
  readingMinutes: posts.readingMinutes,
  categoryName: categories.name,
  categorySlug: categories.slug,
  authorName: users.name,
};

type CardRow = {
  [K in keyof typeof cardColumns]: unknown;
};

function toCard(r: CardRow): PostCard {
  return {
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    excerpt: (r.excerpt as string | null) ?? null,
    coverImageUrl: (r.coverImageUrl as string | null) ?? null,
    coverImageAlt: (r.coverImageAlt as string | null) ?? null,
    coverImageWidth: (r.coverImageWidth as number | null) ?? null,
    coverImageHeight: (r.coverImageHeight as number | null) ?? null,
    publishedAt: iso(r.publishedAt as Date),
    updatedAt: iso(r.updatedAt as Date),
    readingMinutes: (r.readingMinutes as number) ?? 1,
    category: r.categorySlug
      ? { name: r.categoryName as string, slug: r.categorySlug as string }
      : null,
    author: r.authorName ? { name: r.authorName as string } : null,
  };
}

/* ------------------------------------------------------------------ posts */

export type PostListQuery = {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
};

export const getPublishedPosts = unstable_cache(
  async (q: PostListQuery = {}): Promise<{ posts: PostCard[]; total: number }> => {
    const page = Math.max(1, Math.floor(q.page ?? 1));
    const perPage = Math.min(48, Math.max(1, Math.floor(q.perPage ?? 12)));
    return withDb({ posts: [], total: 0 }, async (db) => {
      const filters = [isLive(), eq(posts.noindex, false)];
      if (q.categorySlug) filters.push(eq(categories.slug, q.categorySlug));
      if (q.tagSlug) {
        const tagged = db
          .select({ id: postTags.postId })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(tags.slug, q.tagSlug));
        filters.push(inArray(posts.id, tagged));
      }
      const where = and(...filters);
      const [rows, [{ n }]] = await Promise.all([
        db
          .select(cardColumns)
          .from(posts)
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .leftJoin(users, eq(posts.authorId, users.id))
          .where(where)
          .orderBy(desc(posts.publishedAt))
          .limit(perPage)
          .offset((page - 1) * perPage),
        db
          .select({ n: count() })
          .from(posts)
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .where(where),
      ]);
      return { posts: rows.map(toCard), total: n };
    });
  },
  ["cms:getPublishedPosts"],
  { tags: [CMS_TAGS.posts], revalidate: BACKSTOP },
);

/** A single live post by slug, or null. Noindex posts ARE returned (they're
 *  still reachable by URL); the page emits `robots: noindex` for them. */
export function getPostBySlug(slug: string): Promise<PostFull | null> {
  return unstable_cache(
    async (): Promise<PostFull | null> =>
      withDb(null, async (db) => {
        const [row] = await db
          .select({
            ...cardColumns,
            content: posts.content,
            metaTitle: posts.metaTitle,
            metaDescription: posts.metaDescription,
            focusKeyword: posts.focusKeyword,
            canonicalUrl: posts.canonicalUrl,
            ogImageUrl: posts.ogImageUrl,
            noindex: posts.noindex,
            categoryId: posts.categoryId,
            authorId: users.id,
            authorBio: users.bio,
            authorAvatar: users.avatarUrl,
          })
          .from(posts)
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .leftJoin(users, eq(posts.authorId, users.id))
          .where(and(eq(posts.slug, slug), isLive()))
          .limit(1);
        if (!row) return null;
        const tagRows = await db
          .select({ name: tags.name, slug: tags.slug })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, row.id))
          .orderBy(tags.name);
        return {
          ...toCard(row),
          content: row.content,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          focusKeyword: row.focusKeyword,
          canonicalUrl: row.canonicalUrl,
          ogImageUrl: row.ogImageUrl,
          noindex: row.noindex,
          categoryId: row.categoryId,
          author: row.authorId
            ? {
                id: row.authorId,
                name: row.authorName as string,
                bio: row.authorBio,
                avatarUrl: row.authorAvatar,
              }
            : null,
          tags: tagRows,
        };
      }),
    ["cms:getPostBySlug", slug],
    { tags: [CMS_TAGS.posts, CMS_TAGS.post(slug)], revalidate: BACKSTOP },
  )();
}

/** Same category first, then most recent; never the post itself. */
export const getRelatedPosts = unstable_cache(
  async (postId: string, categoryId: string | null, limit = 3): Promise<PostCard[]> =>
    withDb([], async (db) => {
      const rank = categoryId
        ? sql`case when ${posts.categoryId} = ${categoryId} then 0 else 1 end`
        : sql`0`;
      const rows = await db
        .select(cardColumns)
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(and(isLive(), eq(posts.noindex, false), ne(posts.id, postId)))
        .orderBy(rank, desc(posts.publishedAt))
        .limit(limit);
      return rows.map(toCard);
    }),
  ["cms:getRelatedPosts"],
  { tags: [CMS_TAGS.posts], revalidate: BACKSTOP },
);

/** Indexable live posts for sitemap.xml and the RSS feed. */
export const getSitemapPosts = unstable_cache(
  async (): Promise<SitemapPost[]> =>
    withDb([], async (db) => {
      const rows = await db
        .select({ slug: posts.slug, updatedAt: posts.updatedAt, noindex: posts.noindex })
        .from(posts)
        .where(isLive())
        .orderBy(desc(posts.publishedAt));
      return rows.map((r) => ({ ...r, updatedAt: iso(r.updatedAt) }));
    }),
  ["cms:getSitemapPosts"],
  { tags: [CMS_TAGS.posts], revalidate: BACKSTOP },
);

/** Latest live, indexable posts with full HTML — for the RSS feed. */
export const getFeedPosts = unstable_cache(
  async (limit = 30): Promise<(PostCard & { content: string })[]> =>
    withDb([], async (db) => {
      const rows = await db
        .select({ ...cardColumns, content: posts.content })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(and(isLive(), eq(posts.noindex, false)))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
      return rows.map((r) => ({ ...toCard(r), content: r.content }));
    }),
  ["cms:getFeedPosts"],
  { tags: [CMS_TAGS.posts], revalidate: BACKSTOP },
);

/* --------------------------------------------------------------- taxonomy */

/** Categories with their live-post counts (includes empty ones; filter in UI). */
export const getCategories = unstable_cache(
  async (): Promise<PublicCategory[]> =>
    withDb([], async (db) => {
      const rows = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          metaTitle: categories.metaTitle,
          metaDescription: categories.metaDescription,
          postCount: sql<number>`count(${posts.id})::int`,
        })
        .from(categories)
        .leftJoin(
          posts,
          and(eq(posts.categoryId, categories.id), isLive(), eq(posts.noindex, false)),
        )
        .groupBy(categories.id)
        .orderBy(categories.name);
      return rows;
    }),
  ["cms:getCategories"],
  { tags: [CMS_TAGS.categories, CMS_TAGS.posts], revalidate: BACKSTOP },
);

export async function getCategoryBySlug(slug: string): Promise<PublicCategory | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

/** Tags attached to at least one live, indexable post. */
export const getTagsInUse = unstable_cache(
  async (): Promise<PublicTag[]> =>
    withDb([], async (db) => {
      return db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          postCount: sql<number>`count(${posts.id})::int`,
        })
        .from(tags)
        .innerJoin(postTags, eq(postTags.tagId, tags.id))
        .innerJoin(posts, and(eq(posts.id, postTags.postId), isLive(), eq(posts.noindex, false)))
        .groupBy(tags.id)
        .orderBy(tags.name);
    }),
  ["cms:getTagsInUse"],
  { tags: [CMS_TAGS.tags, CMS_TAGS.posts], revalidate: BACKSTOP },
);

export async function getTagBySlug(slug: string): Promise<PublicTag | null> {
  return (await getTagsInUse()).find((t) => t.slug === slug) ?? null;
}

/* -------------------------------------------------------------- settings */

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> =>
    withDb({}, async (db) => {
      const [row] = await db
        .select({ value: schema.settings.value })
        .from(schema.settings)
        .where(eq(schema.settings.key, "site"))
        .limit(1);
      return (row?.value as SiteSettings) ?? {};
    }),
  ["cms:getSiteSettings"],
  { tags: [CMS_TAGS.settings] },
);

/** SEO override for a static route like "/about", or null. */
export async function getPageSeo(path: string): Promise<PageSeoOverride | null> {
  return (await getAllPageSeo()).find((p) => p.path === path) ?? null;
}

export const getAllPageSeo = unstable_cache(
  async (): Promise<PageSeoOverride[]> =>
    withDb([], async (db) =>
      db
        .select({
          path: schema.pageSeo.path,
          metaTitle: schema.pageSeo.metaTitle,
          metaDescription: schema.pageSeo.metaDescription,
          ogImageUrl: schema.pageSeo.ogImageUrl,
          noindex: schema.pageSeo.noindex,
        })
        .from(schema.pageSeo),
    ),
  ["cms:getAllPageSeo"],
  { tags: [CMS_TAGS.pageSeo] },
);

export const getRedirectRules = unstable_cache(
  async (): Promise<RedirectRule[]> =>
    withDb([], async (db) =>
      db
        .select({
          source: schema.redirects.source,
          destination: schema.redirects.destination,
          permanent: schema.redirects.permanent,
        })
        .from(schema.redirects),
    ),
  ["cms:getRedirectRules"],
  { tags: [CMS_TAGS.redirects] },
);
