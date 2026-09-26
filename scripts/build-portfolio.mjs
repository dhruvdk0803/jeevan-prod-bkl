/**
 * Portfolio image pipeline — `npm run portfolio:build`.
 *
 * Reads JP's original camera files from ../media-source/portfolio (kept OUT
 * of the repo — ~11 MB each) and writes web renditions + a manifest:
 *
 *   public/media/portfolio/sm/pNNN.webp   480px long edge  — WebGL textures, wall
 *   public/media/portfolio/md/pNNN.webp  1200px long edge  — chapters, grid
 *   public/media/portfolio/lg/pNNN.webp  2200px long edge  — fullscreen viewer
 *   src/content/portfolio-manifest.json   dimensions, blur placeholder, colour
 *
 * Idempotent: existing renditions are skipped, so re-running after adding new
 * photos only processes the new ones. `pNNN` is the file's position in the
 * source folder (the numeric prefix the download step adds), so ids are stable.
 *
 * Optional: `--sheets <dir>` also writes numbered contact sheets for review.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.resolve(ROOT, "..", "media-source", "portfolio");
const OUT = path.join(ROOT, "public", "media", "portfolio");
const MANIFEST = path.join(ROOT, "src", "content", "portfolio-manifest.json");

const SIZES = [
  { dir: "sm", edge: 480, quality: 70 },
  { dir: "md", edge: 1200, quality: 74 },
  { dir: "lg", edge: 2200, quality: 78 },
];

const sheetsArg = process.argv.indexOf("--sheets");
const SHEETS_DIR = sheetsArg > -1 ? process.argv[sheetsArg + 1] : null;

sharp.concurrency(4);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function processOne(file) {
  const m = file.match(/^(\d{3})__/);
  if (!m) return null;
  const id = `p${m[1]}`;
  const input = path.join(SRC, file);

  // Normalise orientation once; everything downstream reads rotated pixels.
  const base = sharp(input, { failOn: "none" }).rotate();
  const meta = await base.clone().metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  for (const s of SIZES) {
    const out = path.join(OUT, s.dir, `${id}.webp`);
    if (await exists(out)) continue;
    await base
      .clone()
      .resize({ width: s.edge, height: s.edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: s.quality, effort: 5 })
      .toFile(out);
  }

  const tiny = await base.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  const { dominant } = await base.clone().resize(64, 64, { fit: "inside" }).stats();
  const hex = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

  return {
    id,
    source: file.slice(5),
    width,
    height,
    orientation: width > height * 1.05 ? "landscape" : height > width * 1.05 ? "portrait" : "square",
    blur: `data:image/webp;base64,${tiny.toString("base64")}`,
    color: hex,
  };
}

async function contactSheets(entries) {
  await fs.mkdir(SHEETS_DIR, { recursive: true });
  const COLS = 6;
  const PER = 30;
  const CELL = 260;
  for (let s = 0; s * PER < entries.length; s++) {
    const chunk = entries.slice(s * PER, s * PER + PER);
    const rows = Math.ceil(chunk.length / COLS);
    const composites = [];
    for (let i = 0; i < chunk.length; i++) {
      const e = chunk[i];
      const img = await sharp(path.join(OUT, "sm", `${e.id}.webp`))
        .resize(CELL, CELL - 24, { fit: "contain", background: "#111" })
        .toBuffer();
      const label = Buffer.from(
        `<svg width="${CELL}" height="24"><rect width="100%" height="100%" fill="#111"/><text x="6" y="17" font-family="monospace" font-size="15" fill="#fff">${e.id}</text></svg>`,
      );
      const x = (i % COLS) * CELL;
      const y = Math.floor(i / COLS) * CELL;
      composites.push({ input: label, left: x, top: y }, { input: img, left: x, top: y + 24 });
    }
    await sharp({ create: { width: COLS * CELL, height: rows * CELL, channels: 3, background: "#111" } })
      .composite(composites)
      .jpeg({ quality: 70 })
      .toFile(path.join(SHEETS_DIR, `sheet-${String(s + 1).padStart(2, "0")}.jpg`));
  }
}

async function main() {
  for (const s of SIZES) await fs.mkdir(path.join(OUT, s.dir), { recursive: true });
  const files = (await fs.readdir(SRC)).filter((f) => /\.(jpe?g)$/i.test(f)).sort();

  const previous = (await exists(MANIFEST)) ? JSON.parse(await fs.readFile(MANIFEST, "utf8")) : [];
  const known = new Map(previous.map((e) => [e.id, e]));

  const entries = [];
  let done = 0;
  for (const file of files) {
    try {
      const e = await processOne(file);
      // Keep any hand-written fields (alt, chapter…) from an earlier manifest.
      if (e) entries.push({ ...known.get(e.id), ...e, ...pick(known.get(e.id)) });
    } catch (err) {
      console.warn(`skip ${file}: ${err.message}`);
    }
    if (++done % 25 === 0) console.log(`${done}/${files.length}`);
  }
  entries.sort((a, b) => a.id.localeCompare(b.id));
  await fs.writeFile(MANIFEST, JSON.stringify(entries, null, 2) + "\n");
  console.log(`manifest: ${entries.length} images → ${path.relative(ROOT, MANIFEST)}`);
  if (SHEETS_DIR) await contactSheets(entries);
}

/** Editorial fields that must survive a rebuild. */
function pick(e) {
  if (!e) return {};
  const { alt, chapter, featured, caption } = e;
  return Object.fromEntries(Object.entries({ alt, chapter, featured, caption }).filter(([, v]) => v !== undefined));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
