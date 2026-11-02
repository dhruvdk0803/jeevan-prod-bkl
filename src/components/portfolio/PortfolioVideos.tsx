import { ShowcaseVideo } from "@/components/showcase/ShowcaseVideo";
import { showcaseVideos } from "@/content/showcase";

/**
 * The portfolio's Videos section: the landscape reel up top, then every
 * vertical film in one row. Sits between the dark opening and the photo wall.
 */
export function PortfolioVideos() {
  const landscape = showcaseVideos.filter((v) => v.orientation === "landscape");
  const portrait = showcaseVideos.filter((v) => v.orientation === "portrait");

  return (
    <section
      id="videos"
      aria-labelledby="videos-heading"
      className="on-dark bg-ink text-paper scroll-mt-[var(--nav-h)]"
      data-theme-dark
    >
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,11vw,9rem)]">
        <div className="mb-12">
          <p className="t-label text-ember-light mb-5">Videos</p>
          <h2 id="videos-heading" className="pf-act-title font-display">
            In motion.
          </h2>
        </div>

        <div className="space-y-[clamp(2.5rem,5vw,4rem)]">
          {landscape.map((video) => (
            // Capped so a 16:9 frame never runs taller than a laptop screen.
            <ShowcaseVideo key={video.id} video={video} className="max-w-[72rem]" />
          ))}
          <div className="grid grid-cols-2 gap-x-[clamp(1rem,2.5vw,2rem)] gap-y-[clamp(2.5rem,5vw,4rem)] sm:grid-cols-3 lg:grid-cols-5">
            {portrait.map((video) => (
              <ShowcaseVideo key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
