import type { Metadata } from "next";
import { AnimatedHeading, Label, SectionIntro } from "@/components/primitives/Type";
import { CinematicBand } from "@/components/primitives/Media";
import { ArrowLink, CTASection } from "@/components/primitives/Actions";
import { StoryGrid } from "@/components/impact/StoryCard";
import { Metrics } from "@/components/impact/Metrics";
import {
  publishedImpactStories,
  spotlights,
  impactMetrics,
  jpGives,
  impactPhilosophy,
} from "@/content/impact";
import { photoCatalog } from "@/content/photo-catalog";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/impact",
    title: "Impact",
    description:
      "The people, organizations, and communities Jeevan Productions is grateful to meet along the way — community stories, a monthly spotlight, and JP Gives.",
  });
}

const photo = (src: string) => {
  const p = photoCatalog.find((entry) => entry.src === src);
  if (!p) throw new Error(`Missing photo-catalog entry: ${src}`);
  return p;
};

// Real, verified JP work photography — every one tagged world: "experiences".
const heroPhoto = photo("/media/work/photo-7.jpeg"); // ribbon-cutting / grand opening
const rhythmPhoto = photo("/media/work/photo-17.jpeg"); // small-business seminar

const spotlightCategories = [
  { name: "Nonprofit", blurb: "Organizations doing the unglamorous, necessary work." },
  { name: "Small Business", blurb: "Independent owners building something of their own." },
  { name: "Community Leader", blurb: "People who show up for a neighborhood, again and again." },
  { name: "Artist", blurb: "Makers whose work gives a place its character." },
  { name: "Volunteer", blurb: "The people who give their time first, without being asked." },
] as const;

export default function ImpactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Impact", href: "/impact" },
          ]),
        )}
      />

      {/* Hero — cinematic, over real photography. */}
      <CinematicBand src={heroPhoto.src} alt={heroPhoto.alt} overlay="strong" priority parallax={0.12}>
        <div className="gutter relative mx-auto w-full max-w-[110rem] pb-[clamp(3rem,7vw,5rem)]">
          <Label className="text-paper/70 mb-6">Impact</Label>
          <AnimatedHeading
            as="h1"
            size="hero"
            id="impact-hero-heading"
            lines={["Business should leave a", "community better than it found it."]}
          />
        </div>
      </CinematicBand>

      {/* Supporting statement — quiet, typographic. */}
      <section className="bg-paper">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]">
          <p className="t-lead max-w-[58ch]" data-reveal="fade-up">
            This page isn&rsquo;t about us. It&rsquo;s about the incredible people,
            organizations, and communities we&rsquo;re grateful to meet along the way.
            We&rsquo;re simply honored to be a small part of their story.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-paper-warm" aria-labelledby="philosophy-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <SectionIntro
            eyebrow="Philosophy"
            lines={["Not a scoreboard.", "A belief."]}
            id="philosophy-heading"
          />
          <div className="mt-14 grid gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-10 md:grid-cols-3">
            {impactPhilosophy.map((paragraph, i) => (
              <p
                key={i}
                className="t-body text-ink-3"
                data-reveal="fade-up"
                data-reveal-delay={i * 0.1}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Rhythm break */}
      <CinematicBand src={rhythmPhoto.src} alt={rhythmPhoto.alt} overlay="soft" />

      {/* Community Stories */}
      <section className="bg-paper" aria-labelledby="stories-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <SectionIntro
            eyebrow="Community Stories"
            lines={["Real stories,", "shared with permission."]}
            id="stories-heading"
          >
            The organizations, small businesses, and people JP has worked alongside —
            told here as soon as each story is ready to be shared publicly.
          </SectionIntro>

          {publishedImpactStories.length > 0 ? (
            <div className="mt-16">
              <StoryGrid stories={publishedImpactStories} />
            </div>
          ) : (
            <div
              className="rule mt-16 grid gap-x-[clamp(1.5rem,4vw,4rem)] pt-16 md:grid-cols-12"
              data-reveal="fade-up"
            >
              <div className="md:col-span-7">
                <p className="t-h3 font-display max-w-[22ch]">
                  This section is waiting for its first story.
                </p>
                <p className="t-body text-ink-3 mt-6 max-w-[52ch]">
                  We haven&rsquo;t published a community story yet — not because there&rsquo;s
                  nothing to say, but because we&rsquo;d rather wait for a real one, told with
                  the organization&rsquo;s permission, than publish something thin to fill the
                  space.
                </p>
                <p className="t-body text-ink-3 mt-4 max-w-[52ch]">
                  If you&rsquo;re a nonprofit, small business, or community group we&rsquo;ve
                  worked alongside and would like your story told here, we&rsquo;d love to
                  hear from you.
                </p>
                <div className="mt-10">
                  <ArrowLink href="/contact">Get in touch</ArrowLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Spotlight */}
      <section className="bg-sand" aria-labelledby="spotlight-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <SectionIntro
            eyebrow="Monthly Spotlight"
            lines={["A recurring spotlight,", "coming soon."]}
            id="spotlight-heading"
          >
            Each month, we plan to spotlight one nonprofit, one small business, one
            community leader, one artist, and one volunteer doing work worth noticing.
          </SectionIntro>

          <ul
            className="mt-16 grid gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-12 sm:grid-cols-2 lg:grid-cols-5"
            data-reveal="fade-up"
            data-reveal-stagger
          >
            {spotlightCategories.map((category) => (
              <li key={category.name} className="rule pt-8">
                <p className="t-label text-ember mb-3">{category.name}</p>
                <p className="t-body text-ink-3">{category.blurb}</p>
              </li>
            ))}
          </ul>

          {spotlights.every((s) => s.status !== "published") ? (
            <p className="t-label text-neutral mt-16">
              No spotlight has been published yet — check back soon.
            </p>
          ) : null}
        </div>
      </section>

      {/* JP Gives — the most distinctive idea on the page. */}
      <section className="on-dark bg-ink text-paper" data-theme-dark aria-labelledby="jp-gives-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(6rem,14vw,12rem)]">
          <Label className="text-ember-light mb-8">Coming soon — not yet launched</Label>
          <AnimatedHeading as="h2" size="statement" id="jp-gives-heading" lines={[jpGives.title]} />
          <p className="t-lead text-paper/70 mt-6 max-w-[36ch]" data-reveal="fade-up">
            {jpGives.tagline}
          </p>

          <div className="mt-14 grid gap-x-[clamp(1.5rem,4vw,5rem)] gap-y-12 md:grid-cols-2">
            <div className="space-y-6" data-reveal="fade-up" data-reveal-delay={0.1}>
              {jpGives.body.map((paragraph, i) => (
                <p key={i} className="t-body text-paper/70">
                  {paragraph}
                </p>
              ))}
            </div>
            <ul
              className="space-y-6 border-l border-paper/15 pl-8"
              data-reveal="fade-up"
              data-reveal-delay={0.2}
            >
              {jpGives.offerings.map((offering) => (
                <li key={offering} className="t-body text-paper/85">
                  {offering}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Annual Impact metrics — renders nothing until a real number exists. */}
      <Metrics metrics={impactMetrics} />

      <CTASection
        eyebrow="Get involved"
        lines={["Know a story", "worth telling?"]}
        body="If you're an organization, small business, or community group we've worked with, we'd love to hear from you."
        href="/contact"
        label="Get in touch"
      />
    </>
  );
}
