import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudyProjects } from "@/content/projects";
import { publishedImpactStories } from "@/content/impact";

/**
 * Static routes plus dynamic case-study and impact-story entries.
 * `publishedImpactStories` is currently empty by design (see impact.ts) —
 * the map over it simply produces zero entries until JP supplies real
 * stories, rather than special-casing an empty collection.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
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

  return [...staticRoutes, ...workRoutes, ...impactRoutes];
}
