import { ArrowLink } from "@/components/primitives/Actions";

/** The "no posts yet" state — matches the empty-state pattern used on /impact. */
export function BlogEmptyState() {
  return (
    <div
      className="rule grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-6 pt-16 lg:grid-cols-12"
      data-reveal="fade-up"
    >
      <p className="t-h3 font-display max-w-[22ch] lg:col-span-5">
        The journal is just getting started.
      </p>
      <div className="lg:col-span-6 lg:col-start-7">
        <p className="t-body text-ink-3 max-w-[52ch]">
          We haven&rsquo;t published a post yet. Not because there&rsquo;s nothing to say, but
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
