/**
 * WCAG contrast check for the palette's real text/surface pairings.
 * Run after any colour token change: node scripts/contrast.mjs
 */

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** Composite a translucent foreground over an opaque background. */
const over = (fg, bg, alpha) => {
  const [fr, fg_, fb] = hex(fg);
  const [br, bg_, bb] = hex(bg);
  const mix = (f, b) => Math.round(f * alpha + b * (1 - alpha));
  return (
    "#" +
    [mix(fr, br), mix(fg_, bg_), mix(fb, bb)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
};

const C = {
  ink: "#131319",
  ink2: "#24242d",
  ink3: "#3d3d48",
  paper: "#f4f1ec",
  paper2: "#ebe5dd",
  paperWarm: "#faf8f5",
  sand: "#eae2d6",
  ember: "#a83f25",
  emberDeep: "#7d2c18",
  emberLight: "#e9b9a4",
  neutral: "#6a6158",
  neutral2: "#b5aca4",
};

const surfaces = [
  ["paper", C.paper],
  ["paper-warm", C.paperWarm],
  ["paper-2", C.paper2],
  ["sand", C.sand],
];

const rows = [];

for (const [sName, s] of surfaces) {
  rows.push(["ember", C.ember, sName, s, 4.5]);
  rows.push(["ember-deep", C.emberDeep, sName, s, 4.5]);
  rows.push(["ink-3", C.ink3, sName, s, 4.5]);
  rows.push(["neutral", C.neutral, sName, s, 4.5]);
  rows.push(["ink/50 (large)", over(C.ink, s, 0.5), sName, s, 3]);
  rows.push(["border ink/50 (ui)", over(C.ink, s, 0.5), sName, s, 3]);
}

// On the dark surface
rows.push(["ember-light", C.emberLight, "ink", C.ink, 4.5]);
rows.push(["ember (WRONG on ink)", C.ember, "ink", C.ink, 4.5]);
rows.push(["paper/50", over(C.paper, C.ink, 0.5), "ink", C.ink, 4.5]);
rows.push(["paper/65", over(C.paper, C.ink, 0.65), "ink", C.ink, 4.5]);
rows.push(["paper/75", over(C.paper, C.ink, 0.75), "ink", C.ink, 4.5]);
rows.push(["border paper/40 (ui)", over(C.paper, C.ink, 0.4), "ink", C.ink, 3]);

// The nav pill is one translucent ink surface on every page. Its worst case is
// floating over the lightest background, so check the type against that.
const PILL_ALPHA = 0.82; // must match bg-ink/82 in Navigation.tsx
const pillOverPaper = over(C.ink, C.paper, PILL_ALPHA);
const pillOverPaperWarm = over(C.ink, C.paperWarm, PILL_ALPHA);
rows.push(["nav text paper", C.paper, "pill/paper", pillOverPaper, 4.5]);
rows.push(["nav text paper/70", over(C.paper, pillOverPaper, 0.7), "pill/paper", pillOverPaper, 4.5]);
rows.push(["nav text paper", C.paper, "pill/paper-warm", pillOverPaperWarm, 4.5]);
rows.push(["nav ember-light", C.emberLight, "pill/paper", pillOverPaper, 4.5]);

// Focus ring must be visible on both surfaces
rows.push(["focus ring ember", C.ember, "paper", C.paper, 3]);
rows.push(["focus ring ember-light", C.emberLight, "ink", C.ink, 3]);

let fails = 0;
console.log("fg".padEnd(24) + "bg".padEnd(13) + "ratio   need   result");
console.log("-".repeat(62));
for (const [fgName, fg, bgName, bg, need] of rows) {
  const r = ratio(fg, bg);
  const ok = r >= need;
  const expectedFail = fgName.includes("WRONG");
  if (!ok && !expectedFail) fails++;
  console.log(
    fgName.padEnd(24) +
      bgName.padEnd(13) +
      r.toFixed(2).padStart(5) +
      need.toFixed(1).padStart(7) +
      "   " +
      (ok ? "PASS" : expectedFail ? "fails (expected — never use this)" : "FAIL"),
  );
}

console.log(`\n=== ${fails} contrast failures ===`);
process.exit(fails ? 1 : 0);
