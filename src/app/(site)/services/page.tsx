import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { site, worlds } from "@/content/site";
import { process } from "@/content/services";
import { AnimatedHeading, Label, SectionIntro } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { WorldSection } from "@/components/services/WorldSection";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/services",
    title: "Services",
    description:
      "Photography and video, brand strategy and campaigns, and full event production — the three things Jeevan Productions does, and how they work together.",
  });
}

const themes = ["paper", "sand", "dark"] as const;

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Services", href: "/services" },
          ]),
        )}
      />

      {/* ---- Hero ------------------------------------------------------ */}
      <section
        className="bg-paper-warm pt-[calc(var(--nav-h)+2.5rem)] pb-[clamp(4rem,9vw,7rem)]"
        aria-labelledby="services-hero-heading"
      >
        <div className="gutter mx-auto max-w-[110rem]">
          <Label className="mb-7">Services</Label>
          <AnimatedHeading
            as="h1"
            size="hero"
            id="services-hero-heading"
            className="max-w-[22ch]"
            lines={["Built for brands", "that think different."]}
          />
          <p
            className="t-lead text-ink-3 mt-8 max-w-[48ch]"
            data-reveal="fade-up"
            data-reveal-delay={0.15}
          >
            {site.description}
          </p>

          <nav aria-label="Jump to a world" className="mt-12">
            <ul className="flex flex-wrap gap-x-10 gap-y-4">
              {worlds.map((world, i) => (
                <li key={world.id} data-reveal="fade-up" data-reveal-delay={0.2 + i * 0.05}>
                  <Link
                    href={world.href}
                    className="group t-label inline-flex items-baseline gap-3 text-ink/70 transition-colors duration-300 hover:text-ember"
                  >
                    <span className="tabular-nums">{world.index}</span>
                    <span className="relative">
                      {world.title}
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ---- The three worlds -------------------------------------------- */}
      {worlds.map((world, i) => (
        <WorldSection key={world.id} world={world} theme={themes[i] ?? "paper"} />
      ))}

      {/* ---- Process ------------------------------------------------------ */}
      <section
        className="bg-paper py-[clamp(5rem,12vw,10rem)]"
        aria-labelledby="process-heading"
      >
        <div className="gutter mx-auto max-w-[110rem]">
          <SectionIntro
            id="process-heading"
            eyebrow="How we work"
            lines={["From intention", "to impact."]}
            className="mb-16 max-w-[36rem]"
          />
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-4">
            {process.map((step, i) => (
              <div
                key={step.step}
                className={clsx(i > 0 && "md:border-l md:border-ink/10 md:pl-8")}
                data-reveal="fade-up"
                data-reveal-delay={i * 0.08}
              >
                <span className="t-label text-ink-3 tabular-nums">{step.step}</span>
                <h3 className="t-h3 font-display mt-4">{step.title}</h3>
                <p className="t-body text-ink-3 mt-4">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        lines={["Let's create something", "worth remembering."]}
        body="Tell us which world your project belongs to — or let us help you figure it out."
      />
    </>
  );
}
