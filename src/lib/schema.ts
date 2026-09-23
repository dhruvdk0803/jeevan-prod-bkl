import { site } from "@/content/site";

/**
 * Structured data helpers.
 *
 * Only facts confirmed from jeevanproductions.com or JP's public profiles go
 * in here. Notably absent, on purpose: `aggregateRating` and `review` — JP has
 * no published reviews, and fabricating rating markup is both dishonest and a
 * search-spam violation.
 */

const ORG_ID = `${site.url}/#organization`;

/** CMS images (Vercel Blob / uploads) may already be absolute; local paths aren't. */
function absoluteUrl(pathOrUrl: string) {
  return /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${site.url}${pathOrUrl}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    description: site.description,
    email: site.email,
    telephone: site.phones[0].number,
    foundingDate: site.founded,
    founder: { "@type": "Person", name: site.founder },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    areaServed: site.markets.map((m) => ({
      "@type": "City",
      name: m,
    })),
    openingHours: site.openingHours,
    sameAs: site.socials.map((s) => s.href),
    knowsAbout: [
      "Photography",
      "Video Production",
      "Brand Strategy",
      "Social Media Marketing",
      "Event Production",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

export function breadcrumbSchema(trail: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.href}`,
    })),
  };
}

export function articleSchema(a: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url: `${site.url}${a.slug}`,
    ...(a.image ? { image: `${site.url}${a.image}` } : {}),
    ...(a.datePublished ? { datePublished: a.datePublished } : {}),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function creativeWorkSchema(p: {
  title: string;
  description: string;
  slug: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.description,
    url: `${site.url}${p.slug}`,
    ...(p.image ? { image: `${site.url}${p.image}` } : {}),
    creator: { "@id": ORG_ID },
  };
}

/** Only emitted for events with a confirmed date and venue. */
export function eventSchema(e: {
  name: string;
  description: string;
  date: string;
  venue?: string;
  city?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.name,
    description: e.description,
    startDate: e.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": ORG_ID },
    ...(e.url ? { url: e.url } : {}),
    ...(e.venue
      ? {
          location: {
            "@type": "Place",
            name: e.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: e.city ?? site.city,
              addressRegion: site.region,
              addressCountry: site.country,
            },
          },
        }
      : {}),
  };
}

export function jobPostingSchema(j: {
  title: string;
  description: string;
  datePosted: string;
  employmentType: string;
  location: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.title,
    description: j.description,
    datePosted: j.datePosted,
    employmentType: j.employmentType,
    hiringOrganization: { "@id": ORG_ID },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: j.location,
        addressRegion: site.region,
        addressCountry: site.country,
      },
    },
  };
}

/**
 * BlogPosting schema for a single published post. Author is a `Person` when
 * the post has a byline, falling back to the organization — a post is never
 * emitted without *some* author, but we never invent a name.
 */
export function blogPostingSchema(p: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  datePublished: string;
  dateModified: string;
  authorName?: string | null;
  tags?: string[];
  section?: string | null;
  wordCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    url: `${site.url}/blog/${p.slug}`,
    ...(p.image ? { image: absoluteUrl(p.image) } : {}),
    datePublished: p.datePublished,
    dateModified: p.dateModified,
    author: p.authorName
      ? { "@type": "Person", name: p.authorName }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/blog/${p.slug}` },
    ...(p.tags && p.tags.length ? { keywords: p.tags.join(", ") } : {}),
    ...(p.section ? { articleSection: p.section } : {}),
    ...(typeof p.wordCount === "number" ? { wordCount: p.wordCount } : {}),
  };
}

/** Blog section identity — used once, on the /blog index. */
export function blogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog/#blog`,
    url: `${site.url}/blog`,
    name: `${site.name} — Blog`,
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": `${site.url}/#website` },
  };
}

/** Generic listing schema for /blog, /blog/category/[slug], /blog/tag/[slug], /blog/page/[n]. */
export function collectionPageSchema(c: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.name,
    description: c.description,
    url: `${site.url}${c.path}`,
    isPartOf: { "@id": `${site.url}/#website` },
  };
}

/** Renderable <script> payload. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data) };
}
