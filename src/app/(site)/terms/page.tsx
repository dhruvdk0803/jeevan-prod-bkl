import type { Metadata } from "next";
import { SectionIntro, Label } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/terms",
    title: "Terms of Service",
    description:
      "The terms that govern use of the Jeevan Productions website — inquiries, careers, content, and liability.",
  });
}

const lastUpdated = "July 25, 2026";

export default function TermsPage() {
  return (
    <>
      <section aria-labelledby="terms-heading" className="bg-paper text-ink">
        <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,8rem)]">
          <SectionIntro
            as="h1"
            id="terms-heading"
            size="hero"
            eyebrow="Legal"
            lines={["Terms of Service"]}
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
              counsel review these terms before they govern any live launch.
            </p>
          </div>

          <div className="mt-16 grid gap-16 md:grid-cols-12">
            <div className="prose-legal max-w-[62ch] space-y-12 md:col-span-8">
              <PolicySection heading="Using this site">
                <p>
                  This website belongs to {site.legalName}. By browsing it,
                  submitting the contact form, or applying for a role
                  through the careers page, you agree to these terms. If you
                  don&rsquo;t agree, please don&rsquo;t use the site&rsquo;s forms.
                </p>
              </PolicySection>

              <PolicySection heading="Inquiries and career applications">
                <p>
                  Submitting the contact form is a request to start a
                  conversation about a project — it is not a contract, quote,
                  or booking. No engagement exists until both parties agree
                  to written terms for a specific project.
                </p>
                <p>
                  Submitting a career application, including any uploaded
                  resume, is voluntary and used only for evaluating that
                  application. Submitting an application does not create an
                  employment relationship or any guarantee of a response.
                </p>
              </PolicySection>

              <PolicySection heading="Site content">
                <p>
                  The photography, video, copy, and design on this site
                  belong to {site.legalName} or are used with permission,
                  and are shown to represent the studio&rsquo;s work. Please don&rsquo;t
                  reproduce, redistribute, or claim this content as your own
                  without asking first — email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-ember underline underline-offset-4"
                  >
                    {site.email}
                  </a>{" "}
                  if you&rsquo;d like to use something.
                </p>
              </PolicySection>

              <PolicySection heading="No warranties">
                <p>
                  This site is provided as-is. We work to keep it accurate
                  and available, but we don&rsquo;t guarantee it will always be
                  error-free, uninterrupted, or perfectly up to date.
                </p>
              </PolicySection>

              <PolicySection heading="Limitation of liability">
                <p>
                  To the extent permitted by law, {site.legalName} is not
                  liable for indirect or consequential loss arising from
                  your use of this website. Nothing here limits liability
                  that can&rsquo;t lawfully be limited.
                </p>
              </PolicySection>

              <PolicySection heading="Governing law">
                <p>
                  These terms are governed by the laws of the State of
                  California, without regard to conflict-of-law principles.
                </p>
              </PolicySection>

              <PolicySection heading="Changes to these terms">
                <p>
                  We may update these terms as the site changes. The date at
                  the top of this page reflects the most recent revision.
                </p>
              </PolicySection>
            </div>

            <aside className="rule pt-8 md:col-span-4 md:col-start-9">
              <Label className="mb-4">Questions</Label>
              <p className="t-body text-ink-2">
                For anything related to these terms, reach us directly.
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
      <div className="t-body text-ink-2 [&_a]:text-ember [&_p+p]:mt-4 [&_p]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
