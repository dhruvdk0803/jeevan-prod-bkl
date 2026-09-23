import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getCategoryBySlug, getPublishedPosts } from "@/lib/cms/public";
import { buildMetadata } from "@/lib/seo";
import { blogSchema, breadcrumbSchema, collectionPageSchema, jsonLd } from "@/lib/schema";
import { SectionIntro } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { PostGrid } from "@/components/blog/PostGrid";
import { BlogEmptyState } from "@/components/blog/BlogEmptyState";

export const revalidate = 300;

type Params = { slug: string };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.filter((c) => (c.postCount ?? 0) > 0).map((c) => ({ slug: c.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return buildMetadata({
    path: `/blog/category/${category.slug}`,
    title: category.metaTitle || `${category.name} — Journal`,
    description:
      category.metaDescription ||
      category.description ||
      `Posts from the Jeevan Productions journal, filed under ${category.name}.`,
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { posts } = await getPublishedPosts({ categorySlug: slug, perPage: 48 });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: category.name, href: `/blog/category/${category.slug}` },
          ]),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(blogSchema())} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          collectionPageSchema({
            name: `${category.name} — Journal`,
            description: category.description || `Posts filed under ${category.name}.`,
            path: `/blog/category/${category.slug}`,
          }),
        )}
      />

      <section className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(3rem,7vw,5rem)]">
        <Link href="/blog" className="t-label text-neutral hover:text-ember mb-6 inline-block transition-colors duration-300">
          Journal
        </Link>
        <SectionIntro eyebrow="Category" as="h1" size="hero" lines={[category.name]}>
          {category.description || `Posts from the journal, filed under ${category.name}.`}
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
