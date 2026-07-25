import { SectionIntro } from "@/components/primitives/Type";
import type { ImpactMetric } from "@/content/types";

/**
 * Metrics — the Annual Impact numbers module.
 *
 * Per the build contract: if no metric is enabled, the whole section hides
 * itself. Nothing renders — not a heading, not a zeroed stat, not an empty
 * grid. The moment JP confirms one real number, flip `enabled: true` in
 * `src/content/impact.ts` and this component starts rendering automatically.
 */
export function Metrics({ metrics }: { metrics: ImpactMetric[] }) {
  const enabled = metrics.filter((m) => m.enabled);
  if (enabled.length === 0) return null;

  return (
    <section className="bg-paper-warm" aria-labelledby="impact-metrics-heading">
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
        <SectionIntro
          eyebrow="By the numbers"
          lines={["Annual impact"]}
          id="impact-metrics-heading"
        />
        <dl
          className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
          data-reveal="fade-up"
          data-reveal-stagger
        >
          {enabled.map((metric) => (
            <div key={metric.label} className="rule pt-8">
              <dd className="t-statement font-display text-ember tabular-nums">
                {metric.value.toLocaleString()}
                {metric.suffix ?? ""}
              </dd>
              <dt className="t-label text-neutral mt-3">{metric.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
