import type { Metadata } from "next";
import { CTASection } from "@/components/primitives/Actions";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PortfolioStory } from "@/components/portfolio/PortfolioStory";
import {
  activeChapters,
  imagesByChapter,
  portfolio,
  portfolioSrc,
  type PortfolioImage,
} from "@/content/portfolio";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, jsonLd } from "@/lib/schema";
import { site } from "@/content/site";
import "./portfolio.css";

/**
 * /portfolio — JP's photography told as a film in acts.
 *
 *   Opening   WebGL corridor of frames you fly through on scroll
 *   Contents  the acts, with a floating preview
 *   Acts      per chapter: aperture reveal → pinned horizontal reel
 *   Wall      every frame, filterable, with a fullscreen viewer
 *
 * All selection happens here on the server so the client receives only the
 * data each piece needs.
 */

const TITLE = "Portfolio";
const DESCRIPTION =
  "Jeevan Productions' photography portfolio — stage, evening events, gatherings, weddings, portraits, families, places and details, from a San Diego creative company.";

export async function generateMetadata(): Promise<Metadata> {
  const cover = pickCover(portfolio);
  return buildMetadata({
    path: "/portfolio",
    title: TITLE,
    description: DESCRIPTION,
    images: cover
      ? [{ url: portfolioSrc(cover.id, "lg"), width: cover.width, height: cover.height, alt: cover.alt }]
      : undefined,
  });
}

/** Landscape featured frame first (reads best full-bleed), else any frame. */
function pickCover(images: PortfolioImage[]) {
  return (
    images.find((i) => i.featured && i.orientation === "landscape") ??
    images.find((i) => i.orientation === "landscape") ??
    images[0]
  );
}

/** Round-robin across acts so the corridor never shows one kind of work for long. */
function interleave(groups: PortfolioImage[][], limit: number) {
  const out: PortfolioImage[] = [];
  for (let i = 0; out.length < limit; i++) {
    let added = false;
    for (const g of groups) {
      if (g[i]) {
        out.push(g[i]);
        added = true;
        if (out.length === limit) break;
      }
    }
    if (!added) break;
  }
  return out;
}

const REEL_MAX = 8;
const TUNNEL_FRAMES = 36;

export default function PortfolioPage() {
  const acts = activeChapters.map((chapter) => {
    const all = imagesByChapter(chapter.id);
    const featured = all.filter((i) => i.featured);
    const cover = pickCover(featured.length ? featured : all);
    const pool = (featured.length >= 4 ? featured : all).filter((i) => i.id !== cover.id);
    return { chapter, cover, reel: pool.slice(0, REEL_MAX), total: all.length };
  });

  const tunnel = interleave(
    acts.map((a) => {
      const all = imagesByChapter(a.chapter.id);
      const featured = all.filter((i) => i.featured);
      return [...featured, ...all.filter((i) => !i.featured)];
    }),
    TUNNEL_FRAMES,
  ).map(({ id, width, height, color, alt }) => ({ id, width, height, color, alt }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          collectionPageSchema({ name: `${site.name} — ${TITLE}`, description: DESCRIPTION, path: "/portfolio" }),
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: TITLE, href: "/portfolio" },
          ]),
        ])}
      />

      <PortfolioHero frames={tunnel} total={portfolio.length} actCount={acts.length} />

      {portfolio.length ? (
        <PortfolioStory acts={acts} images={portfolio} chapters={activeChapters} />
      ) : null}

      <CTASection
        eyebrow="Your story next"
        lines={["Let's make", "the next frame yours."]}
        body="Tell us about the day, the brand or the room you want remembered."
      />
    </>
  );
}
