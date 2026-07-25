# Jeevan Productions — Content & Asset Inventory
Source: https://jeevanproductions.com/ (fetched 2026-07-25). Site is a **single-page site** — "Services," "Events," "Our Story," and "Contact" are `#anchor` sections on the homepage, not separate URLs. `/services`, `/events`, `/our-story`, `/contact`, `/about`, and their `.html` variants all return 404. `https://www.jeevanproductions.com/Events` (capital E, on the `www` host) resolves and shows the same homepage content.

---

## Positioning & Taglines
- Hero H1: **"Creativity is Our Identity."**
- Hero subhead: **"Serving San Diego."**
- Preloader tagline: "Creativity Is Our Identity."
- Services section heading: **"Built for Brands That Think Different"**
- Media portfolio slider heading: **"Connect. Engage. Inspire."**
- Brand slider heading: **"Partners Who Trust Us"**
- Contact heading: **"Let's Connect!"**
- Footer line: **"Creative media, storytelling, and strategy built for brands that want more."**
- Footer copyright: "powered by Jeevan Productions LLC. © 2025 All Rights Reserved."
- Meta/OG description (Google-facing, mentions LA not SD): "Jeevan Productions — a full-service creative agency delivering marketing, advertising, social media, website design, content & video production, business consulting, and live & virtual event production across Los Angeles."

## Company Story (verbatim, from "Our Story" / `#Story` section)
> Jeevan Productions was built on the belief that every brand has a story worth telling with clarity, creativity, and purpose. Founded by strategist Jeevan Dhaker, the agency brings together over five decades of collective experience in strategy, storytelling, and execution.
>
> We do not just market; we create meaning. Every campaign, design, and event begins with understanding who you are, what you stand for, and how you want to be remembered. Our process transforms intention into impact through branding that defines, marketing that connects, content that inspires, and events that move people.
>
> From visuals to voices, from on-site teams to strategic direction, everything we do follows one idea: make it matter. At Jeevan Productions, your brand is not just promoted. It is elevated, experienced, and remembered.
>
> Book your in-person consultation today. Call (310) 363-0288 to schedule your appointment.

Accompanying image: `images/Story.png`.

**No testimonials or named client quotes appear anywhere on the live page.** A commented-out `<!-- -->` block references an Elfsight testimonials widget (`elfsight-app-afafa05f-def8-4918-af76-59057e0c7fc4`) that is currently disabled/not rendering.

## Services (verbatim, from `#services` section — heading "Built for Brands That Think Different")

**Media**
> We produce high-quality Photography & Videography that highlight your brand's story, services, and personality built to captivate your audience and create a lasting visual impression online and offline.

CTA: "Know More" → `href="Media"` (broken/placeholder link, target="_blank", no such page exists)

**Marketing**
> Our marketing solutions cover Social Media, Ads, Email, Direct Mail, Graphic Design, and Event Marketing, Consulting, all crafted to boost visibility, drive engagement, and deliver results that help brands grow with confidence.

CTA: "Know More" → `href="Marketing"` (broken/placeholder link)

**Events**
> From planning to production, we deliver seamless event experiences covering Logistics, Coordination, Design, Execution, and Event Marketing, creating meaningful connections and memorable moments for every occasion.

CTA: "Know More" → `href="Events"` (broken/placeholder link)

*Note:* A fourth service box, "Executive Assistant Support" (scheduling/communication/admin support), and a fifth, "Staffing" (on-site & virtual staffing for events/campaigns/activations), exist in HTML `<!-- comments -->` but are **not live** on the page. Treat as historical/backlog content only, not current offerings — flag for client confirmation before reusing.

## Events (verbatim, from `#upcoming-event` section)
Section eyebrow: "UPCOMING EVENTS" — Heading: "Discover Upcoming Experiences"
Intro copy:
> Join thoughtfully curated experiences across San Diego — from outdoor adventures and social gatherings to networking evenings and community dinners.

Four recurring event **categories** (not specific named series — no "Social Hours," "Coffee & Conversations," "Seven Bridges," or branded event-series names appear anywhere in site markup):
1. **Outdoor Experiences** — "Hikes, nature walks & scenic adventures"
2. **Networking Events** — "Connect, collaborate & grow together"
3. **Social Gatherings** — "Meet new people & build relationships"
4. **Dinners & Community** — "Great food, conversations & connections"

Stats bar (icons, no numbers): "Curated Experiences," "Diverse Community," "Meaningful Connections," "Memorable Moments"

CTA: "View All Events →" and "View all upcoming events on our Eventbrite page" → both link to `https://www.eventbrite.com/o/121470153411?aff=ebdsshios`
Supporting note: "New experiences added regularly."
Collage image: `images/events-collage.jpg`

**One concrete event found via Eventbrite crawl (VERIFIED via WebFetch of jeevanproductions.com/Events, which mirrors live Eventbrite listing at fetch time):**
- **"Afternoon Tea & Meaningful Connections"** — Sun, July 12 · 2:30–4:30 PM · The Britannia Tearooms, San Diego. (This is a real, dated listing but will already be in the past relative to a July 2026 redesign — treat as an *example* of event format/tone, not a current listing. Confirm current Eventbrite listings with client before publishing specific event names/dates.)

Eventbrite organizer page (`https://www.eventbrite.com/o/jeevan-productions-121470153411`) additionally states the organizer operates events in **San Diego, Los Angeles, and Palm Springs, California** — this conflicts with the site's own footer phone listing of a "KC" (Kansas City) number. See Verified Facts / conflicts below.

## Contact & Locations (verbatim, from `#contact` section)
- Heading: "Let's Connect!"
- **Location:** San Diego, CA
- **Email:** Team@JeevanProductions.com
- **Phone:** SD/LA (310) 363-0288 · KC (816) 974-6089
- **Office Hours:** Mon-Fri, 8AM-5PM
- **Contact form fields** (POSTs to `https://formsubmit.co/Team@JeevanProductions.com`): Your Name (`name`), Your Number (`number`, type=number), Your Email (`email`), Subject (`text`), Your Message (`textarea`, unlabeled `name` attribute — currently a bug, the textarea has no `name="..."` so its content would not submit).

## Team (found in HTML, currently commented out / NOT live on site)
A "Our Leadership Team" section exists in the HTML source but is entirely wrapped in an HTML comment (not rendered to visitors). Listed names/roles/socials, for reference only — **confirm with client whether current before using in redesign**:
- Jeevan Dhaker — Founder & Owner — Instagram: instagram.com/jeevan_dhaker_jd/, LinkedIn: linkedin.com/in/jeevan-dhaker/
- Divyanshu Dhakar — Marketing Director — Instagram: instagram.com/monteus.in/, LinkedIn: linkedin.com/in/divyanshu-dhakar/
- Pramod Prajapati — Advertising Director — Instagram: instagram.com/pramodprajapati1311/, LinkedIn: linkedin.com/in/pramodprajapati1311/
- Piyush Dhaker — Post-Production Director — Instagram: instagram.com/piyushdhaker14/
- Michael Gonzalez — Client Relationship Manager — Instagram: instagram.com/fusionmix_bartending/, LinkedIn: linkedin.com/in/michael-gonzalez-a0b015315/

Also commented out: a Google Calendar appointment-booking iframe ("Book a Meeting") and an unused "What Sets Us Apart?" block referencing a related brand, "Social Media Elevated" (SME) — copy about all-in-one social media management/content creation, not currently displayed.

## Social Links (footer + nav, live)
- Instagram: https://www.instagram.com/jeevan_productions/
- Facebook: https://www.facebook.com/profile.php?id=61560525371598
- LinkedIn: https://www.linkedin.com/company/jeevan-productions/
- Founder's personal Instagram (from IG/LinkedIn search, not linked on site): https://www.instagram.com/jeevan_dhaker_jd/
- Founder's personal LinkedIn: https://www.linkedin.com/in/jeevan-dhaker
- Related/sister brand found via search: "Social Media: Elevated" — https://socialmediaelevated.com/index.html (owned/operated by Jeevan Productions LLC per search result — UNVERIFIED, confirm relationship with client)

---

## Assets (table of URL + suggested use)

All paths are relative to `https://jeevanproductions.com/`.

| Asset | Full URL | Suggested Use |
|---|---|---|
| Loader/brand mark | https://jeevanproductions.com/images/LOADER.png | Logo — reuse or replace with vector logo |
| Favicon | https://jeevanproductions.com/images/favicon.ico | Favicon |
| Hero background | https://jeevanproductions.com/images/Jeevan-Productions-Hero-Image.jpeg | Home hero background (currently has dark 60% overlay via CSS gradient) |
| Events collage | https://jeevanproductions.com/images/events-collage.jpg | Events section visual |
| Our Story photo | https://jeevanproductions.com/images/Story.png | About/Story section image |
| Media portfolio slider | https://jeevanproductions.com/images/Media%20Images/Jeevan-Productions-Photography-1.jpeg ... -26.jpeg (26 images, sequential) | Portfolio/gallery carousel ("Connect. Engage. Inspire.") |
| Brand/partner logos slider | https://jeevanproductions.com/images/Brand%20Logos/Jeevan-Productions-Brands-Experience-1.jpeg ... -17.jpeg (17 images, sequential, non-contiguous order in markup: 13,14,15,16,17,11,12,1,2,3,4,5,6,7,8,9,10) | "Partners Who Trust Us" logo/photo slider — despite the name these are `.jpeg` photos, not vector logo files; actual client/partner names are NOT identifiable from filenames alone (need visual inspection or client input) |
| Directory listing | https://jeevanproductions.com/images/ | Returns 403 Forbidden — directory browsing disabled, cannot enumerate beyond what's referenced in HTML/CSS |
| Stylesheet | https://jeevanproductions.com/style.css | Full CSS — colors, fonts, layout (see Brand Language below) |
| Site script | https://jeevanproductions.com/app.js | Site JS (menu toggle, slider behavior, header scroll state) — not fetched/audited in this pass |
| Commented-out team photos (paths referenced but unconfirmed to exist) | images/jeevan-min.webp, images/divyanshu-min.webp, images/pramod-min.webp, images/piyush-min.webp, images/michael-min.webp | Team headshots if leadership section is revived — verify these files still exist before relying on them |
| Commented-out "unique" image | images/unique.webp | Used only in disabled "What Sets Us Apart" block |

Third-party/CDN assets in use (not proprietary, but part of current build):
- Google Fonts (site currently loads via `<link>`: Poppins; via CSS `@import`: Montserrat, Playfair Display, Inter, DM Sans — DM Sans/Inter/Poppins/Playfair Display is the active `font-family` stack, so Poppins/Montserrat imports may be legacy/unused)
- Font Awesome 6.1.0 (cdnjs) — icons (calendar, mountain, users, glass-cheers, utensils, shield-alt, calendar-check, user-friends, heart, camera)
- Ionicons 5.5.2 (unpkg) — social icons in footer/team
- Elfsight platform.js — powers the embedded Instagram feed widget (`elfsight-app-a7786606-c797-460c-b241-8323fb4d4f92`) and a disabled testimonials widget
- Google Tag Manager / gtag.js — property `G-XN8J010D84`
- FormSubmit.co — handles the contact form POST (no backend of their own)

## Brand Language (colors, fonts — from style.css, verified by direct fetch)

**CSS custom properties (`:root`):**
```
--black: #16161d
--blue: #854488      /* actually a purple/plum — this is the primary brand accent color throughout */
--white: #fff
--light-color: #808080
--light-colora: #c9a6d2
--light-bg: #eff7ff
--light-bga: #ffffff
--google-color: #1A1A1C
--twitter-color: #c9a6d2
--youtube-color: #ff0000
--linkedin-color: #854488
```
Other colors seen inline: `#f9f2fb` (events section background, light lavender), `#f3e6f4` (feature icon circle bg), `#d4a8d8` (divider line), `#6a2f70` (CTA button hover state, darker plum)

**Fonts:**
- Global base font-family: `'DM Sans', 'Inter', 'Poppins', 'Playfair Display', sans-serif`
- Headings (`.heading`, event titles): `'Playfair Display'` (serif, 700 weight) — used for all H1 section headings and the "Discover Upcoming Experiences" title
- Body/UI text: DM Sans / Inter (sans-serif)
- Google Fonts imported: Montserrat, Playfair Display, Inter, DM Sans (via CSS `@import`) + Poppins (via HTML `<link>`)

**Base unit:** `html { font-size: 62.5%; }` (1rem = 10px convention), heavy use of `rem`.

**Tone/voice cues from copy:** confident, aspirational, short punchy taglines ("Creativity is Our Identity," "Connect. Engage. Inspire.," "Let's Connect!"), warm/community-oriented language for events ("meaningful connections," "memorable moments," "make it matter").

---

## Verified Facts (with source)

| Fact | Status | Source |
|---|---|---|
| Founder is Jeevan Dhaker | VERIFIED | Site copy (jeevanproductions.com "Our Story"); corroborated by [LinkedIn](https://www.linkedin.com/in/jeevan-dhaker) and [LinkedIn company page](https://www.linkedin.com/company/jeevan-productions) |
| Company is a Content Creation/Marketing agency based in San Diego, CA (92101) | VERIFIED | [LinkedIn company page](https://www.linkedin.com/company/jeevan-productions) |
| Company size ~2–10 employees (4 listed) | VERIFIED (as reported by LinkedIn at time of search) | LinkedIn company page |
| Founded 2015 | VERIFIED (as reported by LinkedIn) | LinkedIn company page |
| Tagline "Creativity is our Identity. Branding \| Marketing \| Events." used on LinkedIn | VERIFIED | LinkedIn company page |
| Company operates/serves San Diego, Los Angeles; markets itself to "Los Angeles" in meta description | VERIFIED (site's own meta tags) | jeevanproductions.com page source (`<meta name="description">`, `<meta name="location" content="Los Angeles, San Diego, United States">`) |
| Eventbrite organizer profile exists at eventbrite.com/o/jeevan-productions-121470153411 and jeevanproductions.com links to it as the events source-of-truth | VERIFIED | Site CTA links; [Eventbrite org page](https://www.eventbrite.com/o/jeevan-productions-121470153411) |
| Instagram handle @jeevan_productions exists | VERIFIED (link present in footer + resolves) | https://www.instagram.com/jeevan_productions/ |
| Facebook page exists (id 61560525371598) | VERIFIED (link present in footer) | https://www.facebook.com/profile.php?id=61560525371598 |
| A real, IMDb-listed person named Jeevan Dhaker is credited as actor/writer/producer on "Charlie: The Chicken," "Happy Hour," "Love, Misery, and the Goth Girl" | VERIFIED (exists on IMDb) — likely the same individual given identical name and creative-industry overlap, but IMDb does NOT itself confirm identity with the agency founder | [IMDb](https://www.imdb.com/name/nm12861380/) |

## UNVERIFIED / Needs-Client-Confirmation

- **No branded/named recurring event series** (e.g., "Social Hours," "Coffee & Conversations," "Seven Bridges," "Afternoon Tea") appear anywhere in current site markup or in easily searchable public sources. The only concrete named event found was **"Afternoon Tea & Meaningful Connections"** at The Britannia Tearooms, San Diego (a specific past/single dated instance, July 12, seen via one crawl) — confirm with client whether this is a recurring series name worth carrying into the redesign, and pull current listings directly from Eventbrite before publishing any event names/dates.
- **Location conflict:** site footer lists a Kansas City ("KC") phone number `(816) 974-6089` alongside San Diego/LA `(310) 363-0288`, implying a KC presence/market, but the Eventbrite organizer bio instead references **Palm Springs**, not Kansas City, as a third market. Ask the client which is accurate — Kansas City or Palm Springs — before stating "three locations" in the redesign.
- **"Five decades of collective experience"** (Our Story copy) — a team-wide aggregate claim, not independently verifiable; carry forward as marketing copy only, not a checkable fact.
- Leadership team names/roles (Divyanshu Dhakar, Pramod Prajapati, Piyush Dhaker, Michael Gonzalez) — present only in commented-out HTML, not confirmed current staff; their linked personal Instagram/LinkedIn profiles were not individually verified in this pass.
- Relationship between Jeevan Productions and "Social Media: Elevated" (socialmediaelevated.com) — a search result claims it's "owned and operated by Jeevan Productions LLC," but this is not stated anywhere on jeevanproductions.com itself.
- No client or partner names are identifiable — the "Partners Who Trust Us" slider uses generically-named image files (`Jeevan-Productions-Brands-Experience-1.jpeg` etc.) with no alt text beyond "Image 1"; actual client identities would require visual inspection of each image or direct client input.
- No pricing information appears anywhere on the site.
- Contact form has a bug: the message `<textarea>` has no `name` attribute, so message text likely does not get submitted via FormSubmit.co — flag for the redesign to fix regardless of whether copy changes.

## SEO Notes (existing titles/meta, verbatim from page `<head>`)

- `<title>`: **Jeevan Productions LLC**
- `<meta name="title">`: **Jeevan Productions | Creative Marketing, Content & Event Production**
- `<meta name="description">`: "Jeevan Productions — a full-service creative agency delivering marketing, advertising, social media, website design, content & video production, business consulting, and live & virtual event production across Los Angeles."
- `<meta name="keywords">`: "marketing agency, creative agency, event production, event management, live events, virtual events, content production, video production, website design, social media management, digital marketing, brand storytelling, advertising agency, business consulting, Los Angeles marketing, Jeevan Productions"
- Canonical URL: `https://www.jeevanproductions.com` (note: canonical points to `www` subdomain even though most links point to bare `jeevanproductions.com`)
- Open Graph: `og:title` = "Jeevan Productions | Creative Marketing, Content & Event Production"; `og:description` = "Full-service agency delivering marketing, social media, web design, content & video production, business consulting, and live + virtual event production in Los Angeles"; `og:url` = https://www.jeevanproductions.com; `og:site_name` = Jeevan Productions; `og:type` = website; `og:locale` = en_US
- No `og:image` tag present — social share previews likely have no image (redesign should add one)
- Custom meta: `<meta name="location" content="Los Angeles, San Diego, United States">`
- Google Analytics (gtag.js) property: `G-XN8J010D84`
- **Mismatch to flag:** all SEO/meta copy foregrounds "Los Angeles" and even omits San Diego from the title/description, while the visible on-page hero copy says "Serving San Diego" and the visual content/events are San-Diego-centric. Redesign should reconcile SEO targeting with actual on-page geographic focus.
