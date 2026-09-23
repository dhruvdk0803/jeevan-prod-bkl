import type { Metadata } from "next";
import { AnimatedHeading, Label } from "@/components/primitives/Type";
import { ArrowLink, Button } from "@/components/primitives/Actions";
import { site } from "@/content/site";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist — but here's where the rest of the work lives.",
  alternates: { canonical: "/404" },
  robots: { index: false, follow: true },
};

/**
 * A genuinely designed 404 — not a centred system error. Same editorial
 * language as the rest of the site: label, masked display heading, a warm
 * human line, and real routes back into the work.
 */
export default function NotFound() {
  return (
    <SiteChrome>
    <section aria-labelledby="not-found-heading" className="bg-paper text-ink">
      <div className="gutter mx-auto flex min-h-[calc(100svh-var(--nav-h))] max-w-[110rem] flex-col justify-center py-[clamp(5rem,12vw,8rem)]">
        <Label className="mb-8">404 — Off the map</Label>
        <AnimatedHeading
          as="h1"
          id="not-found-heading"
          size="hero"
          lines={["We haven't shot", "this scene yet."]}
        />
        <p className="t-lead text-ink-3 mt-8 max-w-[46ch]" data-reveal="fade-up" data-reveal-delay={0.15}>
          The page you&rsquo;re looking for doesn&rsquo;t exist, moved, or never made it
          past the edit. Here&rsquo;s where the rest of {site.name} lives.
        </p>

        <div
          className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5"
          data-reveal="fade-up"
          data-reveal-delay={0.25}
        >
          <Button href="/">Back to the homepage</Button>
          <ArrowLink href="/work">See the work</ArrowLink>
          <ArrowLink href="/contact">Start a project</ArrowLink>
        </div>

        <nav aria-label="Explore the site" className="rule mt-16 pt-8">
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            <li>
              <ArrowLink href="/services">Services</ArrowLink>
            </li>
            <li>
              <ArrowLink href="/about">About</ArrowLink>
            </li>
            <li>
              <ArrowLink href="/impact">Impact</ArrowLink>
            </li>
            <li>
              <ArrowLink href="/social-hours">Social Hours</ArrowLink>
            </li>
            <li>
              <ArrowLink href="/careers">Careers</ArrowLink>
            </li>
          </ul>
        </nav>
      </div>
    </section>
    </SiteChrome>
  );
}
