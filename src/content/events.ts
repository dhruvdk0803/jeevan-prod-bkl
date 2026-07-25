import type { JPEvent } from "./types";

/**
 * Research found no branded "Social Hours" series live on jeevanproductions.com.
 * What IS verified: JP runs curated San Diego gatherings across four named
 * categories (from the `#upcoming-event` section) and routes every listing
 * to its Eventbrite organizer page — that page, not this site, is the
 * source of truth for current dates.
 */
export const socialHours = {
  headline: "Good things happen when good people get in the same room.",
  intro: [
    "Jeevan Productions curates gatherings across San Diego — outdoor adventures, social nights, networking evenings, and community dinners.",
    "New experiences are added regularly. Current dates and tickets live on Eventbrite, not here — so this page never shows a stale listing.",
  ],
  categories: [
    { name: "Outdoor Experiences", blurb: "Hikes, nature walks & scenic adventures" },
    { name: "Networking Events", blurb: "Connect, collaborate & grow together" },
    { name: "Social Gatherings", blurb: "Meet new people & build relationships" },
    { name: "Dinners & Community", blurb: "Great food, conversations & connections" },
  ],
  note: "Full, current listings and tickets are on our Eventbrite page — this site links out rather than duplicating dates that can change.",
};

/**
 * One verified past event (a single dated Eventbrite listing seen at
 * research time, already past by the time of this redesign — kept as an
 * honest example of format and tone, not a current listing). No date/year
 * is asserted; timeLabel carries the only verified time detail.
 *
 * The two "-template" entries are draft schema examples, excluded from
 * `upcomingEvents` by their status, so the events page can render a real
 * empty state ("next gathering announced soon") without a dead listing.
 */
export const events: JPEvent[] = [
  {
    slug: "afternoon-tea-meaningful-connections",
    name: "Afternoon Tea & Meaningful Connections",
    // date: omitted — the verified sighting (Sun, July 12) predates this redesign; no year is asserted.
    timeLabel: "2:30–4:30 PM",
    venue: "The Britannia Tearooms",
    city: "San Diego",
    description:
      "A seated afternoon tea built for conversation — one of JP's Dinners & Community gatherings, verified via a past Eventbrite listing.",
    status: "past",
    verified: true,
  },
  {
    slug: "event-template-1",
    name: "Event Template",
    description: "Placeholder entry demonstrating the JPEvent schema. Not a real, dated event.",
    status: "draft",
    verified: false,
  },
  {
    slug: "event-template-2",
    name: "Event Template",
    description: "Placeholder entry demonstrating the JPEvent schema. Not a real, dated event.",
    status: "draft",
    verified: false,
  },
];

/** Correctly empty — no verified upcoming event has a confirmed date yet. */
export const upcomingEvents = events.filter((e) => e.status === "upcoming");
