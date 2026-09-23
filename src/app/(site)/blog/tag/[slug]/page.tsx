import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPageSeo, getPublishedPosts, getTagBySlug, getTagsInUse } from "@/lib/cms/public";
import { blogSchema, breadcrumbSchema, collectionPageSchema, jsonLd } from "@/lib/schema";
import { SectionIntro } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { PostGrid } from "@/components/blog/PostGrid";
import { BlogEmptyState } from "@/components/blog/BlogEmptyState";

export const revalidate = 300;

type Params = { slug: string };

export async function generateStaticParams() {
  const tags = await getTagsInUse();
  return tags.map((t) => ({ slug: t.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return {};

  const path = `/blog/tag/${tag.slug}`;
  const override = await getPageSeo(path);
  const title = override?.metaTitle || `${tag.name} — Journal`;
  const description =
    override?.metaDescription || `Posts from the Jeevan Productions journal, tagged ${tag.name}.`;
  // Tag pages with fewer than 2 posts are thin — noindex, follow regardless
  // of any page-SEO override, per the SEO brief.
  const thin = (tag.postCount ?? 0) < 2;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: thin || override?.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: path, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogTagPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const { posts } = await getPublishedPosts({ tagSlug: slug, perPage: 48 });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: tag.name, href: `/blog/tag/${tag.slug}` },
          ]),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(blogSchema())} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          collectionPageSchema({
            name: `${tag.name} — Journal`,
            description: `Posts tagged ${tag.name}.`,
            path: `/blog/tag/${tag.slug}`,
          }),
        )}
      />

      <section className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(3rem,7vw,5rem)]">
        <Link href="/blog" className="t-label text-neutral hover:text-ember mb-6 inline-block transition-colors duration-300">
          Journal
        </Link>
        <SectionIntro eyebrow="Tag" as="h1" size="hero" lines={[tag.name]}>
          {`Posts from the journal, tagged ${tag.name}.`}
        </SectionIntro>
      </section>

      <section className="gutter mx-auto max-w-[110rem] pb-[clamp(5rem,12vw,10rem)]">
        {posts.length === 0 ? <BlogEmptyState /> : <PostGrid posts={posts} priorityFirst />}
      </section>

      <CTASection
        eyebrow="Start a project"
        lines={["Have something", "worth remembering?"]}
        body="If a story here sounds like yours, we'd love to hear about it."
      />
    </>
  );
}
