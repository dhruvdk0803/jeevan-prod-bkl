import type { Project } from "./types";

/**
 * Editorial project set built entirely from the 26 verified photographs in
 * photo-catalog.ts. No client names, dates, locations, or outcomes are
 * attached unless the research file confirms them — which, for this catalog,
 * it does not. Titles describe the work itself, not a fabricated campaign.
 */
export const projects: Project[] = [
  {
    slug: "runway-night",
    title: "Runway Night",
    // client, year, location: omitted — no attribution verified for this shoot.
    world: "experiences",
    discipline: "Fashion Show & Event Photography",
    summary:
      "A runway walk, an empty front row, and the party that followed it — photographed as it happened, not staged for it.",
    cover: {
      src: "/media/work/photo-1.jpeg",
      width: 1080,
      height: 1350,
      alt: "A young boy in a black tuxedo with tails walks a runway past rows of empty chairs at a fashion show.",
    },
    gallery: [
      {
        src: "/media/work/photo-1.jpeg",
        width: 1080,
        height: 1350,
        alt: "A young boy in a black tuxedo with tails walks a runway past rows of empty chairs at a fashion show.",
      },
      {
        src: "/media/work/photo-12.jpeg",
        width: 1080,
        height: 1350,
        alt: "A smiling woman in a red off-shoulder dress and dangling earrings sits at a table with red and white flowers at an evening party.",
      },
      {
        src: "/media/work/photo-18.jpeg",
        width: 830,
        height: 1035,
        alt: "A smiling woman in a red tank top holds a drink can and cup while talking with another woman at an outdoor event with a banner behind them.",
      },
      {
        src: "/media/work/photo-15.jpeg",
        width: 780,
        height: 972,
        alt: "A woman in a bright pink dress stands beside a table with a sparkly pink birthday cake and stacked plates, decorated with a pink bow.",
      },
    ],
    layout: "full",
    featured: true,
  },
  {
    slug: "author-portraits",
    title: "Author Portraits",
    world: "stories",
    discipline: "Author Branding Portrait",
    summary:
      "Portraits built around a book, not a headshot list — the author holding her own words, and the room meeting them for the first time.",
    cover: {
      src: "/media/work/photo-2.jpeg",
      width: 980,
      height: 1224,
      alt: "A woman in a black top and leopard-print skirt smiles while holding up a paperback book titled Parenting with a Few F Words.",
    },
    gallery: [
      {
        src: "/media/work/photo-2.jpeg",
        width: 980,
        height: 1224,
        alt: "A woman in a black top and leopard-print skirt smiles while holding up a paperback book titled Parenting with a Few F Words.",
      },
      {
        src: "/media/work/photo-10.jpeg",
        width: 1080,
        height: 1350,
        alt: "Two women look together at an open copy of the book Parenting with a Few F Words in a room with rows of blue chairs.",
      },
      // Only two verified photographs exist for this set — no third image added to pad the gallery.
    ],
    layout: "duo",
    featured: false,
    caseStudy: {
      context:
        "A first-time author needed portraits that read as a person, not a press kit — images that could sit on a book jacket, a social feed, and a bookstore table without contradicting each other.",
      approach:
        "Jeevan Productions starts every branding shoot the same way it starts a campaign: by understanding who the person is and how they want to be remembered, then building the shot list around that, not the other way around. The session followed the book itself — its voice, its humor, its audience — into the room where readers were meeting it for the first time.",
      // outcome, quote: omitted — no verified results or attributed quote exist for this project.
    },
  },
  {
    slug: "under-stage-light",
    title: "Under Stage Light",
    world: "experiences",
    discipline: "Live Music & Nightlife Photography",
    summary:
      "Stage light, a crowd, and the small moments around the music — photographed in the room, at volume.",
    cover: {
      src: "/media/work/photo-22.jpeg",
      width: 830,
      height: 1035,
      alt: "A long-haired man sings into a microphone while playing an electric guitar on stage, lit by purple stage lighting.",
    },
    gallery: [
      {
        src: "/media/work/photo-22.jpeg",
        width: 830,
        height: 1035,
        alt: "A long-haired man sings into a microphone while playing an electric guitar on stage, lit by purple stage lighting.",
      },
      {
        src: "/media/work/photo-18.jpeg",
        width: 830,
        height: 1035,
        alt: "A smiling woman in a red tank top holds a drink can and cup while talking with another woman at an outdoor event with a banner behind them.",
      },
      {
        src: "/media/work/photo-12.jpeg",
        width: 1080,
        height: 1350,
        alt: "A smiling woman in a red off-shoulder dress and dangling earrings sits at a table with red and white flowers at an evening party.",
      },
    ],
    layout: "offset",
    featured: true,
  },
  {
    slug: "the-vows",
    title: "The Vows",
    world: "stories",
    discipline: "Wedding Photography",
    summary:
      "Rings, an arch, and the people standing under it — the quiet detail shots and the loud group ones, from the same day.",
    cover: {
      src: "/media/work/photo-8.jpeg",
      width: 1080,
      height: 1350,
      alt: "Close-up of two clasped hands with a diamond wedding ring set and a black wedding band, resting on white roses and eucalyptus.",
    },
    gallery: [
      {
        src: "/media/work/photo-8.jpeg",
        width: 1080,
        height: 1350,
        alt: "Close-up of two clasped hands with a diamond wedding ring set and a black wedding band, resting on white roses and eucalyptus.",
      },
      {
        src: "/media/work/photo-16.jpeg",
        width: 930,
        height: 1161,
        alt: "An officiant in black robes speaks with a bride and groom holding a floral bouquet under a white and greenery wedding arch.",
      },
      {
        src: "/media/work/photo-19.jpeg",
        width: 930,
        height: 1161,
        alt: "Six people in formal attire pose together and smile in front of a white floral wedding arch outdoors.",
      },
    ],
    layout: "portrait",
    featured: true,
  },
  {
    slug: "center-stage",
    title: "Center Stage",
    world: "experiences",
    discipline: "Conference & Speaker Photography",
    summary:
      "Keynotes, seminars, and the rooms that lean in for them — coverage built to show what was actually said and who was listening.",
    cover: {
      src: "/media/work/photo-6.jpeg",
      width: 1080,
      height: 1350,
      alt: "A man holds a microphone and speaks on stage in front of a large red banner reading 'is using the right formula', with seated attendees in the foreground.",
    },
    gallery: [
      {
        src: "/media/work/photo-6.jpeg",
        width: 1080,
        height: 1350,
        alt: "A man holds a microphone and speaks on stage in front of a large red banner reading 'is using the right formula', with seated attendees in the foreground.",
      },
      {
        src: "/media/work/photo-4.jpeg",
        width: 1080,
        height: 1350,
        alt: "A man in a blazer gestures with open arms while addressing a seated audience in a conference room, a projection screen behind him.",
      },
      {
        src: "/media/work/photo-3.jpeg",
        width: 1080,
        height: 1350,
        alt: "A smiling man in glasses and a lanyard sits at a conference table with a phone, flanked by tumblers printed with a crossed-wrench shield logo.",
      },
      {
        src: "/media/work/photo-17.jpeg",
        width: 780,
        height: 972,
        alt: "A man in a blazer speaks and gestures to a seated group in a room with a 'Small Business' poster on the wall.",
      },
      {
        src: "/media/work/photo-25.jpeg",
        width: 930,
        height: 1161,
        alt: "A woman in a black top and leopard-print skirt speaks and gestures to a seated audience in a room with a religious statue in the corner.",
      },
    ],
    layout: "full",
    featured: false,
    caseStudy: {
      context:
        "Conferences and seminars live or die on whether the room remembers what was said. The brief across these events was coverage that captured the message, not just the microphone.",
      approach:
        "Every event Jeevan Productions shoots starts with the same question asked of any brand: what do you stand for, and how do you want this moment remembered? On the day, that means working the room as closely as the stage — audience reactions, branded details, side conversations — so the story doesn't end when the speaker sits down.",
      // outcome, quote: omitted — no verified results or attributed quote exist for these events.
    },
  },
  {
    slug: "still-water",
    title: "Still Water",
    world: "stories",
    discipline: "Lifestyle & Wellness Photography",
    summary:
      "A dock, a lake, and two people finding their own kind of quiet — meditation and movement, shot outdoors and unhurried.",
    cover: {
      src: "/media/work/photo-13.jpeg",
      width: 1030,
      height: 1287,
      alt: "A bearded man kneels in a meditation pose with eyes closed on a wooden dock beside a lake at sunset.",
    },
    gallery: [
      {
        src: "/media/work/photo-13.jpeg",
        width: 1030,
        height: 1287,
        alt: "A bearded man kneels in a meditation pose with eyes closed on a wooden dock beside a lake at sunset.",
      },
      {
        src: "/media/work/photo-14.jpeg",
        width: 880,
        height: 1098,
        alt: "A man in athletic wear balances in a yoga tree pose with hands pressed together on a dock overlooking a lake and autumn trees.",
      },
      // Only two verified photographs exist for this set — no third image added to pad the gallery.
    ],
    layout: "duo",
    featured: false,
  },
  {
    slug: "open-for-business",
    title: "Open For Business",
    world: "brands",
    discipline: "Venue & Ribbon-Cutting Photography",
    summary:
      "A venue at dusk and a ribbon cut in daylight — two ways a business announces itself is open.",
    cover: {
      src: "/media/work/photo-9.jpeg",
      width: 930,
      height: 1161,
      alt: "Exterior of the Depot #9 Saloon & Stage, a brick building with a lit sign, photographed at dusk under a colorful sky.",
    },
    gallery: [
      {
        src: "/media/work/photo-9.jpeg",
        width: 930,
        height: 1161,
        alt: "Exterior of the Depot #9 Saloon & Stage, a brick building with a lit sign, photographed at dusk under a colorful sky.",
      },
      {
        src: "/media/work/photo-7.jpeg",
        width: 980,
        height: 1224,
        alt: "A group of people cut a ribbon together in front of a colorful sunrise 'Bright' logo mural, one woman wearing a pageant sash and tiara.",
      },
      // Only two verified photographs exist for this set — no third image added to pad the gallery.
    ],
    layout: "offset",
    featured: false,
  },
  {
    slug: "in-celebration",
    title: "In Celebration",
    world: "experiences",
    discipline: "Cultural Event Photography",
    summary:
      "Traditional dress, bare winter branches, and a group posed for a moment worth keeping.",
    cover: {
      src: "/media/work/photo-24.jpeg",
      width: 580,
      height: 720,
      alt: "Five women in traditional red and white Indian sarees and one in an orange dance costume pose together outdoors under bare tree branches.",
    },
    gallery: [
      {
        src: "/media/work/photo-24.jpeg",
        width: 580,
        height: 720,
        alt: "Five women in traditional red and white Indian sarees and one in an orange dance costume pose together outdoors under bare tree branches.",
      },
      // Only one verified photograph exists for this set — no additional images added to pad the gallery.
    ],
    layout: "portrait",
    featured: false,
  },
  {
    slug: "the-portrait-sessions",
    title: "The Portrait Sessions",
    world: "stories",
    discipline: "Corporate & Personal Portrait Photography",
    summary:
      "Headshots and close-ups that don't look like either — office light, real posture, people who look like themselves.",
    cover: {
      src: "/media/work/photo-5.jpeg",
      width: 930,
      height: 1161,
      alt: "A smiling man with long hair, stubble, and full sleeve tattoos leans forward with clasped hands, seated by a bright window.",
    },
    gallery: [
      {
        src: "/media/work/photo-5.jpeg",
        width: 930,
        height: 1161,
        alt: "A smiling man with long hair, stubble, and full sleeve tattoos leans forward with clasped hands, seated by a bright window.",
      },
      {
        src: "/media/work/photo-11.jpeg",
        width: 1080,
        height: 1350,
        alt: "A smiling man in glasses and a light blue dress shirt sits with clasped hands at a white table in front of an office window.",
      },
      {
        src: "/media/work/photo-20.jpeg",
        width: 1080,
        height: 1350,
        alt: "A woman in a pink blazer sits with legs crossed on a gray office couch, smiling toward the camera.",
      },
      {
        src: "/media/work/photo-23.jpeg",
        width: 930,
        height: 1161,
        alt: "A smiling man and woman, both with visible tattoos, embrace closely for a joyful close-up portrait.",
      },
    ],
    layout: "duo",
    featured: false,
  },
  {
    slug: "together",
    title: "Together",
    world: "stories",
    discipline: "Family Portrait Photography",
    summary:
      "Grass, tree shade, and families arranged the way they actually sit together — not lined up for it.",
    cover: {
      src: "/media/work/photo-21.jpeg",
      width: 730,
      height: 909,
      alt: "A family of five, two parents and three young children, sit together on grass under a large tree, smiling at the camera.",
    },
    gallery: [
      {
        src: "/media/work/photo-21.jpeg",
        width: 730,
        height: 909,
        alt: "A family of five, two parents and three young children, sit together on grass under a large tree, smiling at the camera.",
      },
      {
        src: "/media/work/photo-26.jpeg",
        width: 930,
        height: 1161,
        alt: "A family of four and a dog lie together on grass, feet toward the camera, smiling as they lean on each other.",
      },
      // Only two verified photographs exist for this set — no third image added to pad the gallery.
    ],
    layout: "full",
    featured: true,
  },
];

/* ---- Query helpers -------------------------------------------------- */

export const featuredProjects = projects.filter((p) => p.featured);

/** Only these get a detail route — everything else has no dead link. */
export const caseStudyProjects = projects.filter((p) => p.caseStudy);

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const projectsByWorld = (world: Project["world"]) =>
  projects.filter((p) => p.world === world);

/**
 * The next project that actually has a detail page, wrapping at the end.
 *
 * Cycles `caseStudyProjects` rather than all projects: the "next project"
 * band is a navigation promise, and pointing it at a project with no route
 * would produce a 404. Returns undefined when there is nothing else to go
 * to, so the caller can omit the band entirely.
 */
export const nextProject = (slug: string) => {
  const i = caseStudyProjects.findIndex((p) => p.slug === slug);
  if (i === -1 || caseStudyProjects.length < 2) return undefined;
  return caseStudyProjects[(i + 1) % caseStudyProjects.length];
};

/** Same-world projects, excluding the current one. */
export const relatedProjects = (slug: string, limit = 2) => {
  const current = projectBySlug(slug);
  if (!current) return [];
  const sameWorld = projects.filter((p) => p.world === current.world && p.slug !== slug);
  const rest = projects.filter((p) => p.world !== current.world && p.slug !== slug);
  return [...sameWorld, ...rest].slice(0, limit);
};
