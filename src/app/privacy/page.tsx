import type { Metadata } from "next";
import { SectionIntro, Label } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Jeevan Productions handles inquiries, career applications, and the limited data this site collects.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Jeevan Productions",
    description:
      "How Jeevan Productions handles inquiries, career applications, and the limited data this site collects.",
    url: "/privacy",
    type: "website",
  },
};

const lastUpdated = "July 25, 2026";

export default function PrivacyPage() {
  return (
    <>
      <section aria-labelledby="privacy-heading" className="bg-paper text-ink">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,8rem)]">
          <SectionIntro
            as="h1"
            id="privacy-heading"
            size="hero"
            eyebrow="Legal"
            lines={["Privacy Policy"]}
          >
            Last updated {lastUpdated}.
          </SectionIntro>

          <div
            className="bg-sand border-ember/25 mt-12 max-w-[62ch] rounded-2xl border px-7 py-6"
            role="note"
            data-reveal="fade-up"
          >
            <p className="t-label text-ember-deep mb-2">Editorial note</p>
            <p className="t-body text-ink-2">
              This page is a starting point written in plain English to
              reflect what this site actually does today. It is not a
              substitute for legal advice — Jeevan Productions should have
              counsel review this policy before it governs any live launch.
            </p>
          </div>

          <div className="mt-16 grid gap-16 md:grid-cols-12">
            <div className="prose-legal max-w-[62ch] space-y-12 md:col-span-8">
              <PolicySection heading="What this site collects">
                <p>
                  {site.name} collects information only when you choose to
                  give it to us. There is no advertising tracking, no sale of
                  personal data, and no hidden data collection on this site.
                  Specifically, we collect:
                </p>
                <ul>
                  <li>
                    <strong>Contact form inquiries</strong> — the name,
                    email, and message details you submit through the
                    contact page, so we can respond to your project
                    inquiry.
                  </li>
                  <li>
                    <strong>Career applications</strong> — the name, email,
                    and any resume or portfolio file you upload when
                    applying to an open role on the careers page.
                  </li>
                </ul>
                <p>
                  We do not require you to create an account, and we do not
                  collect payment information anywhere on this site.
                </p>
              </PolicySection>

              <PolicySection heading="Bot protection">
                <p>
                  Forms on this site are protected by{" "}
                  <span className="whitespace-nowrap">Cloudflare Turnstile</span>,
                  a privacy-respecting alternative to traditional CAPTCHAs.
                  Turnstile may process limited technical signals (such as
                  browser and network characteristics) to verify you&rsquo;re
                  human before a submission reaches us. It is provided by
                  Cloudflare, Inc. — see Cloudflare&rsquo;s own privacy policy for
                  details on how Turnstile works.
                </p>
              </PolicySection>

              <PolicySection heading="Advertising and analytics">
                <p>
                  This site does not currently run advertising trackers,
                  retargeting pixels, or third-party analytics that build a
                  profile of visitors. If that changes in the future, this
                  policy will be updated to reflect it before any such
                  tracking goes live.
                </p>
              </PolicySection>

              <PolicySection heading="How we use what you send us">
                <p>
                  Inquiry and application details are used only to respond
                  to you — to discuss a potential project or a job
                  application. We do not share, rent, or sell this
                  information to third parties. Resumes and application
                  materials are used solely for hiring purposes.
                </p>
              </PolicySection>

              <PolicySection heading="How long we keep it">
                <p>
                  We keep inquiry and application information only as long
                  as reasonably needed to respond to you or consider your
                  application, and delete or archive it once that purpose
                  has passed.
                </p>
              </PolicySection>

              <PolicySection heading="Your rights">
                <p>
                  You can ask us what information we hold about you, ask us
                  to correct it, or ask us to delete it. To make a privacy
                  request, email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-ember underline underline-offset-4"
                  >
                    {site.email}
                  </a>{" "}
                  and we&rsquo;ll respond directly.
                </p>
              </PolicySection>

              <PolicySection heading="Changes to this policy">
                <p>
                  If how we collect or use information changes, we&rsquo;ll update
                  this page and the date at the top of it.
                </p>
              </PolicySection>
            </div>

            <aside className="rule pt-8 md:col-span-4 md:col-start-9">
              <Label className="mb-4">Questions</Label>
              <p className="t-body text-ink-2">
                For anything related to this policy or a request about your
                data, reach us directly.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="t-label text-ember mt-4 inline-block underline underline-offset-4"
              >
                {site.email}
              </a>
            </aside>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Start a project"
        lines={["Let's create something", "worth remembering."]}
        body={site.closingStatement}
      />
    </>
  );
}

function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div data-reveal="fade-up">
      <h2 className="t-h3 mb-4">{heading}</h2>
      <div className="t-body text-ink-2 [&_a]:text-ember [&_li]:mt-2 [&_p+p]:mt-4 [&_p]:leading-relaxed [&_strong]:text-ink [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
