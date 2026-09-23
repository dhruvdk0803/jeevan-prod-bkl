import type { Metadata } from "next";
import { clsx } from "clsx";
import { AnimatedHeading, Label, SectionIntro } from "@/components/primitives/Type";
import { CinematicBand, MediaReveal } from "@/components/primitives/Media";
import { Button, CTASection } from "@/components/primitives/Actions";
import { EventCard } from "@/components/events/EventCard";
import { socialHours, events, upcomingEvents } from "@/content/events";
import { site } from "@/content/site";
import { photoCatalog } from "@/content/photo-catalog";
import { breadcrumbSchema, eventSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/social-hours",
    title: "Social Hours",
    description:
      "Social Hours is Jeevan Productions' curated gatherings across San Diego — outdoor experiences, networking evenings, social nights, and community dinners.",
  });
}

const photo = (src: string) => {
  const p = photoCatalog.find((entry) => entry.src === src);
  if (!p) throw new Error(`Missing photo-catalog entry: ${src}`);
  return p;
};

const heroPhoto = photo("/media/work/photo-24.jpeg");

const categoryPhotos: Record<string, ReturnType<typeof photo>> = {
  "Outdoor Experiences": photo("/media/work/photo-18.jpeg"),
  "Networking Events": photo("/media/work/photo-3.jpeg"),
  "Social Gatherings": photo("/media/work/photo-15.jpeg"),
  "Dinners & Community": photo("/media/work/photo-12.jpeg"),
};

const galleryPhotos = [
  photo("/media/work/photo-7.jpeg"),
  photo("/media/work/photo-19.jpeg"),
  photo("/media/work/photo-22.jpeg"),
  photo("/media/work/photo-6.jpeg"),
  photo("/media/work/photo-17.jpeg"),
  photo("/media/work/photo-1.jpeg"),
];

const pastEvents = events.filter((e) => e.status === "past");
// Only events with a confirmed, verified date get Event schema — the one
// past event on file (Afternoon Tea) has no asserted date, so it's skipped.
const eventsWithDates = [...upcomingEvents, ...pastEvents].filter((e) => e.date);

export default function SocialHoursPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Social Hours", href: "/social-hours" },
          ]),
        )}
      />
      {eventsWithDates.map((e) => (
        <script
          key={e.slug}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(
            eventSchema({
              name: e.name,
              description: e.description,
              date: e.date as string,
              venue: e.venue,
              city: e.city,
              url: e.ticketUrl,
            }),
          )}
        />
      ))}

      {/* Hero */}
      <CinematicBand src={heroPhoto.src} alt={heroPhoto.alt} overlay="strong" priority parallax={0.12}>
        <div className="gutter relative mx-auto w-full max-w-[110rem] pb-[clamp(3rem,7vw,5rem)]">
          <Label className="text-paper/70 mb-6">Social Hours</Label>
          <AnimatedHeading
            as="h1"
            size="hero"
            id="social-hours-hero-heading"
            lines={["Good things happen when good", "people get in the same room."]}
          />
        </div>
      </CinematicBand>

      {/* What it is / why it exists */}
      <section className="bg-paper-warm">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-10 md:grid-cols-12">
            <p className="t-label text-neutral md:col-span-3">A cultural initiative</p>
            <div className="space-y-7 md:col-span-8 md:col-start-5">
              {socialHours.intro.map((paragraph, i) => (
                <p
                  key={i}
                  className="t-lead text-ink max-w-[56ch]"
                  data-reveal="fade-up"
                  data-reveal-delay={i * 0.12}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The four gathering categories — each with its own editorial treatment. */}
      <section className="bg-paper" aria-labelledby="categories-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <SectionIntro
            eyebrow="Four kinds of gathering"
            lines={["Where Social Hours", "brings people together."]}
            id="categories-heading"
          />

          <div className="mt-20 flex flex-col gap-[clamp(4rem,10vw,8rem)]">
            {socialHours.categories.map((category, i) => {
              const image = categoryPhotos[category.name];
              const reversed = i % 2 === 1;
              return (
                <div
                  key={category.name}
                  className="grid items-center gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-10 md:grid-cols-12"
                >
                  <div
                    className={clsx(
                      "md:col-span-7",
                      reversed ? "md:col-start-6" : "md:col-start-1",
                    )}
                  >
                    <MediaReveal
                      src={image.src}
                      alt={image.alt}
                      ratio={i % 2 === 0 ? "3/2" : "4/5"}
                      sizes="(max-width: 768px) 100vw, 55vw"
                      quality={82}
                    />
                  </div>
                  <div
                    className={clsx(
                      "md:col-span-4",
                      reversed ? "md:col-start-1 md:row-start-1" : "md:col-start-9",
                    )}
                  >
                    <p className="t-label text-neutral tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="t-h2 font-display mt-4">{category.name}</h3>
                    <p className="t-body text-ink-3 mt-5 max-w-[38ch]">{category.blurb}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming gathering — honest empty state. */}
      <section className="on-dark bg-ink text-paper" data-theme-dark aria-labelledby="upcoming-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(6rem,14vw,11rem)]">
          <Label className="text-ember-light mb-8">Upcoming gathering</Label>
          <AnimatedHeading
            as="h2"
            size="statement"
            id="upcoming-heading"
            lines={["The next gathering will be", "announced soon."]}
          />
          <p className="t-lead text-paper/70 mt-8 max-w-[56ch]" data-reveal="fade-up">
            {socialHours.note}
          </p>
          <div className="mt-12 flex flex-wrap gap-4" data-reveal="fade-up" data-reveal-delay={0.1}>
            <Button href={site.eventbrite} variant="light" external>
              View our Eventbrite
            </Button>
            <Button href={`mailto:${site.email}`} variant="ghost">
              Get notified by email
            </Button>
          </div>
        </div>
      </section>

      {/* Previous gatherings — one verified event, presented with dignity. */}
      {pastEvents.length > 0 ? (
        <section className="bg-paper-warm" aria-labelledby="past-heading">
          <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
            <SectionIntro
              eyebrow="Previous gatherings"
              lines={["From an afternoon", "already spent together."]}
              id="past-heading"
            />
            <div className="mt-16 max-w-[42rem]">
              {pastEvents.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      <section className="bg-paper" aria-label="Gathering photography">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            data-reveal="fade-up"
            data-reveal-stagger
          >
            {galleryPhotos.map((image, i) => (
              <MediaReveal
                key={image.src}
                src={image.src}
                alt={image.alt}
                ratio="4/5"
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={82}
                className={clsx(i === 0 && "sm:col-span-2 lg:col-span-1")}
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Join us"
        lines={["Save your seat for", "the next gathering."]}
        body="New Social Hours are added to Eventbrite regularly. Follow along so you don't miss the next one."
        href={site.eventbrite}
        label="View Eventbrite"
      />
    </>
  );
}
