import { getPublishedPosts } from "@/lib/cms/public";
import { SectionIntro } from "@/components/primitives/Type";
import { ArrowLink } from "@/components/primitives/Actions";
import { PostGrid } from "@/components/blog/PostGrid";

/**
 * Homepage teaser for the three latest blog posts. Renders nothing when
 * there are none — no empty-state chrome on the homepage itself, since the
 * /blog index already owns that job.
 */
export async function LatestPosts() {
  const { posts } = await getPublishedPosts({ page: 1, perPage: 3 });
  if (posts.length === 0) return null;

  return (
    <section className="bg-paper" aria-labelledby="latest-posts-heading">
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
        <div className="mb-[clamp(3rem,7vw,5.5rem)] flex flex-wrap items-end justify-between gap-8">
          <SectionIntro
            as="h2"
            id="latest-posts-heading"
            size="statement"
            eyebrow="From the journal"
            lines={["Notes, stories", "and guides."]}
          />
          <div data-reveal="fade-up">
            <ArrowLink href="/blog">Read the blog</ArrowLink>
          </div>
        </div>

        <PostGrid posts={posts} />
      </div>
    </section>
  );
}
