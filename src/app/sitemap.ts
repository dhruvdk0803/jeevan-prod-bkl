import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudyProjects } from "@/content/projects";
import { publishedImpactStories } from "@/content/impact";
import { getAllPageSeo, getCategories, getSitemapPosts } from "@/lib/cms/public";

/**
 * Static routes plus dynamic case-study, impact-story and CMS blog entries.
 * `publishedImpactStories` is currently empty by design (see impact.ts) —
 * the map over it simply produces zero entries until JP supplies real
 * stories, rather than special-casing an empty collection. Blog posts and
 * categories behave the same way with no database configured or no content
 * published yet: every CMS read below returns `[]`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [pageSeo, posts, categories] = await Promise.all([
    getAllPageSeo(),
    getSitemapPosts(),
    getCategories(),
  ]);
  const noindexPaths = new Set(pageSeo.filter((p) => p.noindex).map((p) => p.path));

  const candidateStaticRoutes: (MetadataRoute.Sitemap[number] & { url: string })[] = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/impact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${site.url}/social-hours`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    { url: `${site.url}/careers`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  // A static route dropped from the CMS's page-SEO panel (Admin → SEO) is
  // excluded here rather than emitted with a noindex hint sitemaps can't express.
  const staticRoutes = candidateStaticRoutes.filter(
    (r) => !noindexPaths.has(r.url.replace(site.url, "") || "/"),
  );

  const workRoutes: MetadataRoute.Sitemap = caseStudyProjects.map((project) => ({
    url: `${site.url}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const impactRoutes: MetadataRoute.Sitemap = publishedImpactStories.map((story) => ({
    url: `${site.url}/impact/${story.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => !p.noindex)
    .map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => (c.postCount ?? 0) > 0)
    .map((c) => ({
      url: `${site.url}/blog/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  return [...staticRoutes, ...workRoutes, ...impactRoutes, ...postRoutes, ...categoryRoutes];
}
