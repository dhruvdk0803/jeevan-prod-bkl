import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  caseStudyProjects,
  nextProject,
  projectBySlug,
  relatedProjects,
} from "@/content/projects";
import { site } from "@/content/site";
import type { MediaAsset } from "@/content/types";
import { AnimatedHeading, Label } from "@/components/primitives/Type";
import { MediaReveal } from "@/components/primitives/Media";
import { Arrow, CTASection } from "@/components/primitives/Actions";
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

      {/* 2. Opening visual */}
      <section className="gutter mx-auto max-w-[110rem] pb-[clamp(5rem,12vw,9rem)]">
        <MediaReveal
          src={project.cover.src}
          alt={project.cover.alt}
          ratio="4/5"
          sizes="(max-width: 1024px) 100vw, 84vw"
          priority
          quality={82}
          className="mx-auto max-w-[52rem]"
        />
      </section>

      {/* 3. Context */}
      <section
        className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]"
        aria-label="Context"
      >
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label as="h2">Context</Label>
          </div>
          <p className="t-lead text-ink-3 md:col-span-7 md:col-start-6" data-reveal="fade-up">
            {caseStudy.context}
          </p>
        </div>
      </section>

      <div className="gutter mx-auto max-w-[110rem]">
        <div className="rule" />
      </div>

      {/* 4. Approach — alternating alignment */}
      <section
        className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]"
        aria-label="Approach"
      >
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-12">
          <p
            className="order-2 t-lead text-ink-3 md:order-1 md:col-span-7"
            data-reveal="fade-up"
          >
            {caseStudy.approach}
          </p>
          <div className="order-1 md:order-2 md:col-span-3 md:col-start-10">
            <Label as="h2">Approach</Label>
          </div>
        </div>
      </section>

      {/* 5. Gallery */}
      {restOfGallery.length > 0 ? (
        <section
          className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,9rem)]"
          aria-label="Gallery"
        >
          <Label as="h2" className="mb-10">
            Gallery
          </Label>
          <Gallery images={restOfGallery} />
        </section>
      ) : null}

      {/* 6. Outcome / quote — only rendered when the content exists */}
      {caseStudy.outcome ? (
        <section
          className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]"
          aria-label="Outcome"
        >
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-12">
            <div className="md:col-span-3">
              <Label as="h2">Outcome</Label>
            </div>
            <p className="t-lead text-ink-3 md:col-span-7 md:col-start-6">{caseStudy.outcome}</p>
          </div>
        </section>
      ) : null}

      {caseStudy.quote ? (
        <section className="gutter mx-auto max-w-[110rem] py-[clamp(4rem,10vw,7rem)]">
          <blockquote className="t-statement max-w-[30ch] font-display">
            &ldquo;{caseStudy.quote.text}&rdquo;
          </blockquote>
          <p className="t-label text-neutral mt-6">{caseStudy.quote.attribution}</p>
        </section>
      ) : null}

      {/* 7. Related work + next project */}
      {related.length > 0 ? (
        <section
          className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,9rem)]"
          aria-label="Related work"
        >
          <Label as="h2" className="mb-10">
            Related work
          </Label>
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {related.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} ratio="4/5" sizes="(max-width: 768px) 100vw, 45vw" />
            ))}
          </div>
        </section>
      ) : null}

      {next ? (
        <section className="on-dark bg-ink text-paper" data-theme-dark>
          <Link
            href={`/work/${next.slug}`}
            data-cursor="Next"
            className="group gutter mx-auto flex max-w-[110rem] flex-col gap-6 py-[clamp(5rem,14vw,11rem)]"
          >
            <span className="t-label text-ember-light">Next project</span>
            <span className="t-statement font-display flex flex-wrap items-center gap-6">
              <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                {next.title}
              </span>
              <Arrow className="h-[0.55em] w-[0.55em] shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3" />
            </span>
          </Link>
        </section>
      ) : null}

      <CTASection
        eyebrow="Start a project"
        lines={["Have something", "worth remembering?"]}
        body={site.closingStatement}
      />
    </>
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
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="mx-auto max-w-[44rem]"
      />
    );
  }

  if (n === 2) {
    return (
      <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        <MediaReveal
          src={images[0].src}
          alt={images[0].alt}
          ratio="4/5"
          sizes="(max-width: 768px) 100vw, 45vw"
        />
        <MediaReveal
          src={images[1].src}
          alt={images[1].alt}
          ratio="4/5"
          sizes="(max-width: 768px) 100vw, 45vw"
          className="md:mt-[clamp(3rem,8vw,6rem)]"
        />
      </div>
    );
  }

  // 3 or more: lead with a full-width image, then pair off the rest with a
  // gentle vertical offset. Any final odd image out gets its own full row.
  const [lead, ...rest] = images;
  const pairs: MediaAsset[][] = [];
  for (let i = 0; i < rest.length; i += 2) pairs.push(rest.slice(i, i + 2));

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <MediaReveal
        src={lead.src}
        alt={lead.alt}
        ratio="4/5"
        sizes="(max-width: 1024px) 100vw, 80vw"
        className="mx-auto max-w-[56rem]"
      />
      {pairs.map((pair, i) => (
        <div
          key={i}
          className={clsx(
            "grid gap-x-8 gap-y-14",
            pair.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2",
          )}
        >
          <MediaReveal
            src={pair[0].src}
            alt={pair[0].alt}
            ratio="4/5"
            sizes="(max-width: 768px) 100vw, 45vw"
            className={i % 2 === 1 ? "md:mt-[clamp(3rem,8vw,6rem)]" : undefined}
          />
          {pair[1] ? (
            <MediaReveal
              src={pair[1].src}
              alt={pair[1].alt}
              ratio="4/5"
              sizes="(max-width: 768px) 100vw, 45vw"
              className={i % 2 === 0 ? "md:mt-[clamp(3rem,8vw,6rem)]" : undefined}
            />
          ) : (
            <div aria-hidden="true" className="hidden md:block" />
          )}
        </div>
      ))}
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true" className="bg-neutral-2 inline-block h-1 w-1 rounded-full" />;
}
