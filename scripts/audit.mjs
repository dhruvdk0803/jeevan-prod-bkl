/**
 * Static QA sweep over the rendered HTML of every route.
 *
 * Deliberately server-side: it fetches the real SSR output, so it checks what
 * search engines and no-JS visitors actually receive — headings, alt text,
 * metadata, link integrity — rather than the post-hydration DOM.
 *
 * Usage: node scripts/audit.mjs [baseUrl]
 */

const base = process.argv[2] ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/work",
  "/work/author-portraits",
  "/work/center-stage",
  "/services",
  "/about",
  "/impact",
  "/social-hours",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
  // CMS-driven; individual posts are dynamic, so the index stands in for them.
  "/blog",
];

const BANNED = [
  "lorem ipsum",
  "innovative solutions",
  "cutting-edge",
  "unlock your potential",
  "360-degree",
  "we leverage",
  "results-driven",
  "one-stop shop",
  "elevate your brand",
  "in today's fast-paced world",
  "undefined",
  "NaN",
  "[object Object]",
];

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const all = (html, re) => [...html.matchAll(re)];

let failures = 0;
let warnings = 0;
const internalLinks = new Set();

const fail = (route, msg) => {
  failures++;
  console.log(`  FAIL  ${route}  ${msg}`);
};
const warn = (route, msg) => {
  warnings++;
  console.log(`  warn  ${route}  ${msg}`);
};

for (const route of ROUTES) {
  const res = await fetch(base + route);
  const html = await res.text();

  console.log(`\n${route}  [${res.status}]`);

  if (res.status !== 200) {
    fail(route, `status ${res.status}`);
    continue;
  }

  /* ---- headings ---- */
  const h1s = all(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1s.length === 0) fail(route, "no <h1>");
  if (h1s.length > 1) fail(route, `${h1s.length} <h1> elements`);
  else console.log(`  h1: "${strip(h1s[0][1]).slice(0, 70)}"`);

  const levels = all(html, /<h([1-6])\b/gi).map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      warn(route, `heading jump h${levels[i - 1]} -> h${levels[i]}`);
      break;
    }
  }

  /* ---- images ---- */
  const imgs = all(html, /<img\b[^>]*>/gi).map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt=/.test(t));
  if (noAlt.length) fail(route, `${noAlt.length} <img> without alt`);
  const noSizes = imgs.filter((t) => !/\ssizes=/.test(t) && !/\swidth=/.test(t));
  if (noSizes.length) warn(route, `${noSizes.length} <img> without sizes/width`);
  console.log(`  images: ${imgs.length}`);

  /* ---- metadata ---- */
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1];
  const og = html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1];
  if (!title) fail(route, "no <title>");
  if (!desc) fail(route, "no meta description");
  else if (desc.length < 70 || desc.length > 185)
    warn(route, `description length ${desc.length}`);
  if (!canon) fail(route, "no canonical");
  if (!og) warn(route, "no og:title");

  /* ---- structured data ---- */
  const ld = all(html, /application\/ld\+json"[^>]*>([\s\S]*?)</gi);
  for (const [, raw] of ld) {
    try {
      const parsed = JSON.parse(raw);
      const s = JSON.stringify(parsed);
      if (/aggregateRating|"review"/i.test(s))
        fail(route, "fabricated review/rating schema present");
    } catch {
      fail(route, "invalid JSON-LD");
    }
  }
  console.log(`  json-ld blocks: ${ld.length}`);

  /* ---- language hygiene ---- */
  const text = strip(html).toLowerCase();
  for (const phrase of BANNED) {
    if (text.includes(phrase.toLowerCase())) fail(route, `banned text: "${phrase}"`);
  }

  /* ---- links ---- */
  const hrefs = all(html, /href="([^"]+)"/gi).map((m) => m[1]);
  const dead = hrefs.filter((h) => h === "#" || h === "" || h.includes("undefined"));
  if (dead.length) fail(route, `${dead.length} placeholder href`);
  hrefs
    .filter((h) => h.startsWith("/") && !h.startsWith("//") && !/\.(ico|png|jpe?g|svg|xml|webmanifest|txt)$/.test(h))
    .forEach((h) => internalLinks.add(h.split("#")[0] || "/"));

  /* ---- landmarks / a11y basics ---- */
  if (!/<main\b/.test(html)) fail(route, "no <main>");
  if (!/lang="en"/.test(html)) fail(route, "no lang on <html>");
  const buttonsNoText = all(html, /<button\b[^>]*>\s*<\/button>/gi);
  if (buttonsNoText.length) fail(route, `${buttonsNoText.length} empty <button>`);

  /* ---- content sanity ---- */
  const words = strip(html).split(" ").length;
  if (words < 120) warn(route, `thin content (${words} words)`);
}

/* ---- every internal link must resolve ---- */
console.log("\n--- internal link check ---");
for (const link of [...internalLinks].sort()) {
  const res = await fetch(base + link, { method: "GET" });
  if (res.status !== 200) {
    failures++;
    console.log(`  FAIL  ${link} -> ${res.status}`);
  }
}
console.log(`  checked ${internalLinks.size} unique internal links`);

/* ---- SEO endpoints ---- */
console.log("\n--- endpoints ---");
for (const p of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/opengraph-image"]) {
  const res = await fetch(base + p);
  console.log(`  ${p} -> ${res.status}`);
  if (res.status !== 200) failures++;
}

console.log(`\n=== ${failures} failures, ${warnings} warnings ===`);
process.exit(failures ? 1 : 0);
