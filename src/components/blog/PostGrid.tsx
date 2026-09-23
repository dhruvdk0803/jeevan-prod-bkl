import { PostCard } from "./PostCard";
import type { PostCard as PostCardData } from "@/lib/cms/types";

/** Standard 3-across editorial grid used across the blog index, category and tag pages. */
export function PostGrid({ posts, priorityFirst = false }: { posts: PostCardData[]; priorityFirst?: boolean }) {
  return (
    <ul
      className="grid gap-x-[clamp(1.5rem,4vw,3rem)] gap-y-[clamp(3rem,6vw,5rem)] sm:grid-cols-2 lg:grid-cols-3"
      data-reveal="fade-up"
      data-reveal-stagger
    >
      {posts.map((post, i) => (
        <li key={post.id}>
          <PostCard post={post} priority={priorityFirst && i === 0} />
        </li>
      ))}
    </ul>
  );
}
