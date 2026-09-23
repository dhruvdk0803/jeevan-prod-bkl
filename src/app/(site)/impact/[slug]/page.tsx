import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedHeading, Label, SectionIntro } from "@/components/primitives/Type";
import { CinematicBand, MediaReveal } from "@/components/primitives/Media";
import { CTASection } from "@/components/primitives/Actions";
import { StoryGrid } from "@/components/impact/StoryCard";
import { publishedImpactStories } from "@/content/impact";
import type { ImpactStory } from "@/content/types";
import { articleSchema, breadcrumbSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

const categoryLabels: Record<ImpactStory["category"], string> = {
  nonprofit: "Nonprofit",
  "small-business": "Small Business",
  community: "Community",
  volunteer: "Volunteer",
  arts: "Arts",
};

type Props = { params: Promise<{ slug: string }> };

function findStory(slug: string) {
  return publishedImpactStories.find((s) => s.slug === slug);
}

/**
 * Currently empty (no published stories) — returning `[]` is correct here:
 * this route isn't using Cache Components, so an empty static-params array
 * simply means no pages are pre-built yet, not a build error. The moment a
 * story is published in `src/content/impact.ts`, this generates its page.
 */
export async function generateStaticParams() {
  return publishedImpactStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) return {};

  return buildMetadata({
    path: `/impact/${story.slug}`,
    title: story.title,
    description: story.excerpt,
    ogType: "article",
    ...(story.cover ? { images: [{ url: story.cover.src }] } : {}),
  });
}

export default async function ImpactStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) notFound();

  const related = publishedImpactStories.filter((s) => s.slug !== story.slug).slice(0, 3);
  const meta = [story.organisation, story.date].filter(Boolean).join(" · ");

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          articleSchema({
            title: story.title,
            description: story.excerpt,
            slug: `/impact/${story.slug}`,
            image: story.cover?.src,
            datePublished: story.date,
          }),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Impact", href: "/impact" },
            { name: story.title, href: `/impact/${story.slug}` },
          ]),
        )}
      />

      {story.cover ? (
        <CinematicBand src={story.cover.src} alt={story.cover.alt} overlay="strong" priority>
          <div className="gutter relative mx-auto w-full max-w-[110rem] pb-[clamp(3rem,7vw,5rem)]">
            <Label className="text-paper/70 mb-6">{categoryLabels[story.category]}</Label>
            <AnimatedHeading as="h1" size="hero" lines={[story.title]} />
            {meta ? <p className="t-label text-paper/70 mt-6">{meta}</p> : null}
          </div>
        </CinematicBand>
      ) : (
        <header className="bg-paper-warm">
          <div className="gutter mx-auto max-w-[110rem] py-[clamp(6rem,14vw,10rem)]">
            <Label className="mb-6">{categoryLabels[story.category]}</Label>
            <AnimatedHeading as="h1" size="hero" lines={[story.title]} />
            {meta ? <p className="t-label text-neutral mt-6">{meta}</p> : null}
          </div>
        </header>
      )}

      <section className="bg-paper">
        <div className="gutter mx-auto max-w-[70rem] space-y-6 py-[clamp(4rem,10vw,7rem)]">
          {story.body.map((paragraph, i) => (
            <p key={i} className="t-body text-ink-3" data-reveal="fade-up">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {story.quote ? (
        <section className="bg-sand" aria-label="Quote">
          <div className="gutter mx-auto max-w-[70rem] py-[clamp(4rem,10vw,7rem)]">
            <blockquote className="t-statement font-display" data-reveal="fade-up">
              &ldquo;{story.quote.text}&rdquo;
            </blockquote>
            <p className="t-label text-neutral mt-6">— {story.quote.attribution}</p>
          </div>
        </section>
      ) : null}

      {story.gallery && story.gallery.length > 0 ? (
        <section className="bg-paper-warm" aria-label="Gallery">
          <div className="gutter mx-auto grid max-w-[110rem] gap-6 py-[clamp(4rem,10vw,7rem)] sm:grid-cols-2 lg:grid-cols-3">
            {story.gallery.map((image, i) => (
              <MediaReveal
                key={i}
                src={image.src}
                alt={image.alt}
                ratio="4/5"
                sizes="(max-width: 768px) 100vw, 30vw"
                quality={82}
              />
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="bg-paper" aria-labelledby="related-heading">
          <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
            <SectionIntro eyebrow="More stories" lines={["Related stories"]} id="related-heading" />
            <div className="mt-14">
              <StoryGrid stories={related} />
            </div>
          </div>
        </section>
      ) : null}

      <CTASection
        eyebrow="Get involved"
        lines={["Know a story", "worth telling?"]}
        body="If you're an organization, small business, or community group we've worked with, we'd love to hear from you."
        href="/contact"
        label="Get in touch"
      />
    </article>
  );
}
