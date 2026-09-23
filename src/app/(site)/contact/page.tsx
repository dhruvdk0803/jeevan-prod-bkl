import type { Metadata } from "next";
import { site } from "@/content/site";
import { photoCatalog } from "@/content/photo-catalog";
import { AnimatedHeading, Label, SectionIntro } from "@/components/primitives/Type";
import { CinematicBand } from "@/components/primitives/Media";
import { Arrow } from "@/components/primitives/Actions";
import { ContactForm } from "@/components/contact/ContactForm";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/contact",
    title: "Contact",
    description:
      "Start a project with Jeevan Productions — media, marketing or events in San Diego. Tell us what you're planning and we'll be in touch.",
  });
}

const heroImage = photoCatalog.find((p) => p.src === "/media/work/photo-18.jpeg")!;

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact" },
          ]),
        )}
      />

      {/* Hero */}
      <CinematicBand
        src={heroImage.src}
        alt={heroImage.alt}
        overlay="bottom"
        priority
        className="min-h-[70svh] md:min-h-[80svh]"
      >
        <div className="gutter mx-auto w-full max-w-[110rem] pb-[clamp(3rem,7vw,6rem)]">
          <Label className="mb-6 text-paper/70">Contact</Label>
          <AnimatedHeading
            as="h1"
            size="hero"
            lines={["Let's make something", "worth remembering."]}
          />
        </div>
      </CinematicBand>

      {/* Form + real contact facts, side by side */}
      <section className="bg-paper" aria-labelledby="contact-form-heading">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <SectionIntro
                id="contact-form-heading"
                eyebrow="Start a project"
                lines={["Tell us what", "you're planning."]}
                className="mb-12"
              />
              <ContactForm />
            </div>

            <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="contact-facts-heading">
              <div className="lg:sticky lg:top-32">
                <h2 id="contact-facts-heading" className="t-label mb-8 text-neutral">
                  Reach us directly
                </h2>

                <div className="space-y-8">
                  <div className="rule border-t-0 pb-8">
                    <p className="t-label mb-3 text-neutral">Email</p>
                    <a
                      href={`mailto:${site.email}`}
                      className="t-lead break-words text-ink transition-colors duration-300 hover:text-ember"
                    >
                      {site.email}
                    </a>
                  </div>

                  <div className="rule pt-8 pb-8">
                    <p className="t-label mb-3 text-neutral">Phone</p>
                    <ul className="space-y-2">
                      {site.phones.map((p) => (
                        <li key={p.tel} className="t-body text-ink-3">
                          <span className="text-neutral">{p.label}</span>{" "}
                          <a
                            href={`tel:${p.tel}`}
                            className="text-ink transition-colors duration-300 hover:text-ember"
                          >
                            {p.number}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rule pt-8 pb-8">
                    <p className="t-label mb-3 text-neutral">Location</p>
                    <p className="t-body text-ink-3">
                      {site.city}, {site.region}
                    </p>
                  </div>

                  <div className="rule pt-8 pb-8">
                    <p className="t-label mb-3 text-neutral">Office hours</p>
                    <p className="t-body text-ink-3">{site.hours}</p>
                  </div>

                  <div className="rule pt-8">
                    <p className="t-label mb-3 text-neutral">Follow</p>
                    <ul className="space-y-2">
                      {site.socials.map((s) => (
                        <li key={s.href}>
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group t-body inline-flex items-center gap-2 text-ink-3 transition-colors duration-300 hover:text-ember"
                          >
                            {s.label}
                            <Arrow className="-rotate-45 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
