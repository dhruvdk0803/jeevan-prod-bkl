import type { Metadata } from "next";
import { careersIntro, openings, roleOptions } from "@/content/careers";
import { site, worlds } from "@/content/site";
import { photoCatalog } from "@/content/photo-catalog";
import { SectionIntro, Label, AnimatedHeading } from "@/components/primitives/Type";
import { CinematicBand } from "@/components/primitives/Media";
import { OpeningCard } from "@/components/careers/OpeningCard";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { breadcrumbSchema, jobPostingSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/careers",
    title: "Careers",
    description:
      "Join Jeevan Productions — a San Diego creative company working across media, marketing and events. See open roles or send a general application.",
  });
}

// A heroWorthy, energetic frame — no client depicted as JP staff, just real
// JP photography that carries the "proud of your work" idea.
const heroImage = photoCatalog.find((p) => p.src === "/media/work/photo-6.jpeg")!;

export default function CareersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Careers", href: "/careers" },
          ]),
        )}
      />
      {openings.map((opening) => (
        <script
          key={opening.slug}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(
            jobPostingSchema({
              title: opening.title,
              description: opening.summary,
              datePosted: opening.datePosted,
              employmentType: opening.type,
              location: opening.location,
            }),
          )}
        />
      ))}

      {/* Hero */}
      <CinematicBand
        src={heroImage.src}
        alt={heroImage.alt}
        overlay="bottom"
        priority
        className="min-h-[80svh] md:min-h-[90svh]"
      >
        <div className="gutter mx-auto w-full max-w-[110rem] pb-[clamp(3rem,7vw,6rem)]">
          <Label className="mb-6 text-paper/70">Careers</Label>
          <AnimatedHeading
            as="h1"
            size="hero"
            lines={["Do work you're proud", "to put your name on."]}
          />
        </div>
      </CinematicBand>

      {/* Approved copy, verbatim, as a typographic statement */}
      <section className="bg-paper-warm" aria-labelledby="intro-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <h2 id="intro-heading" className="sr-only">
            Why join Jeevan Productions
          </h2>
          <div className="mx-auto max-w-[42rem] space-y-8">
            {careersIntro.map((line, i) => (
              <p
                key={i}
                className={i === 0 ? "t-h2" : "t-lead text-ink-3"}
                data-reveal="fade-up"
                data-reveal-delay={i * 0.1}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* What it's like to work here — honest, derived only from real JP facts */}
      <section className="bg-paper" aria-labelledby="work-here-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <SectionIntro
                id="work-here-heading"
                eyebrow="What it's like here"
                lines={["Three disciplines,", "one small studio."]}
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="t-body max-w-[58ch] text-ink-3">
                Jeevan Productions works across three worlds — {worlds.map((w) => w.discipline.toLowerCase()).join(", ")} — under one roof in {site.city}, {site.regionName}, founded in {site.founded}. Every project moves between these disciplines, so the people who work here tend to be comfortable moving with it: a photographer who understands brand strategy, an editor who thinks about the event the footage came from.
              </p>
              <ul className="mt-10 space-y-6">
                {worlds.map((w) => (
                  <li key={w.id} className="rule pt-6">
                    <p className="t-label text-neutral">{w.index} — {w.title}</p>
                    <p className="t-body mt-2 text-ink-3">{w.idea}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="bg-paper-warm" aria-labelledby="roles-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <SectionIntro
            id="roles-heading"
            eyebrow="Open roles"
            lines={["Where we need", "people right now."]}
          />

          <div className="mt-16">
            {openings.length > 0 ? (
              <div className="rule border-t-0">
                {openings.map((opening) => (
                  <OpeningCard key={opening.slug} opening={opening} />
                ))}
              </div>
            ) : (
              <div className="rule flex flex-col items-start gap-4 border-t-0 bg-paper px-8 py-14 sm:px-16">
                <p className="t-label text-ember">No specific openings right now</p>
                <p className="t-lead max-w-[52ch] text-ink-3">
                  We don&rsquo;t have a listed role open at the moment — but we&rsquo;re always glad to hear
                  from people whose craft would be a fit. Send a general application below and
                  we&rsquo;ll keep it on file.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Application form — the conversion point of the page */}
      <section id="apply" className="bg-paper" aria-labelledby="apply-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <SectionIntro
                id="apply-heading"
                eyebrow="Apply"
                lines={["Tell us about", "your craft."]}
              >
                Areas we hear from most: {roleOptions.slice(0, 4).join(", ")}, and more — the
                form covers the full list.
              </SectionIntro>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ApplicationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Quiet closing statement — no CTASection, the form above is the conversion point */}
      <section className="bg-paper-warm" aria-labelledby="closing-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,9vw,7rem)] text-center">
          <h2 id="closing-heading" className="t-statement mx-auto max-w-[22ch]" data-reveal="mask">
            <span className="line-mask">
              <span>{site.closingStatement}</span>
            </span>
          </h2>
        </div>
      </section>
    </>
  );
}
