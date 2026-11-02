import { AnimatedHeading } from "@/components/primitives/Type";
import { MediaReveal } from "@/components/primitives/Media";
import { ArrowLink } from "@/components/primitives/Actions";
import { ShowcaseVideo } from "@/components/showcase/ShowcaseVideo";
import { showcasePhotos, showcaseVideos } from "@/content/showcase";

/**
 * Homepage "Selected work": JP's own films and photographs.
 *
 *   Row 1  the landscape behind-the-scenes reel beside the Gael's menu collage
 *   Row 2  the five vertical films (testimonials, social, branded)
 *   Row 3  four event photographs at their native 3:2
 */
export function SelectedWork() {
  const [reel, ...verticals] = [
    ...showcaseVideos.filter((v) => v.orientation === "landscape"),
    ...showcaseVideos.filter((v) => v.orientation === "portrait"),
  ];
  const [collage, ...events] = showcasePhotos;

  return (
    <section className="bg-paper-warm" aria-labelledby="work-heading">
      <div className="gutter mx-auto max-w-[110rem] py-[clamp(5rem,12vw,10rem)]">
        <div className="mb-[clamp(3rem,7vw,5.5rem)] flex flex-wrap items-end justify-between gap-8">
          <AnimatedHeading id="work-heading" size="statement" lines={["Selected work"]} />
          <div data-reveal="fade-up">
            <ArrowLink href="/portfolio">See the full portfolio</ArrowLink>
          </div>
        </div>

        <div className="grid items-start gap-x-[clamp(1rem,2.5vw,2rem)] gap-y-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-12">
          <ShowcaseVideo video={reel} className="lg:col-span-8" />
          <MediaReveal
            src={collage.src}
            alt={collage.alt}
            ratio="4/5"
            sizes="(max-width: 1024px) 100vw, 30vw"
            quality={82}
            className="max-w-[30rem] lg:col-span-4 lg:max-w-none"
          />
        </div>

        <div className="mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 gap-x-[clamp(1rem,2.5vw,2rem)] gap-y-[clamp(2.5rem,5vw,4rem)] sm:grid-cols-3 lg:grid-cols-5">
          {verticals.map((video) => (
            <ShowcaseVideo key={video.id} video={video} />
          ))}
        </div>

        <div className="mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 gap-[clamp(1rem,2.5vw,2rem)] lg:grid-cols-4">
          {events.map((photo) => (
            <MediaReveal
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              ratio="3/2"
              sizes="(max-width: 1024px) 50vw, 25vw"
              quality={82}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
