import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCategories, getPublishedPosts, getSiteSettings } from "@/lib/cms/public";
import { buildMetadata } from "@/lib/seo";
import { blogSchema, breadcrumbSchema, collectionPageSchema, jsonLd } from "@/lib/schema";
import { SectionIntro } from "@/components/primitives/Type";
import { CTASection } from "@/components/primitives/Actions";
import { PostGrid } from "@/components/blog/PostGrid";
import { Pagination } from "@/components/blog/Pagination";
import { BLOG_DEFAULT_INTRO as DEFAULT_INTRO, BLOG_DEFAULT_TITLE as DEFAULT_TITLE, BLOG_PAGE_SIZE } from "../../config";
import Link from "next/link";

export const revalidate = 300;

type Params = { page: string };

/** No slugs pre-built — pagination depth depends on how many posts exist. */
export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

function parsePage(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  return Number(raw);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { page: raw } = await params;
  const page = parsePage(raw);
  if (!page) return {};
  const settings = await getSiteSettings();
  const title = settings.blogMetaTitle || settings.blogTitle || DEFAULT_TITLE;
  return buildMetadata({
    path: `/blog/page/${page}`,
    title: `${title} — Page ${page}`,
    description: settings.blogMetaDescription || settings.blogIntro || DEFAULT_INTRO,
  });
}

export default async function BlogPagePage({ params }: { params: Promise<Params> }) {
  const { page: raw } = await params;
  const page = parsePage(raw);
  if (!page) notFound();
  if (page === 1) redirect("/blog");

  const [settings, categories, { posts, total }] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPublishedPosts({ page, perPage: BLOG_PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  if (page > totalPages) notFound();

  const title = settings.blogTitle || DEFAULT_TITLE;
  const usedCategories = categories.filter((c) => (c.postCount ?? 0) > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: `Page ${page}`, href: `/blog/page/${page}` },
          ]),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(blogSchema())} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          collectionPageSchema({
            name: `${title} — Page ${page}`,
            description: settings.blogIntro || DEFAULT_INTRO,
            path: `/blog/page/${page}`,
          }),
        )}
      />

      <section className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(3rem,7vw,5rem)]">
        <SectionIntro eyebrow="Journal" as="h1" size="hero" lines={[title]}>
          Page {page} of {totalPages}.
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
          Posts — page {page}
        </h2>
        <PostGrid posts={posts} />
        <Pagination page={page} totalPages={totalPages} basePath="/blog" />
      </section>

      <CTASection
        eyebrow="Start a project"
        lines={["Have something", "worth remembering?"]}
        body="If a story here sounds like yours, we'd love to hear about it."
      />
    </>
  );
}
