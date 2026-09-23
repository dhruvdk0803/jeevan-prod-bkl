import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/cms/public";
import { getPreviewPost } from "@/lib/cms/preview";
import { withHeadingIds } from "@/lib/cms/html";
import { buildMetadata } from "@/lib/seo";
import { blogPostingSchema, breadcrumbSchema, jsonLd } from "@/lib/schema";
import { MediaReveal } from "@/components/primitives/Media";
import { CTASection } from "@/components/primitives/Actions";
import { Prose } from "@/components/blog/Prose";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { AuthorByline } from "@/components/blog/AuthorByline";
import { ShareLinks } from "@/components/blog/ShareLinks";
import { PreviewBar } from "@/components/blog/PreviewBar";
import { PostGrid } from "@/components/blog/PostGrid";
import { formatPostDate } from "@/components/blog/format";

export const revalidate = 300;

type Params = { slug: string };

export async function generateStaticParams() {
  const { posts } = await getPublishedPosts({ perPage: 48 });
  return posts.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = true;

async function loadPost(slug: string) {
  const preview = await getPreviewPost(slug);
  if (preview) return { post: preview, previewing: true };
  const post = await getPostBySlug(slug);
  return { post, previewing: false };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { post, previewing } = await loadPost(slug);
  if (!post) return {};

  const base = await buildMetadata({
    path: `/blog/${post.slug}`,
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    ogType: "article",
    images: post.ogImageUrl
      ? [{ url: post.ogImageUrl }]
      : post.coverImageUrl
        ? [{ url: post.coverImageUrl }]
        : undefined,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category?.name,
      tags: post.tags.map((t) => t.name),
      authors: post.author ? [post.author.name] : undefined,
    },
  });

  return {
    ...base,
    ...(post.canonicalUrl ? { alternates: { canonical: post.canonicalUrl } } : {}),
    ...(post.noindex || previewing ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { post, previewing } = await loadPost(slug);
  if (!post) notFound();

  const { html, toc } = withHeadingIds(post.content);
  const related = await getRelatedPosts(post.id, post.categoryId, 3);

  const trail = breadcrumbSchema([
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ]);
  const article = blogPostingSchema({
    title: post.title,
    description: post.metaDescription || post.excerpt || "",
    slug: post.slug,
    image: post.ogImageUrl || post.coverImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authorName: post.author?.name,
    tags: post.tags.map((t) => t.name),
    section: post.category?.name,
  });

  return (
    <>
      {previewing ? <PreviewBar slug={post.slug} /> : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(trail)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(article)} />

      <article>
        {/* Header */}
        <header className="gutter mx-auto max-w-[110rem] pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-[clamp(3rem,7vw,5rem)]">
          <div className="max-w-[68ch]">
            <p className="t-label text-neutral mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/blog" className="hover:text-ember transition-colors duration-300">
                Journal
              </Link>
              {post.category ? (
                <>
                  <Dot />
                  <Link
                    href={`/blog/category/${post.category.slug}`}
                    className="text-ember hover:text-ember-deep transition-colors duration-300"
                  >
                    {post.category.name}
                  </Link>
                </>
              ) : null}
            </p>
            <h1 className="t-hero font-display">{post.title}</h1>
            {post.excerpt ? <p className="t-lead text-ink-3 mt-7">{post.excerpt}</p> : null}
            <p className="t-label text-neutral mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <Dot />
              <span>{post.readingMinutes} min read</span>
            </p>
          </div>
        </header>

        {/* Cover */}
        {post.coverImageUrl ? (
          <div className="gutter mx-auto max-w-[110rem] pb-[clamp(3rem,7vw,5rem)]">
            <MediaReveal
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              width={post.coverImageWidth ?? undefined}
              height={post.coverImageHeight ?? undefined}
              ratio="16/9"
              sizes="(max-width: 1024px) 100vw, 84vw"
              priority
              quality={82}
            />
          </div>
        ) : null}

        {/* Body + TOC */}
        <div className="gutter mx-auto max-w-[110rem] pb-[clamp(4rem,10vw,7rem)]">
          <div className="grid gap-x-[clamp(2rem,5vw,4rem)] gap-y-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <Prose html={html} />
            <TableOfContents toc={toc} />
          </div>
        </div>

        {/* Tags + share */}
        <div className="gutter mx-auto max-w-[110rem] pb-[clamp(3rem,7vw,5rem)]">
          <div className="rule flex max-w-[68ch] flex-col gap-8 pt-10 sm:flex-row sm:items-start sm:justify-between">
            {post.tags.length > 0 ? (
              <div>
                <p className="t-label text-neutral mb-4">Tagged</p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {post.tags.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/blog/tag/${t.slug}`}
                        className="t-label text-ink-3 hover:text-ember transition-colors duration-300"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <ShareLinks path={`/blog/${post.slug}`} title={post.title} />
          </div>
        </div>

        {/* Author */}
        {post.author ? (
          <div className="gutter mx-auto max-w-[110rem] pb-[clamp(4rem,10vw,7rem)]">
            <AuthorByline author={post.author} className="max-w-[68ch]" />
          </div>
        ) : null}
      </article>

      {/* Related posts */}
      {related.length > 0 ? (
        <section className="bg-paper-warm" aria-labelledby="related-heading">
          <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,9rem)]">
            <h2 id="related-heading" className="t-label text-neutral mb-10">
              Related reading
            </h2>
            <PostGrid posts={related} />
          </div>
        </section>
      ) : null}

      <CTASection
        eyebrow="Start a project"
        lines={["Have something", "worth remembering?"]}
        body="If this story sounds like yours, we'd love to hear about it."
      />
    </>
  );
}

function Dot() {
  return <span aria-hidden="true" className="bg-neutral-2 inline-block h-1 w-1 rounded-full" />;
}
