import type { NavItem, WorldMeta } from "./types";

/**
 * Company facts. Every value here is sourced from jeevanproductions.com or a
 * confirmed public JP profile. Do not add unverified information.
 */
export const site = {
  name: "Jeevan Productions",
  legalName: "Jeevan Productions LLC",
  founder: "Jeevan Dhaker",
  /** Live tagline on the current site. */
  tagline: "Creativity is our identity.",
  url: "https://www.jeevanproductions.com",
  description:
    "Jeevan Productions is a creative company in San Diego working across media, marketing and events — telling stories, building brands and bringing people together.",
  email: "Team@JeevanProductions.com",
  phones: [
    { label: "San Diego / Los Angeles", number: "(310) 363-0288", tel: "+13103630288" },
    { label: "Kansas City", number: "(816) 974-6089", tel: "+18169746089" },
  ],
  /** Primary market, per on-page copy ("Serving San Diego"). */
  city: "San Diego",
  region: "CA",
  regionName: "California",
  country: "US",
  /** Markets named on the current site + LinkedIn profile. */
  markets: ["San Diego", "Los Angeles"],
  hours: "Mon–Fri, 8AM–5PM",
  openingHours: "Mo-Fr 08:00-17:00",
  founded: "2015",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/jeevan_productions/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/jeevan-productions/" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61560525371598" },
  ],
  eventbrite: "https://www.eventbrite.com/o/jeevan-productions-121470153411",
  /** Closing statement used across the footer and CTA blocks. */
  closingStatement: "Let's create something worth remembering.",
} as const;

export const primaryNav: NavItem[] = [
  { label: "Work", href: "/work", meta: "Selected projects" },
  { label: "Portfolio", href: "/portfolio", meta: "The story in frames" },
  { label: "Services", href: "/services", meta: "Media, marketing, events" },
  { label: "About", href: "/about", meta: "Who we are" },
  { label: "Blog", href: "/blog", meta: "Notes, stories and guides" },
  { label: "Impact", href: "/impact", meta: "Community stories" },
  { label: "Social Hours", href: "/social-hours", meta: "Gatherings across San Diego" },
  { label: "Careers", href: "/careers", meta: "Join the team" },
  { label: "Contact", href: "/contact", meta: "Start a project" },
];

export const footerNav: NavItem[] = [
  { label: "Home", href: "/" },
  ...primaryNav,
];

export const legalNav: NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/**
 * The three worlds. This is the organising idea for the entire site:
 * stories become media, ideas become brands, people become communities.
 */
export const worlds: WorldMeta[] = [
  {
    id: "stories",
    index: "01",
    title: "Stories",
    discipline: "Media",
    idea: "We tell stories worth remembering.",
    blurb:
      "Photography, video and film that carry a brand's story, its services and its personality — made to last longer than a scroll.",
    capabilities: [
      "Photography",
      "Video Production",
      "Commercial Content",
      "Branded Content",
      "Social Content",
      "Visual Storytelling",
    ],
    href: "/services#stories",
    image: "/media/work/photo-4.jpeg",
    imageAlt: "Jeevan Productions photography — a moment captured on location in San Diego.",
  },
  {
    id: "brands",
    index: "02",
    title: "Brands",
    discipline: "Marketing",
    idea: "We build brands people want to connect with.",
    blurb:
      "Strategy, creative direction and campaigns that start with who you are and what you want to be remembered for.",
    capabilities: [
      "Brand Strategy",
      "Creative Direction",
      "Social Media",
      "Campaigns",
      "Graphic Design",
      "Content Strategy",
    ],
    href: "/services#brands",
    image: "/media/work/photo-11.jpeg",
    imageAlt: "Jeevan Productions brand and campaign photography.",
  },
  {
    id: "experiences",
    index: "03",
    title: "Experiences",
    discipline: "Events",
    idea: "We create experiences that bring people together.",
    blurb:
      "Events from first idea to final guest — planning, design, production and the marketing that fills the room.",
    capabilities: [
      "Event Production",
      "Logistics & Coordination",
      "Event Design",
      "Social Hours",
      "Community Gatherings",
      "Event Marketing",
    ],
    href: "/services#experiences",
    image: "/media/work/photo-19.jpeg",
    imageAlt: "Guests together at a Jeevan Productions event in San Diego.",
  },
];

export const worldById = (id: string) => worlds.find((w) => w.id === id);
