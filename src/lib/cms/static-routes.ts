/**
 * The site's static marketing routes, for Admin → SEO overrides and (by
 * import) the public `buildMetadata()` helper. Titles/descriptions here are
 * copied verbatim from each page's current `metadata` export — they're the
 * fallback shown when no `page_seo` override exists.
 */
export type StaticRoute = {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
};

export const STATIC_ROUTES: StaticRoute[] = [
  {
    path: "/",
    label: "Home",
    defaultTitle: "Jeevan Productions — Media, Marketing & Events in San Diego",
    defaultDescription:
      "Jeevan Productions is a creative company in San Diego. We tell stories through media, build brands through marketing, and bring people together through events.",
  },
  {
    path: "/work",
    label: "Work",
    defaultTitle: "Work",
    defaultDescription:
      "Photography and event coverage from Jeevan Productions across media, marketing and events — San Diego and Los Angeles.",
  },
  {
    path: "/portfolio",
    label: "Portfolio",
    defaultTitle: "Portfolio",
    defaultDescription:
      "Jeevan Productions' photography portfolio — stage, evening events, gatherings, weddings, portraits, families, places and details, from a San Diego creative company.",
  },
  {
    path: "/services",
    label: "Services",
    defaultTitle: "Services",
    defaultDescription:
      "Photography and video, brand strategy and campaigns, and full event production — the three things Jeevan Productions does, and how they work together.",
  },
  {
    path: "/about",
    label: "About",
    defaultTitle: "About",
    defaultDescription:
      "Jeevan Productions is a San Diego creative company founded by strategist Jeevan Dhaker — media, marketing and events built around one idea: make it matter.",
  },
  {
    path: "/blog",
    label: "Blog",
    defaultTitle: "Blog",
    defaultDescription:
      "Notes, stories and guides from Jeevan Productions — the San Diego creative company working across media, marketing and events.",
  },
  {
    path: "/impact",
    label: "Impact",
    defaultTitle: "Impact",
    defaultDescription:
      "The people, organizations, and communities Jeevan Productions is grateful to meet along the way — community stories, a monthly spotlight, and JP Gives.",
  },
  {
    path: "/social-hours",
    label: "Social Hours",
    defaultTitle: "Social Hours",
    defaultDescription:
      "Social Hours is Jeevan Productions' curated gatherings across San Diego — outdoor experiences, networking evenings, social nights, and community dinners.",
  },
  {
    path: "/careers",
    label: "Careers",
    defaultTitle: "Careers",
    defaultDescription:
      "Join Jeevan Productions — a San Diego creative company working across media, marketing and events. See open roles or send a general application.",
  },
  {
    path: "/contact",
    label: "Contact",
    defaultTitle: "Contact",
    defaultDescription:
      "Start a project with Jeevan Productions — media, marketing or events in San Diego. Tell us what you're planning and we'll be in touch.",
  },
  {
    path: "/privacy",
    label: "Privacy Policy",
    defaultTitle: "Privacy Policy",
    defaultDescription:
      "How Jeevan Productions handles inquiries, career applications, and the limited data this site collects.",
  },
  {
    path: "/terms",
    label: "Terms of Service",
    defaultTitle: "Terms of Service",
    defaultDescription:
      "The terms that govern use of the Jeevan Productions website — inquiries, careers, content, and liability.",
  },
];

export function getStaticRoute(path: string): StaticRoute | null {
  return STATIC_ROUTES.find((r) => r.path === path) ?? null;
}
