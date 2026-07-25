import type { JobOpening } from "./types";

/** Approved copy, verbatim — do not rewrite. */
export const careersIntro: string[] = [
  "We believe exceptional work is created by exceptional people.",
  "Jeevan Productions brings together creative professionals across media, marketing, and events to produce thoughtful work, meaningful experiences, and lasting relationships.",
  "If you're passionate about your craft and enjoy collaborating with like-minded people, we'd love to hear from you.",
];

/** Areas of interest offered on the general-application form. */
export const roleOptions: string[] = [
  "Photography",
  "Videography",
  "Post-Production",
  "Design",
  "Brand Strategy",
  "Social Media",
  "Marketing",
  "Event Production",
  "Event Staffing",
  "Client Relations",
  "Other",
];

/**
 * No open roles are verified or published by JP anywhere in the research.
 * Left empty on purpose — the careers page should show a general-application
 * state (accepting interest via roleOptions) rather than fabricated postings,
 * until JP supplies real openings.
 */
export const openings: JobOpening[] = [];
