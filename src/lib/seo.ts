import type { Metadata } from "next";
import { getPageSeo } from "@/lib/cms/public";
import { site } from "@/content/site";

/**
 * Site-wide metadata builder for every page under `app/(site)/**`.
 *
 * Merges a page's default copy with any CMS "page SEO" override
 * (`Admin → SEO`, keyed by path) so editors can change a page's title,
 * description, share image or indexability without a deploy — while the
 * page component still supplies sane defaults when no override exists.
 *
 * `getPageSeo` is a cached read (see `lib/cms/public.ts`); with no database
 * configured it returns `null` and every page falls back to its own copy.
 */

export type OgImage = { url: string; width?: number; height?: number; alt?: string };

/** Extra Open Graph fields for `ogType: "article"` (blog posts). */
export type ArticleOg = {
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  authors?: string[];
};

export type BuildMetadataInput = {
  /** Site-relative path, e.g. "/about" or "/blog/my-post". Also the page-SEO lookup key. */
  path: string;
  /** Default page title (no site-name suffix — the root layout's template appends it). */
  title: string;
  /** Default meta description. */
  description: string;
  /** Open Graph type. Defaults to "website"; pass "article" for blog posts. */
  ogType?: "website" | "article";
  /** Default share image(s), used when there's no CMS override. */
  images?: OgImage[];
  /** Article-only OG fields (publishedTime, tags, authors, …). Ignored unless `ogType: "article"`. */
  article?: ArticleOg;
};

/**
 * Builds a page's `Metadata`, with CMS overrides applied:
 * - `metaTitle` replaces `title` entirely.
 * - `metaDescription` replaces `description` entirely.
 * - `ogImageUrl` replaces the OG/Twitter image.
 * - `noindex` emits `robots: { index: false, follow: true }`.
 *
 * `alternates.canonical` is always set to `path`. The homepage passes
 * `path: "/"`, which gets an *absolute* title (bypassing the root layout's
 * `%s — Jeevan Productions` template) so it doesn't read "Jeevan Productions
 * — Jeevan Productions".
 */
export async function buildMetadata({
  path,
  title,
  description,
  ogType = "website",
  images,
  article,
}: BuildMetadataInput): Promise<Metadata> {
  const override = await getPageSeo(path);

  const finalTitle = override?.metaTitle || title;
  const finalDescription = override?.metaDescription || description;
  const finalImages: OgImage[] | undefined = override?.ogImageUrl
    ? [{ url: override.ogImageUrl }]
    : images;

  const isHome = path === "/";

  // Built as two concrete literals (rather than one object with a spread
  // `type` field) so each branch matches Next's discriminated `OpenGraph`
  // union exactly instead of a loosely-typed merge.
  const openGraph =
    ogType === "article"
      ? {
          title: finalTitle,
          description: finalDescription,
          url: path,
          type: "article" as const,
          siteName: site.name,
          ...(finalImages ? { images: finalImages } : {}),
          ...(article?.publishedTime ? { publishedTime: article.publishedTime } : {}),
          ...(article?.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
          ...(article?.section ? { section: article.section } : {}),
          ...(article?.tags?.length ? { tags: article.tags } : {}),
          ...(article?.authors?.length ? { authors: article.authors } : {}),
        }
      : {
          title: finalTitle,
          description: finalDescription,
          url: path,
          type: "website" as const,
          siteName: site.name,
          ...(finalImages ? { images: finalImages } : {}),
        };

  return {
    title: isHome ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    alternates: { canonical: path },
    ...(override?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      ...(finalImages ? { images: finalImages } : {}),
    },
  };
}
