/**
 * Media + payload sanity check over the SSR HTML.
 *
 * Catches the two failure modes that actually hurt a media-heavy site:
 * over-eager image loading (many `preload`/`eager` images competing with the
 * LCP) and missing `sizes` (browser fetches a 3840px file for a thumbnail).
 */

const base = process.argv[2] ?? "http://localhost:3000";

const ROUTES = [
  "/", "/work", "/work/author-portraits", "/work/center-stage", "/services",
  "/about", "/impact", "/social-hours", "/careers", "/contact",
];

const all = (s, re) => [...s.matchAll(re)];
let problems = 0;

for (const route of ROUTES) {
  const html = await (await fetch(base + route)).text();
  const imgs = all(html, /<img\b[^>]*>/gi).map((m) => m[0]);

  const eager = imgs.filter((t) => /loading="eager"/.test(t));
  const lazy = imgs.filter((t) => /loading="lazy"/.test(t));
  const noSizes = imgs.filter((t) => !/\ssizes=/.test(t));
  const preloadLinks = all(html, /<link[^>]+rel="preload"[^>]*as="image"[^>]*>/gi);
  const fontPreloads = all(html, /<link[^>]+rel="preload"[^>]*as="font"[^>]*>/gi);

  const flag = (cond, msg) => {
    if (cond) {
      problems++;
      return `  FLAG ${msg}`;
    }
    return null;
  };

  const notes = [
    flag(eager.length > 1, `${eager.length} eager images (expect ≤1 LCP image)`),
    flag(preloadLinks.length > 1, `${preloadLinks.length} image preloads (expect ≤1)`),
    flag(noSizes.length > 0, `${noSizes.length} images missing sizes`),
    flag(fontPreloads.length > 4, `${fontPreloads.length} font preloads`),
  ].filter(Boolean);

  console.log(
    `${route.padEnd(26)} imgs=${String(imgs.length).padStart(3)}  eager=${eager.length}  lazy=${lazy.length}  preload=${preloadLinks.length}  fonts=${fontPreloads.length}  html=${(html.length / 1024).toFixed(0)}kb`,
  );
  notes.forEach((n) => console.log(n));
}

console.log(`\n=== ${problems} media flags ===`);
