/**
 * Photographs supplied by JP for specific slots on the site (client update
 * doc, Oct 2026). Files live in public/media/site, resized from the camera
 * originals to a 2000px long edge.
 */
export type SitePhoto = { src: string; width: number; height: number; alt: string };

const p = (file: string, width: number, height: number, alt: string): SitePhoto => ({
  src: `/media/site/${file}`,
  width,
  height,
  alt,
});

export const sitePhotos = {
  jpLogo: p("jp-logo.png", 1254, 1254, "The Jeevan Productions JP monogram in gold on deep green."),
  ourStory: p(
    "our-story.jpeg",
    1434,
    1671,
    "A man in a light blue suit and navy shirt stands with his hands in his pockets, smiling, in a bright room.",
  ),
  acaGathering: p(
    "aca-gathering.jpeg",
    2000,
    1333,
    "A crowded room of guests standing and smiling together at an ACA Business Club gathering.",
  ),
  studioShoot: p(
    "studio-shoot.jpeg",
    2000,
    1125,
    "A videographer sets up a camera and ring light to film a man seated at a desk in a bright office.",
  ),
  acaStorefront: p(
    "aca-storefront.jpeg",
    2000,
    1333,
    "Two people talk outside the ACA Business Club building, its sign above a blue branded event tent.",
  ),
  banquetHall: p(
    "banquet-hall.jpeg",
    2000,
    1333,
    "Guests seated at round banquet tables in a large event hall, listening to a speaker.",
  ),
  togetherHome: p(
    "together-home.jpeg",
    2000,
    1333,
    "A family of four and their dog sit close together on the grass, smiling, under a blue sky.",
  ),
  togetherWork: p(
    "together-work.jpeg",
    2000,
    1333,
    "A family plays together on a grassy hill at golden hour, a dog running between them.",
  ),
  celebrationGroup: p(
    "celebration-group.jpeg",
    2000,
    1408,
    "A group of women in evening dresses pose together in front of a blue, white and gold balloon wall.",
  ),
  authorStage: p(
    "author-stage.jpeg",
    2000,
    1286,
    "A speaker presents at a podium in front of a red ACA Business Club backdrop reading 'using the right formula'.",
  ),
  theVows: p(
    "the-vows.jpeg",
    1730,
    2000,
    "A bride and groom share a kiss outdoors, the bride holding a bouquet.",
  ),
  stillWater: p(
    "still-water.jpeg",
    1333,
    2000,
    "A man holds a deep side-stretch yoga pose on a rock beside a lake, framed by leafy branches.",
  ),
  brandProduct: p(
    "brand-product.jpeg",
    2000,
    1333,
    "A styled product shot of a handheld gaming device, controllers and game cases on a white shelf.",
  ),
  runwayNight: p(
    "runway-night.jpeg",
    1333,
    2000,
    "A couple in evening wear arrive on a red carpet at night, the woman in a red gown and fur stole.",
  ),
  underStageLight: p(
    "under-stage-light.jpeg",
    2000,
    1333,
    "A band performs on stage under purple and teal lights, guitars and vocals out front.",
  ),
  centerStage: p(
    "center-stage.jpeg",
    2000,
    1949,
    "A man in a tuxedo speaks into a microphone on stage, gesturing to the audience.",
  ),
} as const;

/** Services page: per-project cover overrides for the "From the work" rows. */
export const serviceCovers: Record<string, SitePhoto> = {
  "author-portraits": sitePhotos.authorStage,
  "the-vows": sitePhotos.theVows,
  "still-water": sitePhotos.stillWater,
  "open-for-business": sitePhotos.brandProduct,
  "runway-night": sitePhotos.runwayNight,
  "under-stage-light": sitePhotos.underStageLight,
  "center-stage": sitePhotos.centerStage,
};
