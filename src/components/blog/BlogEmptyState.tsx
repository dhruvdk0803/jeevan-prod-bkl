import { ArrowLink } from "@/components/primitives/Actions";

/** The "no posts yet" state — matches the empty-state pattern used on /impact. */
export function BlogEmptyState() {
  return (
    <div className="rule grid gap-x-[clamp(1.5rem,4vw,4rem)] pt-16 md:grid-cols-12" data-reveal="fade-up">
      <div className="md:col-span-7">
        <p className="t-h3 font-display max-w-[22ch]">The journal is just getting started.</p>
        <p className="t-body text-ink-3 mt-6 max-w-[52ch]">
          We haven&rsquo;t published a post yet — not because there&rsquo;s nothing to say, but
          because we&rsquo;d rather wait for something worth writing than fill the space.
          Check back soon.
        </p>
        <div className="mt-10">
          <ArrowLink href="/work">See our work instead</ArrowLink>
        </div>
      </div>
    </div>
  );
}
