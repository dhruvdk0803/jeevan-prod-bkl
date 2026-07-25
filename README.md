# Jeevan Productions

A redesign and rebuild of jeevanproductions.com as a premium editorial site
organised around three ideas: **Stories** (media), **Brands** (marketing) and
**Experiences** (events).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # full static prerender
npm run audit        # HTML QA sweep: headings, alt, metadata, links, banned copy
npm run audit:perf   # image loading + payload sweep
npm run audit:ssr    # asserts every page is readable without JavaScript
npm run audit:contrast  # WCAG ratios for every palette pairing (no server needed)
```

The audit scripts take an optional base URL and expect a running server:
`npm run audit -- http://localhost:3000`.

---

## Architecture

```
src/
  app/            routes (App Router, all statically prerendered)
  components/
    layout/       Navigation, Footer, Cursor
    primitives/   Type, Media, Actions, ProjectCard  <- use these, don't reinvent
    home/ work/ about/ services/ impact/ events/ careers/ contact/ forms/
  content/        the CMS layer - typed collections, no hard-coded page content
  lib/            motion runtime, schema.org helpers, form security
public/media/     real JP photography (48 files, pulled from the live site)
```

Reference docs in the repo root:

| File | What it's for |
|---|---|
| `DESIGN-BRIEF.md` | The build contract - design system, motion API, rules |
| `NEEDS-FROM-CLIENT.md` | **Everything JP must supply or confirm before launch** |
| `NEXT16-NOTES.md` | Next.js 16 API notes (this version has breaking changes) |
| `research/content-inventory.md` | Every verified fact extracted from the old site |

---

## The content layer

Nothing user-facing is hard-coded in a page. Every page reads from
`src/content/`, which is shaped by `src/content/types.ts`:

`Project` / `CaseStudy` / `Service` / `ImpactStory` / `Spotlight` /
`ImpactMetric` / `TeamMember` / `JPEvent` / `Partner` / `Testimonial` /
`JobOpening`

Moving to a headless CMS (Sanity, Payload, Contentful) means replacing the data
source behind these types. Consumers import from `@/content` and never change.

### Factual integrity

The site deliberately ships several **empty collections**, because the research
pass could not verify the underlying facts:

| Collection | State | Why |
|---|---|---|
| `publishedImpactStories` | empty | No community stories are published anywhere by JP |
| `spotlights` | all draft | The program doesn't exist yet |
| `impactMetrics` | all `enabled: false` | No real numbers exist - the module hides itself entirely |
| `upcomingEvents` | empty | Listings live on JP's Eventbrite |
| `openings` | empty | No verified job postings |
| `testimonials` | empty | The old site's testimonial widget is disabled |
| `partners` | all `verified: false` | Carried from JP's own slider; attribution not yet cleared |

Each of these renders a **designed empty state**, not a broken layout, and each
starts working the moment real content is added. Nothing on this site claims a
client, award, statistic, partnership or outcome that isn't verifiable.

`SHOW_PARTNERS` in `src/content/partners.ts` is a one-line kill switch for the
partner logo marquee.

---

## Motion

One runtime (`src/lib/motion.tsx`), driven by data attributes so pages stay
server components and ship almost no JS:

```tsx
<div data-reveal="fade-up">           <div data-reveal="fade-up" data-reveal-stagger>
<h2 data-reveal="mask">               <figure data-reveal="media">
<div data-parallax="0.12">            <section data-theme-dark>
```

GSAP + Lenis are dynamically imported and never load for users with
`prefers-reduced-motion: reduce`. Pre-animation states live behind a
`.js-motion` class applied by a blocking head script (so nothing flashes) with
a 2.5s failsafe that removes it if the runtime never boots - a JS failure can
never leave content invisible.

---

## Going live

1. **Read `NEEDS-FROM-CLIENT.md`** and resolve the "Confirm Before Publish" list.
2. Set the environment variables in `.env.example`:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` - bot protection.
     Without the secret, form submission **fails closed in production**.
   - `APPLICATION_WEBHOOK_URL` / `ENQUIRY_WEBHOOK_URL` - where submissions go.
     `deliverApplication()` and `deliverEnquiry()` in the two `actions.ts` files
     are the single hand-off points; wire your ATS/CRM there.
3. Replace the in-memory rate limiter in `src/lib/form-security.ts` with a
   shared store (Redis/Upstash) if running more than one instance.
4. Resume uploads are validated (MIME + extension + magic bytes, 5 MB cap,
   sanitised filename) and are **never written to `public/`**. Point them at
   private storage.

## Verification

Last full pass: **0 failures, 0 warnings** across all three audits.

- `npm run build` - 19 routes, every one prerendered as static HTML
- `npm run audit` - headings, alt text, metadata, canonicals, JSON-LD validity,
  banned copy, internal link integrity across every route
- `npm run audit:ssr` - every page's content is in the HTML, not behind a
  client-side stream swap. (There is deliberately **no root `loading.tsx`**:
  on a fully static site it added a Suspense boundary that pushed all page
  content into a JS-dependent placeholder, which hurt SEO and no-JS readers
  for no benefit.)
- One preloaded LCP image per page; every other image lazy with real `sizes`
- Contrast verified by computation, not eye: all text ≥ 4.5:1, large text and
  UI borders ≥ 3:1. Ember clears 4.5:1 on *all four* light surfaces (min
  4.80:1) so it is never conditionally safe.
- No horizontal overflow at 360 / 390 / 430 / 768 / 1024 / 1280 / 1440
- No third-party requests: fonts self-hosted, no CDN, no trackers, no analytics
- GSAP + ScrollTrigger (69 KB) is a separate lazy chunk and never loads for
  visitors with `prefers-reduced-motion: reduce`
