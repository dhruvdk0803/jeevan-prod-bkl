import type { Service } from "./types";

/**
 * The three core service families are rewritten from the verbatim
 * descriptions in the research file (`#services` section, "Built for Brands
 * That Think Different"). Every capability they list is preserved —
 * only the voice changes. These three carry `verified: true` because they
 * are live on jeevanproductions.com today.
 *
 * The "Executive Assistant Support" and "Staffing" boxes referenced in the
 * research file exist only in commented-out HTML on the live site and are
 * NOT included here — see NEEDS-FROM-CLIENT.md.
 */
export const services: Service[] = [
  {
    id: "media",
    world: "stories",
    name: "Media",
    description:
      "Photography and videography that carry your brand's story, its services and its personality — made to hold up online and offline, long after the scroll.",
    includes: ["Photography", "Videography", "Brand Content"],
    verified: true,
  },
  {
    id: "marketing",
    world: "brands",
    name: "Marketing",
    description:
      "Social media, ads, email, direct mail, graphic design, event marketing and consulting — built to boost visibility, drive engagement, and grow a brand with confidence.",
    includes: [
      "Social Media",
      "Ads",
      "Email",
      "Direct Mail",
      "Graphic Design",
      "Event Marketing",
      "Consulting",
    ],
    verified: true,
  },
  {
    id: "events",
    world: "experiences",
    name: "Events",
    description:
      "From planning to production, event experiences covering logistics, coordination, design and execution — built for meaningful connections and moments people remember.",
    includes: ["Logistics", "Coordination", "Design", "Execution", "Event Marketing"],
    verified: true,
  },
];

/**
 * A 4-step approach derived directly from JP's stated process in the "Our
 * Story" copy: "Every campaign, design, and event begins with understanding
 * who you are, what you stand for, and how you want to be remembered." No
 * proprietary methodology name is invented — this is a plain description of
 * that same idea in four steps.
 */
export const process: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Understand",
    body: "We start with who you are, what you stand for, and how you want to be remembered — before any camera, campaign, or floor plan.",
  },
  {
    step: "02",
    title: "Define",
    body: "Branding that defines you clearly, so every piece of work that follows starts from the same idea of who you are.",
  },
  {
    step: "03",
    title: "Connect",
    body: "Marketing and content that connect that idea to the people you want to reach, and events that bring them into the room.",
  },
  {
    step: "04",
    title: "Remember",
    body: "Everything we make follows one idea: make it matter. Your brand isn't just promoted — it's elevated, experienced, and remembered.",
  },
];
