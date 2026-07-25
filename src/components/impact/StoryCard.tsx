import Link from "next/link";
import { clsx } from "clsx";
import { MediaReveal } from "@/components/primitives/Media";
import { Arrow } from "@/components/primitives/Actions";
import type { ImpactStory } from "@/content/types";

/**
 * StoryCard — one Impact story tile. Built now, ahead of any published
 * content, so the grid needs no rework the day the first story goes live.
 */

const categoryLabels: Record<ImpactStory["category"], string> = {
  nonprofit: "Nonprofit",
  "small-business": "Small Business",
  community: "Community",
  volunteer: "Volunteer",
  arts: "Arts",
};

export function StoryCard({
  story,
  priority = false,
  className,
}: {
  story: ImpactStory;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link href={`/impact/${story.slug}`} className={clsx("group block", className)}>
      <div className="relative overflow-hidden" data-cursor="Read">
        {story.cover ? (
          <MediaReveal
            src={story.cover.src}
            alt={story.cover.alt}
            ratio="4/5"
            sizes="(max-width: 768px) 100vw, 30vw"
            priority={priority}
            quality={82}
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="aspect-[4/5] bg-paper-2" aria-hidden="true" />
        )}
      </div>
      <div className="mt-6">
        <p className="t-label text-ember mb-3">{categoryLabels[story.category]}</p>
        <h3 className="t-h3 font-display">
          <span className="transition-colors duration-300 group-hover:text-ember">
            {story.title}
          </span>
        </h3>
        {story.organisation ? (
          <p className="t-label text-neutral mt-3">{story.organisation}</p>
        ) : null}
        <p className="t-body text-ink-3 mt-4 max-w-[42ch]">{story.excerpt}</p>
        <span className="t-label text-ember mt-5 inline-flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Read the story
          <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/**
 * StoryGrid — the index/related-stories layout. A plain, even grid is the
 * right call here (unlike the work index's asymmetric rhythm): stories are
 * peers, not a curated hero sequence.
 */
export function StoryGrid({ stories }: { stories: ImpactStory[] }) {
  return (
    <div
      className="grid gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      data-reveal="fade-up"
      data-reveal-stagger
    >
      {stories.map((story, i) => (
        <StoryCard key={story.slug} story={story} priority={i === 0} />
      ))}
    </div>
  );
}
