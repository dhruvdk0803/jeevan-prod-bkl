import type { Metadata } from "next";
import { publishedTeam } from "@/content/team";
import { impactPhilosophy } from "@/content/impact";
import { AnimatedHeading, IndexLabel, Label, SectionIntro } from "@/components/primitives/Type";
import { MediaReveal, CinematicBand } from "@/components/primitives/Media";
import { ArrowLink } from "@/components/primitives/Actions";
import { BrandMarquee } from "@/components/primitives/BrandMarquee";
import { WorldStrip } from "@/components/about/WorldStrip";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { sitePhotos } from "@/content/site-photos";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/about",
    title: "About",
    description:
      "Jeevan Productions is a San Diego creative company founded by strategist Jeevan Dhaker. Media, marketing and events built around one idea: make it matter.",
  });
}

const founder = publishedTeam.find((m) => m.slug === "jeevan-dhaker");

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ]),
        )}
      />

      {/* ---- 1. Hero ------------------------------------------------- */}
      <section
        className="bg-paper-warm pt-[calc(var(--nav-h)+2.5rem)] pb-[clamp(4rem,9vw,7rem)]"
        aria-labelledby="about-hero-heading"
      >
        <div className="gutter mx-auto grid max-w-[110rem] items-center gap-x-10 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Label className="mb-6">About Jeevan Productions</Label>
            <AnimatedHeading
              as="h1"
              size="hero"
              id="about-hero-heading"
              lines={["Creative work begins", "with human connection."]}
            />
            <p className="t-lead text-ink-3 mt-7 max-w-[46ch]" data-reveal="fade-up" data-reveal-delay={0.15}>
              A creative company in San Diego, working across media, marketing
              and events: telling stories, building brands and bringing people
              together.
            </p>
          </div>
          <div className="md:col-span-5">
            <MediaReveal
              src={sitePhotos.jpLogo.src}
              alt={sitePhotos.jpLogo.alt}
              ratio="1/1"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
              quality={82}
            />
          </div>
        </div>
      </section>

      {/* ---- 2. The JP story ------------------------------------------ */}
      <section
        className="bg-paper py-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="story-heading"
      >
        <div className="gutter mx-auto grid max-w-[110rem] gap-x-14 gap-y-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <MediaReveal
              src={sitePhotos.ourStory.src}
              alt={sitePhotos.ourStory.alt}
              ratio="4/5"
              sizes="(max-width: 768px) 100vw, 35vw"
              quality={82}
            />
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <SectionIntro
              id="story-heading"
              eyebrow="Our story"
              lines={["Built on the belief that", "every brand deserves one."]}
            />
            <div className="t-body text-ink-3 mt-8 grid gap-6 sm:grid-cols-2 sm:gap-x-10">
              <p>
                Jeevan Productions was founded by strategist Jeevan Dhaker on
                the belief that every brand has a story worth telling, with
                clarity, creativity and purpose. The agency brings together
                over five decades of collective experience in strategy,
                storytelling and execution.
              </p>
              <p>
                We do not just market; we create meaning. Every campaign,
                design and event begins with understanding who you are, what
                you stand for, and how you want to be remembered. Then we
                turn that understanding into branding that defines,
                marketing that connects, and events that move people. Your
                brand isn&rsquo;t just promoted. It&rsquo;s elevated,
                experienced and remembered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 3. Philosophy --------------------------------------------- */}
      <section
        className="bg-sand py-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="philosophy-heading"
      >
        <div className="gutter mx-auto max-w-[110rem]">
          <Label className="mb-6">What we believe</Label>
          <AnimatedHeading
            id="philosophy-heading"
            as="h2"
            size="statement"
            className="max-w-[20ch]"
            lines={["We do not just market.", "We create meaning."]}
          />
          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-3">
            <div data-reveal="fade-up">
              <IndexLabel index="01">Understand</IndexLabel>
              <p className="t-lead text-ink-3 mt-4 max-w-[30ch]">
                Every project starts with who you are, what you stand for, and
                how you want to be remembered.
              </p>
            </div>
            <div data-reveal="fade-up" data-reveal-delay={0.1}>
              <IndexLabel index="02">Make it matter</IndexLabel>
              <p className="t-lead text-ink-3 mt-4 max-w-[30ch]">
                From visuals to voices, from on-site teams to strategic
                direction, everything we make follows one idea.
              </p>
            </div>
            <div data-reveal="fade-up" data-reveal-delay={0.2}>
              <IndexLabel index="03">Remember</IndexLabel>
              <p className="t-lead text-ink-3 mt-4 max-w-[30ch]">
                Not just promoted, but elevated, experienced, and worth
                remembering long after the moment passes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Cinematic rhythm break -------------------------------------- */}
      <CinematicBand
        src={sitePhotos.acaGathering.src}
        alt={sitePhotos.acaGathering.alt}
        overlay="strong"
      >
        <div className="gutter mx-auto w-full max-w-[110rem] py-[clamp(3rem,7vw,6rem)]">
          <p className="t-statement font-display max-w-[16ch]" data-reveal="fade-up">
            Make it matter.
          </p>
        </div>
      </CinematicBand>

      {/* ---- 4. The three worlds ----------------------------------------- */}
      <section
        className="bg-paper py-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="worlds-heading"
      >
        <div className="gutter mx-auto max-w-[110rem]">
          <SectionIntro
            id="worlds-heading"
            eyebrow="How we're organized"
            lines={["Three worlds,", "one idea."]}
            className="mb-14 max-w-[42rem]"
          >
            Stories become media. Ideas become brands. People become
            communities.
          </SectionIntro>
          <WorldStrip />
        </div>
      </section>

      {/* ---- 5. Team — founder feature ------------------------------------ */}
      <section
        className="bg-paper-warm py-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="team-heading"
      >
        <div className="gutter mx-auto max-w-[110rem]">
          <h2 id="team-heading" className="t-label text-neutral mb-10 font-sans!">
            The team
          </h2>
          {founder ? (
            <div className="grid gap-x-14 gap-y-10 md:grid-cols-12 md:items-center">
              {/* JP supplied its monogram for this slot (client update doc).
                  The source is square, so show it whole and keep it modest:
                  it sits beside the founder's name, not as a hero image. */}
              <div className="max-w-[16rem] md:col-span-4 md:max-w-none lg:col-span-3">
                <MediaReveal
                  src={sitePhotos.jpLogo.src}
                  alt={sitePhotos.jpLogo.alt}
                  ratio="1/1"
                  sizes="(max-width: 768px) 16rem, 25vw"
                  quality={82}
                />
              </div>
              <div className="md:col-span-7 md:col-start-6 lg:col-span-8 lg:col-start-4 lg:pl-8">
                <AnimatedHeading
                  as="h3"
                  size="statement"
                  lines={[founder.name]}
                />
                <p className="t-label text-ember mt-4">{founder.role}</p>
                {founder.bio ? (
                  <p
                    className="t-lead text-ink-3 mt-6 max-w-[52ch]"
                    data-reveal="fade-up"
                    data-reveal-delay={0.1}
                  >
                    {founder.bio}
                  </p>
                ) : null}
                {founder.links && founder.links.length > 0 ? (
                  <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
                    {founder.links.map((link) => (
                      <li key={link.href}>
                        <ArrowLink href={link.href} external>
                          {link.label}
                        </ArrowLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ---- 6. Community philosophy --------------------------------------- */}
      <section
        className="bg-paper py-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="community-heading"
      >
        <div className="gutter mx-auto max-w-[110rem] md:grid md:grid-cols-12 md:gap-x-14">
          <div className="md:col-span-5">
            <SectionIntro
              id="community-heading"
              eyebrow="Beyond the brief"
              lines={["Business should leave", "a place better than", "it found it."]}
            />
          </div>
          <div className="mt-10 md:col-span-6 md:col-start-7 md:mt-0 md:pt-9">
            <div className="flex flex-col gap-6">
              {impactPhilosophy.slice(0, 2).map((para, i) => (
                <p
                  key={i}
                  className="t-body text-ink-3"
                  data-reveal="fade-up"
                  data-reveal-delay={i * 0.1}
                >
                  {para}
                </p>
              ))}
            </div>
            <div className="mt-8" data-reveal="fade-up" data-reveal-delay={0.2}>
              <ArrowLink href="/impact">See our community work</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 7. Partners --------------------------------------------------- */}
      <BrandMarquee />

    </>
  );
}
