/**
 * Confirms the prerendered HTML carries real content inside <main> — i.e. the
 * site is readable without executing JavaScript. Guards against content being
 * stranded in a React streaming placeholder behind a Suspense fallback.
 */

const base = process.argv[2] ?? "http://localhost:3100";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 0; i < 40; i++) {
  try {
    const r = await fetch(base + "/");
    if (r.ok) break;
  } catch {
    /* server not up yet */
  }
  await wait(1000);
}

const ROUTES = [
  "/", "/does-not-exist", "/work", "/work/center-stage", "/services",
  "/about", "/impact", "/social-hours", "/careers", "/contact",
];

let bad = 0;

for (const p of ROUTES) {
  const r = await fetch(base + p);
  const html = await r.text();
  const main = html.match(/<main[\s\S]*?<\/main>/);
  const text = (main ? main[0] : "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const streamHoles = (html.match(/<div hidden id="S:/g) ?? []).length;
  const words = text ? text.split(" ").length : 0;
  const ok = words > 40;
  if (!ok) bad++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${p.padEnd(22)} words=${String(words).padStart(4)}  streamPlaceholders=${streamHoles}`,
  );
  if (!ok) console.log(`      main text: "${text.slice(0, 120)}"`);
}

console.log(`\n=== ${bad} routes without inline SSR content ===`);
process.exit(bad ? 1 : 0);
