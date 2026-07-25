# Jeevan Productions — Build Contract

Read this in full before writing any component. Every page must obey it.

---

## 1. What this site is

Jeevan Productions is a San Diego creative company working across **media,
marketing and events**. The redesign organises everything around three worlds:

| # | World | Discipline | Core idea |
|---|-------|-----------|-----------|
| 01 | **Stories** | Media | We tell stories worth remembering. |
| 02 | **Brands** | Marketing | We build brands people want to connect with. |
| 03 | **Experiences** | Events | We create experiences that bring people together. |

The site should feel like a premium film studio crossed with an editorial
magazine. Cinematic, warm, human, confident, culturally aware. **Not** a SaaS
landing page, not a rounded-card agency template.

---

## 2. Absolute rules

1. **Never invent facts.** No clients, awards, statistics, testimonials, dates,
   outcomes, partnerships or history beyond what is already in `src/content/`.
   If a collection is empty, design a genuine, well-crafted **empty state** —
   do not fill the gap with invented content.
2. **No lorem ipsum. Ever.**
3. **Render only what exists.** `client`, `year`, `location`, `outcome` and
   `quote` fields are frequently absent by design — always guard with a
   conditional. Never print "undefined" or an empty label.
4. Do **not** edit `src/content/**`, `globals.css`, `src/lib/motion.tsx`,
   `layout.tsx`, `Navigation.tsx`, or `Footer.tsx`. They are shared contracts.
   If you need something they don't provide, add a *new* file instead.

---

## 3. Motion — declarative, not per-component

There is ONE animation runtime (`src/lib/motion.tsx`). Pages stay **server
components** and opt in with attributes. Do **not** write `useEffect` GSAP
code, do not import gsap in a page, do not add `"use client"` unless the
component genuinely needs interactivity (state, event handlers).

```tsx
<div data-reveal="fade-up">…</div>                      // fade + rise
<div data-reveal="fade-up" data-reveal-stagger>…</div>   // stagger direct children
<div data-reveal="fade">…</div>                          // opacity only
<figure data-reveal="media">…</figure>                   // clip wipe + scale settle
<h2 data-reveal="mask">                                  // line-by-line reveal
  <span className="line-mask"><span>First line</span></span>
  <span className="line-mask"><span>Second line</span></span>
</h2>
<div data-parallax="0.12">…</div>                        // subtle parallax
<section data-theme-dark>…</section>                     // marks a dark section
```

`data-reveal-delay={0.15}` staggers a group. Keep delays under ~0.3s.

Reduced motion is handled globally — you do not need to special-case it,
**but** any animation you write yourself in CSS must be wrapped in a
`@media (prefers-reduced-motion: reduce)` escape.

---

## 4. Primitives — use these, don't reinvent

```tsx
import { AnimatedHeading, Label, IndexLabel, SectionIntro } from "@/components/primitives/Type";
import { MediaReveal, CinematicBand } from "@/components/primitives/Media";
import { Button, ArrowLink, Arrow, CTASection } from "@/components/primitives/Actions";
import { ProjectCard, ProjectRhythm } from "@/components/primitives/ProjectCard";
```

- `AnimatedHeading lines={["First line", "Second line"]}` — pass explicit lines;
  the art direction decides where lines break.
- `SectionIntro eyebrow lines children` — the standard section opener.
- `MediaReveal` — **the only way to render an image.** `sizes` is required.
  Set `priority` on exactly one image per page (the LCP hero).
- `CinematicBand` — full-bleed dark image section for rhythm breaks.
- `CTASection` — the closing CTA. **Every page ends with one** (except where a
  page specifies otherwise).
- `data-cursor="View"` on a media element shows the custom cursor label. Use
  sparingly: `View`, `Play`, `Explore`, `Next`.

---

## 5. Design system

**Type classes** (already fluid via `clamp()`, defined in `globals.css`):
`t-hero`, `t-statement`, `t-h2`, `t-h3`, `t-lead`, `t-body`, `t-label`.
Headings automatically use the display serif (Fraunces). `t-label` is the small
uppercase tracked label used everywhere as connective tissue.

**Colours** (Tailwind tokens): `ink`, `ink-2`, `ink-3`, `paper`, `paper-2`,
`paper-warm`, `sand`, `ember`, `ember-deep`, `ember-light`, `neutral`,
`neutral-2`.

The site is **essentially monochrome**. Warm paper and deep ink carry it; the
photography supplies all the real colour.

- Light sections: `bg-paper` / `bg-paper-warm` / `bg-sand`, text `ink`.
- Dark sections: `bg-ink` + `text-paper` + `className="on-dark"` + `data-theme-dark`.
- `ember` is the **only** accent, and only at small scale: eyebrow labels,
  hover states, the active nav underline, hairline marks. Never a large
  background fill, never a gradient, never body copy.
- On the dark surface use `ember-light`. Plain `ember` on `bg-ink` is only
  3.0:1 and must never be used there — `npm run audit:contrast` asserts this.

**Navigation** is a floating frosted pill using one translucent ink surface
(`bg-ink/82`) with light type on *every* page — it never inverts based on what
is behind it. That is deliberate: the previous version resolved its colour in
an effect, so over the dark homepage hero it server-rendered dark-on-dark and
was invisible until hydration. If you change the pill opacity, update
`PILL_ALPHA` in `scripts/contrast.mjs` to match, or the check silently drifts.

**Layout**: `className="gutter mx-auto max-w-[110rem]"` is the standard
container. Section padding: `py-[clamp(5rem,12vw,10rem)]`. Use `rule` for hairline
dividers.

**Visual rhythm — the most important design rule.** Alternate section
types down every page. Never stack three similar sections in a row:
immersive media → typographic statement → editorial grid → quiet moment →
interactive → dark band. Vary background colour, density and alignment.
Asymmetry and generous whitespace over centred symmetry everywhere.

---

## 6. Imagery

All images live in `/media/`. **Every work photo is 4:5 portrait** — design for
that. Only `/media/brand/hero.jpeg` is landscape (1880×1105).

`src/content/photo-catalog.ts` has all 26 photos with accurate `alt`, `world`,
`discipline`, `mood` and `heroWorthy` flags. **Always use the catalog's real alt
text.** Never write your own description of a photo you haven't seen, and never
use a decorative placeholder image.

---

## 7. Accessibility (WCAG 2.2 AA — non-negotiable)

- Semantic landmarks and one `<h1>` per page; never skip heading levels.
- Every section that needs labelling: `aria-labelledby` pointing at its heading.
- Interactive targets ≥ 44px (`min-h-11`).
- Focus states are global — never add `outline-none`.
- Decorative SVG/overlays: `aria-hidden="true"`.
- Text on imagery must sit over a scrim (`overlay="strong"` / `"bottom"`) to
  hold contrast.
- No hover-only information on touch — anything revealed on hover must also be
  visible or reachable another way.

---

## 8. SEO — every page

```tsx
export const metadata: Metadata = {
  title: "…",                       // template appends "— Jeevan Productions"
  description: "…",                 // 140–160 chars, specific, no keyword stuffing
  alternates: { canonical: "/path" },
  openGraph: { title: "…", description: "…", url: "/path", type: "website" },
};
```

Add JSON-LD via helpers in `src/lib/schema.ts` (`breadcrumbSchema`,
`articleSchema`, `creativeWorkSchema`, `eventSchema`, `jobPostingSchema`).
**Never** emit review or rating schema.

---

## 9. Next.js 16 gotchas (this version differs from what you remember)

Full notes: `NEXT16-NOTES.md`. The ones that will bite you:

- `params` and `searchParams` are **Promises**: `const { slug } = await params;`
- `next/image` `priority` is deprecated → **`preload`** (already handled inside
  `MediaReveal`, so just use the primitive).
- Image `quality` must be one of the allowlisted `70 | 75 | 82`.
- `dynamic(..., { ssr: false })` cannot be called in a Server Component.
- `themeColor`/`viewport` go in `export const viewport`, not `metadata`.

---

## 10. Copy voice

Short. Human. Confident. Warm. Specific. Editorial. Let the photography carry
the emotion; keep copy lean.

**Banned:** "innovative solutions", "cutting-edge", "unlock your potential",
"360-degree", "we leverage", "results-driven", "one-stop shop", "seamlessly",
"elevate your brand", "passionate about", "in today's fast-paced world",
"we're not just a…, we're a…".

---

## 11. Definition of done

- `npx tsc --noEmit` passes.
- No horizontal overflow at 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px.
- Every image has real alt text; decorative ones are `aria-hidden`.
- Every link resolves to a real route. No `href="#"` placeholders.
- Page ends with `CTASection` (unless specified otherwise).
- Empty collections render a designed empty state, not a broken layout.
