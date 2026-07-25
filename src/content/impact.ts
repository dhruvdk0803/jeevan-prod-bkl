import type { ImpactStory, ImpactMetric, Spotlight } from "./types";

/**
 * The research file confirms NO specific community projects, nonprofit
 * partnerships, or volunteer initiatives for Jeevan Productions. The entries
 * below exist only to demonstrate the schema and are all `status: "draft"` —
 * generic placeholder titles, no invented organisations, dates, or outcomes.
 * `publishedImpactStories` is correctly empty until JP supplies real stories.
 */
export const impactStories: ImpactStory[] = [
  {
    slug: "community-story-template-1",
    title: "Community Story Template",
    category: "community",
    excerpt: "Placeholder entry demonstrating the Impact story schema. Not a real project.",
    body: [
      "This is a draft entry used to verify the Impact page's layout and data shape. It does not describe a real Jeevan Productions engagement.",
    ],
    status: "draft",
  },
  {
    slug: "community-story-template-2",
    title: "Community Story Template",
    category: "small-business",
    excerpt: "Placeholder entry demonstrating the Impact story schema. Not a real project.",
    body: [
      "This is a draft entry used to verify the Impact page's layout and data shape. It does not describe a real Jeevan Productions engagement.",
    ],
    status: "draft",
  },
  {
    slug: "community-story-template-3",
    title: "Community Story Template",
    category: "nonprofit",
    excerpt: "Placeholder entry demonstrating the Impact story schema. Not a real project.",
    body: [
      "This is a draft entry used to verify the Impact page's layout and data shape. It does not describe a real Jeevan Productions engagement.",
    ],
    status: "draft",
  },
];

/** Correctly empty until JP confirms and supplies a real, publishable story. */
export const publishedImpactStories = impactStories.filter((s) => s.status === "published");

/**
 * Same rationale as impactStories: no verified spotlight subjects exist.
 * All entries are draft placeholders demonstrating the schema.
 */
export const spotlights: Spotlight[] = [
  {
    slug: "spotlight-template-1",
    name: "Spotlight Template",
    category: "Small Business",
    month: "TBD",
    blurb: "Placeholder entry demonstrating the Spotlight schema. Not a real subject.",
    status: "draft",
  },
  {
    slug: "spotlight-template-2",
    name: "Spotlight Template",
    category: "Nonprofit",
    month: "TBD",
    blurb: "Placeholder entry demonstrating the Spotlight schema. Not a real subject.",
    status: "draft",
  },
  {
    slug: "spotlight-template-3",
    name: "Spotlight Template",
    category: "Community Leader",
    month: "TBD",
    blurb: "Placeholder entry demonstrating the Spotlight schema. Not a real subject.",
    status: "draft",
  },
];

/**
 * No community-impact metrics have ever been published by JP. All metrics
 * are disabled and zeroed so the module hides itself until real numbers
 * exist — per the `enabled` contract in types.ts.
 */
export const impactMetrics: ImpactMetric[] = [
  { label: "Businesses supported", value: 0, enabled: false },
  { label: "Events hosted", value: 0, enabled: false },
  { label: "Attendees", value: 0, enabled: false },
  { label: "Volunteer hours", value: 0, enabled: false },
  { label: "Pro bono projects", value: 0, enabled: false },
];

/**
 * JP Gives has no live presence on jeevanproductions.com or in any verified
 * source — it is written here explicitly as a future initiative, not a
 * claimed program.
 */
export const jpGives = {
  status: "coming-soon" as const,
  title: "JP Gives",
  tagline: "Creativity, given forward.",
  body: [
    "JP Gives is a future initiative — not yet launched. When it opens, it will put Jeevan Productions' own media, marketing, and event work behind causes and small businesses that couldn't otherwise afford it.",
    "Details, eligibility, and how to apply will be published here once the program is live.",
  ],
  offerings: [
    "Pro bono photography and video for qualifying nonprofits",
    "Discounted event production for community organizations",
    "Marketing support for small businesses in transition",
  ],
};

/**
 * Written as belief, not as a claimed accomplishment — grounded in JP's
 * stated philosophy of meaning over promotion, extended to community.
 */
export const impactPhilosophy: string[] = [
  "Business should leave a community better than it found it. That's a belief, not a scoreboard — and it applies to the same work we already do: telling stories, building brands, bringing people into a room together.",
  "We don't have a community track record to publish yet. We'd rather say that plainly than dress up a handful of projects as a program.",
  "As real, confirmed community work happens, it will replace this page — not the other way around.",
];
