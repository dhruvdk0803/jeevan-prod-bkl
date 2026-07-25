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

/** Renderable <script> payload. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data) };
}
