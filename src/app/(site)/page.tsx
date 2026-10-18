import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ThreeWorlds } from "@/components/home/ThreeWorlds";
import { LatestPosts } from "@/components/home/LatestPosts";
import { AnimatedHeading, Label } from "@/components/primitives/Type";
import { MediaReveal } from "@/components/primitives/Media";
import { ArrowLink, Button } from "@/components/primitives/Actions";
import { ProjectRhythm } from "@/components/primitives/ProjectCard";
import { BrandMarquee } from "@/components/primitives/BrandMarquee";
import { featuredProjects } from "@/content/projects";
import { sitePhotos } from "@/content/site-photos";
import { site } from "@/content/site";
import { websiteSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/",
    title: "Jeevan Productions — Media, Marketing & Events in San Diego",
    description:
      "Jeevan Productions is a creative company in San Diego. We tell stories through media, build brands through marketing, and bring people together through events.",
  });
}

export default function HomePage() {
  const introPhoto = sitePhotos.acaGathering;
  const impactPhoto = sitePhotos.celebrationGroup;

  return (
    <>
      <Hero />

      {/* ---------- UNDERSTANDING: the quiet turn after the cinema ---------- */}
      <section className="bg-paper" aria-labelledby="intro-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,13vw,11rem)]">
          <div className="grid gap-x-[clamp(2rem,6vw,7rem)] gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Label>More than a production company</Label>
              <MediaReveal
                src={introPhoto.src}
                alt={introPhoto.alt}
                ratio="4/5"
                sizes="(max-width: 1024px) 100vw, 30vw"
                quality={82}
                className="mt-8 max-w-[26rem]"
              />
            </div>
            <div className="lg:col-span-8">
              <AnimatedHeading
                id="intro-heading"
                size="statement"
                lines={[
                  "We bring media, marketing",
                  "and experiences together —",
                  "so a story, a brand and a room",
                  "all say the same thing.",
                ]}
              />
              <p
                className="t-lead text-ink-3 mt-10 max-w-[54ch]"
                data-reveal="fade-up"
                data-reveal-delay={0.12}
              >
                Founded by strategist {site.founder}, Jeevan Productions helps organizations
                tell better stories, build stronger brands, and create the kind of moments
                people actually remember. We don&rsquo;t just market. We make things matter.
              </p>
              <div className="mt-9" data-reveal="fade-up" data-reveal-delay={0.2}>
                <ArrowLink href="/about">Our story</ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- The three worlds ---------- */}
      <ThreeWorlds />

      {/* ---------- PROOF: selected work ---------- */}
      <section className="bg-paper-warm" aria-labelledby="work-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div className="mb-[clamp(3rem,7vw,5.5rem)] flex flex-wrap items-end justify-between gap-8">
            <AnimatedHeading id="work-heading" size="statement" lines={["Selected work"]} />
            <div data-reveal="fade-up">
              <ArrowLink href="/work">View the full archive</ArrowLink>
            </div>
          </div>

          <ProjectRhythm
            projects={featuredProjects}
            covers={{ together: sitePhotos.togetherHome }}
          />
        </div>
      </section>

      {/* ---- Proof, continued: who we've worked with ---- */}
      <BrandMarquee />


      {/* ---------- VALUES: impact teaser ---------- */}
      <section
        className="on-dark bg-ink text-paper"
        data-theme-dark
        aria-labelledby="impact-heading"
      >
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div className="grid items-center gap-x-[clamp(2rem,6vw,6rem)] gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <MediaReveal
                src={impactPhoto.src}
                alt={impactPhoto.alt}
                ratio="4/5"
                sizes="(max-width: 1024px) 100vw, 40vw"
                quality={82}
                parallax={0.08}
              />
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <p className="t-label text-ember-light mb-7">Beyond business</p>
              <AnimatedHeading
                id="impact-heading"
                size="statement"
                lines={["Business should leave", "a community better", "than it found it."]}
              />
              <p
                className="t-lead mt-9 max-w-[46ch] text-paper/70"
                data-reveal="fade-up"
                data-reveal-delay={0.12}
              >
                This part isn&rsquo;t about us. It&rsquo;s about the people, organizations and
                communities we&rsquo;re grateful to meet along the way.
              </p>
              <div className="mt-10" data-reveal="fade-up" data-reveal-delay={0.2}>
                <Button href="/impact" variant="ghost">
                  Explore our impact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A "Know what you need?" service teaser used to sit here. It was the
          third link to the same three services (after the hero's world index
          and the Three Worlds section), so it was cut rather than repeated —
          the footer carries the closing call to action. */}

      {/* ---------- From the blog — renders nothing with no posts ---------- */}
      <LatestPosts />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
    </>
  );
}
