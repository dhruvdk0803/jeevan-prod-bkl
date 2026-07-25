import type { Partner, Testimonial } from "./types";
import { brandTiles } from "./photo-catalog";

/**
 * ATTRIBUTION NOT YET CLEARED FOR PUBLICATION.
 * ---------------------------------------------------------------------
 * These 17 names are carried over directly from JP's own live "Partners Who
 * Trust Us" logo slider (the 17 legible tiles identified in
 * photo-catalog.ts's `brandTiles`). JP must confirm it holds attribution
 * rights to display each of these names/logos before this section goes
 * live — none of these relationships are independently verified beyond
 * "this logo currently appears in JP's own slider." `verified: false` is
 * set on every entry for that reason, and the `SHOW_PARTNERS` kill-switch
 * below exists so the whole section can be disabled in one edit if any
 * name needs to be pulled before or after publish.
 */
export const SHOW_PARTNERS = true;

export const partners: Partner[] = brandTiles.map((tile) => ({
  name: tile.name ?? "Unnamed partner",
  // href: omitted — no verified partner website/handle exists for these tiles.
  // All 17 tiles are square 200x200 source files (measured on disk). They are
  // low-resolution photo-crops of logos, not vector marks — JP should supply
  // proper SVG/transparent-PNG logos before publish. See NEEDS-FROM-CLIENT.md.
  logo: { src: tile.src, alt: tile.alt, width: 200, height: 200 },
  verified: false,
}));

/**
 * The current live site has no testimonials — its Elfsight testimonials
 * widget exists in the HTML but is disabled/not rendering, and no named
 * client quotes appear anywhere. Left empty rather than inventing quotes.
 */
export const testimonials: Testimonial[] = [];
