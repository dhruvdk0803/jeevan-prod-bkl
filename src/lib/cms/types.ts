/**
 * Public CMS types. Everything crossing `unstable_cache` is JSON-serialised,
 * so dates are ISO strings here — never `Date` objects.
 */

export type SiteSettings = {
  /** Fallback <title> for pages without their own. */
  seoTitleDefault?: string;
  /** Fallback meta description. */
  seoDescriptionDefault?: string;
  /** Absolute URL of the default social share image. */
  defaultOgImageUrl?: string;
  /** Google Search Console HTML-tag verification token (content="…" value only). */
  googleSiteVerification?: string;
  /** Bing Webmaster Tools verification token. */
  bingSiteVerification?: string;
  /** GA4 measurement ID, e.g. G-XXXXXXXXXX. Blank = no analytics script. */
  ga4MeasurementId?: string;
  /** Heading + intro on /blog. */
  blogTitle?: string;
  blogIntro?: string;
  /** Meta title/description for the /blog index. */
  blogMetaTitle?: string;
  blogMetaDescription?: string;
};

export type PublicAuthor = {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  postCount?: number;
};

export type PublicTag = { id: string; name: string; slug: string; postCount?: number };

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  publishedAt: string; // ISO
  updatedAt: string; // ISO
  readingMinutes: number;
  category: { name: string; slug: string } | null;
  author: { name: string } | null;
};

export type PostFull = PostCard & {
  content: string; // sanitised HTML
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  noindex: boolean;
  categoryId: string | null;
  author: PublicAuthor | null;
  tags: { name: string; slug: string }[];
};

export type SitemapPost = { slug: string; updatedAt: string; noindex: boolean };

export type PageSeoOverride = {
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  noindex: boolean;
};

export type RedirectRule = { source: string; destination: string; permanent: boolean };
