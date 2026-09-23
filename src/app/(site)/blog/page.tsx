import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getPublishedPosts, getSiteSettings } from "@/lib/cms/public";
import type { PostCard as PostCardData } from "@/lib/cms/types";
import { buildMetadata } from "@/lib/seo";
import { blogSchema, breadcrumbSchema, collectionPageSchema, jsonLd } from "@/lib/schema";
import { SectionIntro } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { PostCard } from "@/components/blog/PostCard";
import { PostGrid } from "@/components/blog/PostGrid";
import { Pagination } from "@/components/blog/Pagination";
import { BlogEmptyState } from "@/components/blog/BlogEmptyState";
import { BLOG_DEFAULT_INTRO as DEFAULT_INTRO, BLOG_DEFAULT_TITLE as DEFAULT_TITLE, BLOG_PAGE_SIZE } from "./config";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    path: "/blog",
    title: settings.blogMetaTitle || settings.blogTitle || DEFAULT_TITLE,
    description: settings.blogMetaDescription || settings.blogIntro || DEFAULT_INTRO,
  });
}

export default async function BlogIndexPage() {
  const [settings, categories, { posts, total }] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPublishedPosts({ page: 1, perPage: BLOG_PAGE_SIZE }),
  ]);

  const title = settings.blogTitle || DEFAULT_TITLE;
  const intro = settings.blogIntro || DEFAULT_INTRO;
  const usedCategories = categories.filter((c) => (c.postCount ?? 0) > 0);
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const [featured, ...rest] = posts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }]))}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(blogSchema())} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          collectionPageSchema({ name: title, description: intro, path: "/blog" }),
        )}
      />

      <section className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(3rem,7vw,5rem)]">
        <SectionIntro eyebrow="Journal" as="h1" size="hero" lines={[title]}>
          {intro}
        </SectionIntro>

        {usedCategories.length > 0 ? (
          <nav aria-label="Filter by category" className="mt-10" data-reveal="fade-up" data-reveal-delay={0.2}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {usedCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/blog/category/${c.slug}`}
                    className="t-label text-ink-3 hover:text-ember min-h-11 inline-flex items-center transition-colors duration-300"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </section>

      <section className="gutter mx-auto max-w-[110rem] pb-[clamp(5rem,12vw,10rem)]" aria-labelledby="blog-list-heading">
        <h2 id="blog-list-heading" className="sr-only">
          All posts
        </h2>

        {posts.length === 0 ? (
          <BlogEmptyState />
        ) : (
          <>
            {featured ? (
              <div className="mb-[clamp(3.5rem,8vw,6rem)]">
                <FeaturedPostCard post={featured} />
              </div>
            ) : null}
            {rest.length > 0 ? <PostGrid posts={rest} /> : null}
            <Pagination page={1} totalPages={totalPages} basePath="/blog" />
          </>
        )}
      </section>

      <CTASection
        eyebrow="Start a project"
        lines={["Have something", "worth remembering?"]}
        body="If a story here sounds like yours, we'd love to hear about it."
      />
    </>
  );
}

function FeaturedPostCard({ post }: { post: PostCardData }) {
  return (
    <div className="rule pt-10">
      <PostCard post={post} priority sizes="(max-width: 1024px) 100vw, 80vw" className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-12" />
    </div>
  );
}
