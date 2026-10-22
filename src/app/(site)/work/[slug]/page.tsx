import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  caseStudyProjects,
  nextProject,
  projectBySlug,
  relatedProjects,
} from "@/content/projects";
import type { ReactNode } from "react";
import type { MediaAsset } from "@/content/types";
import { AnimatedHeading, Label } from "@/components/primitives/Type";
import { MediaReveal } from "@/components/primitives/Media";
import { Arrow } from "@/components/primitives/Actions";
import { ProjectCard } from "@/components/primitives/ProjectCard";
import { breadcrumbSchema, creativeWorkSchema, jsonLd } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { clsx } from "clsx";
import Link from "next/link";

type Params = { slug: string };

export async function generateStaticParams() {
  return caseStudyProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  return buildMetadata({
    path: `/work/${project.slug}`,
    title: project.title,
    description: project.summary,
    images: [{ url: project.cover.src }],
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);

  if (!project || !project.caseStudy) notFound();

  const { caseStudy } = project;
  const related = relatedProjects(slug, 2);
  const next = nextProject(slug);
  // The opening visual is the cover; the gallery below only shows the rest.
  const restOfGallery = project.gallery.slice(1);

  const trail = breadcrumbSchema([
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
    { name: project.title, href: `/work/${project.slug}` },
  ]);
  const creative = creativeWorkSchema({
    title: project.title,
    description: project.summary,
    slug: `/work/${project.slug}`,
    image: project.cover.src,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(trail)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(creative)} />

      {/* 1. Hero */}
      <section className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(3rem,7vw,5rem)]">
        <Label>
          <Link href="/work" className="hover:text-ember transition-colors duration-300">
            Work
          </Link>
          {" / "}
          {project.discipline}
        </Label>
        <AnimatedHeading
          as="h1"
          size="hero"
          className="mt-6"
          lines={[project.title]}
        />
        <p className="t-lead text-ink-3 mt-8 max-w-[52ch]" data-reveal="fade-up" data-reveal-delay={0.15}>
          {project.summary}
        </p>
        {(project.client || project.year || project.location) ? (
          <p
            className="t-label text-neutral mt-8 flex flex-wrap items-center gap-x-3 gap-y-1"
            data-reveal="fade-up"
            data-reveal-delay={0.2}
          >
            {project.client ? <span>{project.client}</span> : null}
            {project.client && (project.year || project.location) ? <Dot /> : null}
            {project.year ? <span>{project.year}</span> : null}
            {project.year && project.location ? <Dot /> : null}
            {project.location ? <span>{project.location}</span> : null}
          </p>
        ) : null}
      </section>

      {/* 2. Opening visual. Bottom spacing comes from the Context section's
          own padding, so the gap matches every other section break. */}
      <section className="gutter mx-auto max-w-[110rem]">
        <MediaReveal
          src={project.cover.src}
          alt={project.cover.alt}
          ratio="4/5"
          sizes="(max-width: 1024px) 100vw, 52rem"
          priority
          quality={82}
          className={CENTERED_MEDIA}
        />
      </section>

      {/* 3. Context */}
      <TextSection label="Context">{caseStudy.context}</TextSection>

      <Rule />

      {/* 4. Approach: same label/body columns as Context so the text edges
          line up down the page. */}
      <TextSection label="Approach">{caseStudy.approach}</TextSection>

      {/* 5. Gallery */}
      {restOfGallery.length > 0 ? (
        <>
          <Rule />
          <section
            className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]"
            aria-label="Gallery"
          >
            <Label as="h2" className="mb-10 font-sans!">
              Gallery
            </Label>
            <Gallery images={restOfGallery} />
          </section>
        </>
      ) : null}

      {/* 6. Outcome / quote: only rendered when the content exists */}
      {caseStudy.outcome ? (
        <>
          <Rule />
          <TextSection label="Outcome">{caseStudy.outcome}</TextSection>
        </>
      ) : null}

      {caseStudy.quote ? (
        <>
          <Rule />
          <section className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]">
            <blockquote className="t-statement max-w-[30ch] font-display">
              &ldquo;{caseStudy.quote.text}&rdquo;
            </blockquote>
            <p className="t-label text-neutral mt-6">{caseStudy.quote.attribution}</p>
          </section>
        </>
      ) : null}

      {/* 7. Related work + next project */}
      {related.length > 0 ? (
        <>
          <Rule />
          <section
            className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]"
            aria-label="Related work"
          >
            <Label as="h2" className="mb-10 font-sans!">
              Related work
            </Label>
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
              {related.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} ratio="4/5" sizes="(max-width: 768px) 100vw, 45vw" />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {next ? (
        <section className="on-dark bg-ink text-paper" data-theme-dark>
          <Link
            href={`/work/${next.slug}`}
            data-cursor="Next"
            className="group gutter mx-auto flex max-w-[110rem] flex-col gap-6 py-[clamp(5rem,12vw,9rem)]"
          >
            <span className="t-label text-ember-light">Next project</span>
            <span className="t-statement font-display flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                {next.title}
              </span>
              <Arrow className="h-[0.55em] w-[0.55em] shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3" />
            </span>
          </Link>
        </section>
      ) : null}
    </>
  );
}

/**
 * Centred single images (cover, lone gallery image, gallery lead) share one
 * width so they read as the same frame. `w-full` matters: inside a flex
 * column, `mx-auto` alone shrinks the box to its (absolutely positioned)
 * content and the image collapses to zero width.
 */
const CENTERED_MEDIA = "mx-auto w-full max-w-[52rem]";
const HALF_SIZES = "(max-width: 768px) 100vw, 45vw";

/** Label in the left columns, lead paragraph in the right: one shared grid. */
function TextSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]"
      aria-label={label}
    >
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-3">
          {/* font-sans! : globals.css sets h2 to the display serif outside any
              cascade layer, which outranks a plain utility class. */}
          <Label as="h2" className="font-sans! md:pt-[0.45em]">
            {label}
          </Label>
        </div>
        <p
          className="t-lead text-ink-3 max-w-[60ch] md:col-span-8 lg:col-span-7 lg:col-start-6"
          data-reveal="fade-up"
        >
          {children}
        </p>
      </div>
    </section>
  );
}

function Rule() {
  return (
    <div className="gutter mx-auto max-w-[110rem]">
      <div className="rule" />
    </div>
  );
}

function Gallery({ images }: { images: MediaAsset[] }) {
  const n = images.length;

  if (n === 1) {
    return (
      <MediaReveal
        src={images[0].src}
        alt={images[0].alt}
        ratio="4/5"
        sizes="(max-width: 1024px) 100vw, 52rem"
        className={CENTERED_MEDIA}
      />
    );
  }

  if (n === 2) {
    return (
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {images.map((img) => (
          <MediaReveal key={img.src} src={img.src} alt={img.alt} ratio="4/5" sizes={HALF_SIZES} />
        ))}
      </div>
    );
  }

  // 3 or more: lead with a centred image, then the rest in an aligned
  // two-column grid. A final odd image out is centred at the same size as
  // its neighbours rather than leaving an empty cell beside it.
  const [lead, ...rest] = images;
  const oddLast = rest.length % 2 === 1;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <MediaReveal
        src={lead.src}
        alt={lead.alt}
        ratio="4/5"
        sizes="(max-width: 1024px) 100vw, 52rem"
        className={CENTERED_MEDIA}
      />
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {rest.map((img, i) => (
          <MediaReveal
            key={img.src}
            src={img.src}
            alt={img.alt}
            ratio="4/5"
            sizes={HALF_SIZES}
            className={clsx(
              oddLast && i === rest.length - 1 && "md:col-span-2 md:mx-auto md:w-[calc(50%-1rem)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true" className="bg-neutral-2 inline-block h-1 w-1 rounded-full" />;
}
