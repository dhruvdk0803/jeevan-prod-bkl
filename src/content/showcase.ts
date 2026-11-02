/**
 * Client-supplied showcase media (November 2026 update): the films and
 * photographs behind the homepage "Selected work" section and the portfolio's
 * Videos section. Web renditions live in `public/media/showcase/`; the camera
 * originals stay out of the repo.
 */

export type ShowcaseVideo = {
  id: string;
  src: string;
  poster: string;
  title: string;
  /** Short line under the title. */
  kind: string;
  orientation: "landscape" | "portrait";
  /** Describes the opening frame for assistive tech. */
  alt: string;
};

export type ShowcasePhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const v = (
  id: string,
  title: string,
  kind: string,
  orientation: ShowcaseVideo["orientation"],
  alt: string,
): ShowcaseVideo => ({
  id,
  src: `/media/showcase/${id}.mp4`,
  poster: `/media/showcase/${id}-poster.jpg`,
  title,
  kind,
  orientation,
  alt,
});

export const showcaseVideos: ShowcaseVideo[] = [
  v(
    "bts-reel",
    "Behind the scenes",
    "Video production",
    "landscape",
    "A videographer frames an interview with a businessman seated at his office desk.",
  ),
  v(
    "kyle-review",
    "Kyle's story",
    "Client testimonial",
    "portrait",
    "Kyle smiles while speaking to camera in a testimonial video.",
  ),
  v(
    "gales",
    "Gael's Public House",
    "Social content",
    "portrait",
    "Guests chat around a patio table at Gael's Public House.",
  ),
  v(
    "bts-review",
    "In their words",
    "Client testimonial",
    "portrait",
    "A man in a lavender polo gestures toward the camera while giving a testimonial.",
  ),
  v(
    "spa",
    "Spa day",
    "Branded content",
    "portrait",
    "A spa guest relaxes as a therapist gives him a facial massage.",
  ),
  v(
    "bts-short",
    "On set",
    "Behind the scenes",
    "portrait",
    "A presenter sits at a desk in front of a blue studio backdrop with lights and a camera.",
  ),
];

export const showcasePhotos: ShowcasePhoto[] = [
  {
    src: "/media/showcase/photo-1.jpg",
    width: 1080,
    height: 1350,
    alt: "A menu collage for Gael's Public House and Sports Bar: plated dishes, cocktails, tacos and the bar interior.",
  },
  {
    src: "/media/showcase/photo-2.jpg",
    width: 2000,
    height: 1333,
    alt: "A row of colourful martinis lined up along a polished wooden bar.",
  },
  {
    src: "/media/showcase/photo-3.jpg",
    width: 2000,
    height: 1333,
    alt: "A youth dance troupe in green and yellow performs on a stage lit in pink and purple.",
  },
  {
    src: "/media/showcase/photo-4.jpg",
    width: 2000,
    height: 1333,
    alt: "Guests share a meal at a long table under a white tent at an outdoor community event.",
  },
  {
    src: "/media/showcase/photo-5.jpg",
    width: 2000,
    height: 1333,
    alt: "A large group poses together in front of a pink balloon arch at an evening celebration.",
  },
];
