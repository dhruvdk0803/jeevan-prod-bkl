import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { SectionIntro } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { WorkArchive } from "@/components/work/WorkArchive";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Photography and event coverage from Jeevan Productions across media, marketing and events — San Diego and Los Angeles.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: `Work — ${site.name}`,
    description:
      "Photography and event coverage from Jeevan Productions across media, marketing and events — San Diego and Los Angeles.",
    url: "/work",
    type: "website",
  },
};

export default function WorkPage() {
  const trail = breadcrumbSchema([
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(trail)} />

      <section className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(4rem,10vw,7rem)]">
        <SectionIntro
          eyebrow="Selected work"
          as="h1"
          size="hero"
          lines={["The work,", "as it happened."]}
        >
          Photography and coverage across media, marketing and events — shot
          in the room, not staged for it. {projects.length} projects, sorted
          by discipline below.
        </SectionIntro>
      </section>

      <section
        className="gutter mx-auto max-w-[110rem] pb-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="work-archive-heading"
      >
        <h2 id="work-archive-heading" className="sr-only">
          All projects
        </h2>
        <WorkArchive projects={projects} />
      </section>

      <CTASection
        eyebrow="Start a project"
        lines={["Have something", "worth remembering?"]}
        body={site.closingStatement}
      />
    </>
  );
}
