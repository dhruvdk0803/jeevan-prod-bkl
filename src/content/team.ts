import type { TeamMember } from "./types";

/**
 * Jeevan Dhaker is the only team member confirmed as current staff — named
 * directly in the live "Our Story" copy and corroborated by public
 * LinkedIn. The other four names below appear ONLY inside a commented-out
 * "Our Leadership Team" block in the site's HTML source — never rendered to
 * visitors, and not confirmed as current staff. They are included as
 * `verified: false, status: "draft"` so the team page can preview the
 * schema without asserting anyone's current employment as fact.
 *
 * No team photos exist in the verified asset set (the commented-out
 * `*-min.webp` paths were not confirmed to exist) — `photo` is omitted for
 * everyone.
 */
export const team: TeamMember[] = [
  {
    slug: "jeevan-dhaker",
    name: "Jeevan Dhaker",
    role: "Founder",
    bio: "Jeevan Dhaker founded Jeevan Productions on the idea that every brand has a story worth telling with clarity, creativity, and purpose — bringing together strategy, storytelling, and execution under one roof.",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/jeevan_dhaker_jd/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/jeevan-dhaker/" },
    ],
    verified: true,
    status: "published",
  },
  // UNCONFIRMED — sourced only from commented-out HTML on jeevanproductions.com,
  // never rendered live. Confirm current employment before publishing.
  {
    slug: "divyanshu-dhakar",
    name: "Divyanshu Dhakar",
    role: "Marketing Director",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/monteus.in/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/divyanshu-dhakar/" },
    ],
    verified: false,
    status: "draft",
  },
  // UNCONFIRMED — sourced only from commented-out HTML on jeevanproductions.com,
  // never rendered live. Confirm current employment before publishing.
  {
    slug: "pramod-prajapati",
    name: "Pramod Prajapati",
    role: "Advertising Director",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/pramodprajapati1311/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/pramodprajapati1311/" },
    ],
    verified: false,
    status: "draft",
  },
  // UNCONFIRMED — sourced only from commented-out HTML on jeevanproductions.com,
  // never rendered live. Confirm current employment before publishing.
  {
    slug: "piyush-dhaker",
    name: "Piyush Dhaker",
    role: "Post-Production Director",
    links: [{ label: "Instagram", href: "https://www.instagram.com/piyushdhaker14/" }],
    verified: false,
    status: "draft",
  },
  // UNCONFIRMED — sourced only from commented-out HTML on jeevanproductions.com,
  // never rendered live. Confirm current employment before publishing.
  {
    slug: "michael-gonzalez",
    name: "Michael Gonzalez",
    role: "Client Relationship Manager",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/fusionmix_bartending/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/michael-gonzalez-a0b015315/" },
    ],
    verified: false,
    status: "draft",
  },
];

export const publishedTeam = team.filter((m) => m.status === "published");
