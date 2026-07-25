/**
 * CMS-ready content model for Jeevan Productions.
 *
 * Every collection below is a structured document type, not hard-coded JSX.
 * Swapping the local `content/*.ts` modules for a headless CMS (Sanity,
 * Payload, Contentful) means replacing the data source only — every consumer
 * imports from `@/content` and reads these types.
 *
 * FACTUAL INTEGRITY RULE
 * ----------------------
 * `verified: true` means the fact is sourced from jeevanproductions.com or a
 * confirmed public JP profile. Anything unconfirmed is either omitted or
 * carries `verified: false`, and components MUST NOT render unverified
 * client names, partnerships, awards, metrics or testimonials as fact.
 * See NEEDS-FROM-CLIENT.md for the open list.
 */

/** The three pillars the whole brand is organised around. */
export type World = "stories" | "brands" | "experiences";

export type WorldMeta = {
  id: World;
  index: string; // "01"
  /** STORIES */
  title: string;
  /** Media */
  discipline: string;
  /** One-line core idea. */
  idea: string;
  blurb: string;
  capabilities: string[];
  href: string;
  image: string;
  imageAlt: string;
};

export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional short muted preview for hover states. */
  video?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Only set when the client has confirmed public attribution. */
  client?: string;
  world: World;
  /** e.g. "Event Photography" — describes the work, always factual. */
  discipline: string;
  year?: string;
  location?: string;
  summary: string;
  cover: MediaAsset;
  gallery: MediaAsset[];
  /** Editorial layout variant used on the homepage / work index. */
  layout: "full" | "duo" | "offset" | "portrait";
  featured: boolean;
  /**
   * A case-study route is generated ONLY when this is present. Projects
   * without a narrative simply have no detail page and no dead link.
   */
  caseStudy?: CaseStudy;
};

export type CaseStudy = {
  context: string;
  approach: string;
  /** Omitted entirely unless JP supplies real, verifiable outcomes. */
  outcome?: string;
  /** Omitted unless the quote is real and attributed with permission. */
  quote?: { text: string; attribution: string; verified: boolean };
};

export type Service = {
  id: string;
  world: World;
  name: string;
  description: string;
  /** Sub-capabilities listed under the service. */
  includes: string[];
  /** True only for services listed live on the current JP site. */
  verified: boolean;
};

export type ImpactStory = {
  slug: string;
  title: string;
  organisation?: string;
  date?: string;
  category: "nonprofit" | "small-business" | "community" | "volunteer" | "arts";
  excerpt: string;
  body: string[];
  cover?: MediaAsset;
  gallery?: MediaAsset[];
  quote?: { text: string; attribution: string };
  /** Draft stories are excluded from the published site. */
  status: "published" | "draft";
};

export type Spotlight = {
  slug: string;
  name: string;
  category: "Nonprofit" | "Small Business" | "Community Leader" | "Artist" | "Volunteer";
  month: string;
  blurb: string;
  image?: MediaAsset;
  status: "published" | "draft";
};

export type ImpactMetric = {
  label: string;
  value: number;
  suffix?: string;
  /** The whole metrics module hides itself unless a metric is enabled. */
  enabled: boolean;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  bio?: string;
  photo?: MediaAsset;
  links?: { label: string; href: string }[];
  /** Confirmed as current staff by the client. */
  verified: boolean;
  status: "published" | "draft";
};

export type JPEvent = {
  slug: string;
  name: string;
  series?: string;
  /** ISO date. Undefined = date not yet announced. */
  date?: string;
  timeLabel?: string;
  venue?: string;
  city?: string;
  description: string;
  image?: MediaAsset;
  ticketUrl?: string;
  status: "upcoming" | "past" | "draft";
  verified: boolean;
};

export type Partner = {
  name: string;
  href?: string;
  logo?: MediaAsset;
  /** Never rendered unless true. */
  verified: boolean;
};

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  verified: boolean;
};

export type JobOpening = {
  slug: string;
  title: string;
  discipline: string;
  type: "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship";
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  datePosted: string;
  status: "open" | "closed";
};

export type NavItem = {
  label: string;
  href: string;
  /** Shown in the fullscreen menu as a supporting line. */
  meta?: string;
};
