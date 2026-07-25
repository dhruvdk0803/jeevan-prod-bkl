# Needs From Client

A checklist of everything Jeevan Productions must supply or confirm before this
redesign can go fully live. Grouped by urgency. File paths reference the
`src/content/*.ts` collections this blocks.

---

> **Two items block launch outright**: form delivery endpoints and Turnstile
> keys (both under Technical). Everything else degrades gracefully — the site
> is designed to ship with these gaps and improve as content arrives.

## Confirm Before Publish

- [ ] **Partner logo attribution rights** — `src/content/partners.ts` lists all
      17 logos from JP's own live "Partners Who Trust Us" slider
      (`src/content/photo-catalog.ts`'s `brandTiles`), but none of these
      relationships are independently verified. Confirm JP holds the right to
      display each name/logo (DA, Rewind Time, FusionMix, Dana's Events &
      Florals, Gaels, The KC Spa, WeCode/KC, Bright Skies Childcare, The
      Walker Foundation, Ice Studios, ACA Business Club, Jolie Maddox,
      Toastmasters International, Compass, Sonic, Cadillac, Hallmark) before
      publish. If any must be pulled, flip `SHOW_PARTNERS = false` in
      `partners.ts` or remove the individual entry.
- [ ] **Leadership team, current employment** — `src/content/team.ts` marks
      Divyanshu Dhakar, Pramod Prajapati, Piyush Dhaker, and Michael Gonzalez
      as `verified: false, status: "draft"` because their only source is a
      commented-out (never rendered) HTML block on jeevanproductions.com.
      Confirm current roles/titles, or provide replacements, before
      publishing the team page.
- [ ] **Kansas City vs. Palm Springs** — `src/content/site.ts` lists a
      Kansas City phone number `(816) 974-6089` alongside San Diego/LA, but
      JP's own Eventbrite organizer bio instead references Palm Springs as a
      third market. Confirm which is accurate before stating a third market
      anywhere on the site.
- [ ] **"Five decades of collective experience"** — used as marketing copy in
      the Our Story section (from the verbatim site copy). This is a
      team-wide aggregate claim, not independently checkable. Confirm JP
      wants to keep asserting it, and how it's meant to be read (sum of all
      staff careers, not company age).
- [ ] **Executive Assistant Support & Staffing services** — both exist only
      in commented-out HTML on the live site (not currently live) and are
      NOT included in `src/content/services.ts`. Confirm whether these are
      current offerings before adding them back.

## Assets Needed

- [ ] **Hero video / showreel** — no video asset exists in the verified
      catalog; the hero currently uses a static image
      (`/media/brand/hero.jpeg`, referenced in `site.ts`/world imagery).
- [ ] **Team portraits** — `src/content/team.ts` omits `photo` for every
      member; the commented-out `*-min.webp` headshot paths referenced in
      the research file were not confirmed to still exist.
- [ ] **Behind-the-scenes photography** — the current 26-photo catalog
      (`src/content/photo-catalog.ts`) is all finished/client-facing work;
      no BTS/process imagery exists for an "our process" style module.
- [ ] **Higher-resolution logo / SVG** — the only brand mark referenced in
      research is `images/LOADER.png`, a raster file. A vector logo is
      needed for crisp display across sizes (nav, favicon, print).
- [ ] **OG share image** — the live site has no `og:image` tag at all
      (confirmed by direct fetch). The redesign now generates one at
      `src/app/opengraph-image.tsx` (type-only, on brand). Optional: supply a
      photographic share image if JP prefers one over the typographic default.
- [ ] **Project client attribution** — every entry in `src/content/projects.ts`
      omits `client`, `year`, and `location` because no project in the photo
      catalog has confirmed client/date/location attribution. If JP can
      confirm any of these (e.g. the Depot #9 Saloon venue shoot, the
      Bright Skies Childcare ribbon-cutting), those fields can be added per
      project.

## Content Needed

- [ ] **Real impact stories** — `src/content/impact.ts`'s `impactStories`
      are all `status: "draft"` placeholders; `publishedImpactStories` is
      intentionally empty. Needs real, confirmed community/nonprofit work
      before the Impact page can show anything beyond an empty state.
- [ ] **Real testimonials** — `src/content/partners.ts`'s `testimonials`
      array is empty; the live site's Elfsight testimonials widget exists
      in markup but is disabled. Needs real, permissioned client quotes.
- [ ] **Current Eventbrite listings** — `src/content/events.ts` includes
      only one verified past event ("Afternoon Tea & Meaningful
      Connections," The Britannia Tearooms) as a format example;
      `upcomingEvents` is empty by design. Needs a live feed or manual sync
      from https://www.eventbrite.com/o/jeevan-productions-121470153411
      before the Social Hours / Events page can show real upcoming dates.
- [ ] **Job openings** — `src/content/careers.ts`'s `openings` array is
      empty on purpose (no roles verified anywhere). Needs real postings,
      or an explicit decision to keep the general-application-only state.
- [ ] **Impact metrics** — `src/content/impact.ts`'s `impactMetrics` are all
      `enabled: false` with `value: 0` (Businesses supported, Events hosted,
      Attendees, Volunteer hours, Pro bono projects). Needs real numbers
      before this module can render.

## Technical

- [ ] **Form delivery endpoints** *(blocks launch)* — the old site posted to
      `formsubmit.co` and its message `<textarea>` had no `name` attribute, so
      message text never actually submitted. The redesign replaces that with
      validated Server Actions. JP must set `ENQUIRY_WEBHOOK_URL` and
      `APPLICATION_WEBHOOK_URL` (see `.env.example`), or replace the bodies of
      `deliverEnquiry()` / `deliverApplication()` in
      `src/app/contact/actions.ts` and `src/app/careers/actions.ts` with a
      direct CRM/ATS call. Until then both fail with a descriptive error.
- [ ] **Turnstile keys** *(blocks launch)* — bot protection is implemented and
      verified server-side. Provision a Cloudflare Turnstile site/secret pair
      and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`.
      Without the secret, submissions **fail closed in production**.
- [ ] **Resume upload storage** — uploads are fully validated (MIME +
      extension + magic bytes, 5 MB cap, sanitised filename) and are never
      written to `public/`. JP still needs to nominate private storage
      (e.g. an S3 bucket or an ATS that accepts attachments) for the webhook
      to deliver into.
- [ ] **Rate limiting store** — `src/lib/form-security.ts` currently rate
      limits in memory, which only works on a single instance. Move it to
      Redis/Upstash if deploying more than one.
- [ ] **Analytics ID** — the live site uses Google Analytics property
      `G-XN8J010D84`. Confirm whether the redesign keeps this property or
      provisions a new one.
