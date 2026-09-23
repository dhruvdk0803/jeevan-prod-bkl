# CMS + SEO Build Brief

Read this in full, plus `CLAUDE.md`/`AGENTS.md`, `NEXT16-NOTES.md` and (for
public pages) `DESIGN-BRIEF.md`, before writing code. This is **Next.js 16**:
`params`/`searchParams`/`cookies()`/`headers()`/`draftMode()` are Promises;
`revalidateTag` needs 2 args; `middleware.ts` is now `src/proxy.ts`. When in
doubt, read `node_modules/next/dist/docs/`.

## What we're building

A self-hosted CMS at `/admin` (email + password login) where the Jeevan
Productions team writes and publishes blog posts and manages SEO. Content
appears on the public site at `/blog`, fully SEO-optimised end to end.

Stack (already installed + wired — do not add alternatives):
- Postgres via **Drizzle ORM** (`src/db/schema.ts`, `src/db/index.ts`).
  Production: `DATABASE_URL` (Neon/Vercel Postgres). Local dev: embedded
  PGlite at `.data/pglite`, auto-migrated, used by the running dev server.
- Auth: `src/lib/auth/session.ts` (hashed session tokens, throttled login),
  `src/lib/auth/password.ts` (scrypt).
- Rich text: **Tiptap v3** (`@tiptap/react`, `starter-kit`, `extension-link`,
  `extension-image`, `extension-placeholder`). Stored as `contentJson` (editor
  source of truth) + sanitised `content` HTML (what the site renders).
- Uploads: `@vercel/blob` when `BLOB_READ_WRITE_TOKEN` is set, otherwise
  written to `public/uploads/` (dev). `image-size` for dimensions.
- Validation: `zod` v4. Sanitising: `sanitize-html` via `src/lib/cms/html.ts`.

## Shared contracts (owned by the orchestrator — import, never edit)

| File | What it gives you |
|---|---|
| `src/db/schema.ts` | Tables: users, sessions, loginAttempts, categories, tags, posts, postTags, media, pageSeo, redirects, settings. Types `Post`, `User`, … |
| `src/db/index.ts` | `getDb()` → Drizzle client (throws `DatabaseUnavailableError` if none), `schema`, `isDatabaseConfigured()` |
| `src/lib/auth/session.ts` | `requireUser()`, `requireAdmin()`, `getCurrentUser()`, `attemptLogin()`, `destroySession()`, `revokeUserSessions()`, `SESSION_COOKIE` |
| `src/lib/auth/password.ts` | `hashPassword()`, `verifyPassword()`, `PASSWORD_MIN_LENGTH` |
| `src/lib/cms/public.ts` | **Cached public reads**: `getPublishedPosts`, `getPostBySlug`, `getRelatedPosts`, `getSitemapPosts`, `getFeedPosts`, `getCategories`, `getCategoryBySlug`, `getTagsInUse`, `getTagBySlug`, `getSiteSettings`, `getPageSeo`, `getAllPageSeo`, `getRedirectRules` |
| `src/lib/cms/types.ts` | `SiteSettings`, `PostCard`, `PostFull`, `PublicCategory`, … (dates are ISO strings) |
| `src/lib/cms/tags.ts` | `CMS_TAGS`, `invalidate(...tags)`, `invalidatePost(...slugs)` — **call after every write** |
| `src/lib/cms/html.ts` | `sanitizePostHtml()`, `htmlToText()`, `readingMinutes()`, `withHeadingIds()` |
| `src/lib/cms/slug.ts` | `slugify()`, `SLUG_PATTERN` (client-safe) |
| `src/lib/cms/action-state.ts` | `ActionState`, `initialActionState`, `zodFieldErrors()` |
| `src/lib/cms/preview.ts` | `getPreviewPost(slug)` — Draft Mode + signed-in user only |
| `src/components/admin/ui.tsx` | Admin UI kit: `PageHeader`, `Card`, `Button`, `ButtonLink`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Badge`, `Alert`, `EmptyState`, `Table/Th/Td`, `formatDate`, `formatDateTime` |
| `src/proxy.ts` | Optimistic /admin cookie gate + CMS redirects |
| `src/app/layout.tsx` | Root html/body; metadata from Admin → Settings; GA4 |
| `src/app/(site)/layout.tsx` | Public chrome (nav/footer/motion). Public pages live in `app/(site)/` |

If a contract is missing something you need, create a new file in your own
area and note it in your final report. Do not edit files you don't own.

## Rules for every agent

1. **Security.** Every admin page, Server Action and `/api/admin/*` handler
   calls `requireUser()` (or `requireAdmin()` where noted) FIRST. Validate all
   input with zod. Never trust client-sent IDs for ownership-free
   assumptions. Server Actions are public endpoints: treat them that way.
2. **Invalidate caches** after every write with `invalidate()` /
   `invalidatePost()` from `lib/cms/tags.ts`.
3. **Server Actions** live in an `actions.ts` next to the route, `"use server"`
   at the top, and return `ActionState`. Forms use `useActionState` and show
   `fieldErrors` inline + `message` in an `Alert`. Pending buttons disable.
4. **Admin UI** uses only `components/admin/ui.tsx` primitives + Tailwind.
   Admin is a clean working tool: `bg-paper` canvas, white cards, Instrument
   Sans UI text, Fraunces only for page titles. No GSAP, no `data-reveal`,
   no marketing chrome. Must work at 1280px and be usable at 390px.
5. **Accessibility**: labelled inputs, visible focus, `aria-invalid` +
   `aria-describedby` on errored fields, 40px+ targets, no colour-only state.
6. **Never invent facts** about Jeevan Productions (see `DESIGN-BRIEF.md` §2).
   No seed posts, fake authors, placeholder articles or lorem ipsum. Empty
   states instead.
7. **Do not run** `npm run build`, `npm run dev`, `db:migrate` or anything that
   opens `.data/pglite` — the orchestrator's dev server owns that database.
   A dev server is ALREADY running at http://localhost:3000; use it (curl) to
   check your routes. Verify with `npx tsc --noEmit` and
   `npx eslint <your files>`. Don't install packages; ask in your report.
8. Match the codebase: explanatory header comments on non-obvious modules,
   `clsx` for conditional classes, `@/` imports.

## Admin route map & ownership

Sidebar order (Agent A builds the shell and links exactly these):
Dashboard `/admin` · Posts `/admin/posts` · Categories `/admin/categories` ·
Tags `/admin/tags` · Media `/admin/media` · SEO `/admin/seo` ·
Redirects `/admin/redirects` · Settings `/admin/settings` (admin only) ·
Users `/admin/users` (admin only) · Account `/admin/account` · View site ↗ ·
Sign out.

### Agent A — Auth & admin shell
Owns: `src/app/admin/layout.tsx`, `src/app/admin/(auth)/login/**` (route
`/admin/login`), `src/app/admin/(panel)/layout.tsx` (sidebar shell — every
other admin page lives under `app/admin/(panel)/`), `src/app/admin/(panel)/page.tsx`
(dashboard), `src/app/admin/(panel)/users/**`, `src/app/admin/(panel)/account/**`,
`src/app/admin/logout/**` (or a sign-out action), `src/app/admin/not-found.tsx`,
`src/app/admin/error.tsx`, `src/components/admin/shell/**`,
`scripts/create-admin.ts` (`npm run admin:create` — interactive or flags;
uses `scripts/db.ts` `openDb()`), plus a "database not configured" screen when
`isDatabaseConfigured()` is false.

### Agent B — Posts & editor
Owns: `src/app/admin/(panel)/posts/**`, `src/app/api/admin/preview/**`,
`src/components/admin/editor/**`, `src/lib/cms/seo-analysis.ts`.
Uses Agent C's `MediaPicker` (contract below).

### Agent C — Media, taxonomy, SEO & settings admin
Owns: `src/app/admin/(panel)/{categories,tags,media,seo,redirects,settings}/**`,
`src/app/api/admin/media/**`, `src/components/admin/media/**`
(incl. `MediaPicker.tsx`), `src/lib/cms/storage.ts`, `src/lib/cms/static-routes.ts`.

### Agent D — Public blog & site-wide SEO
Owns: `src/app/(site)/blog/**`, `src/components/blog/**`, `src/lib/seo.ts`,
`src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/blog-prose.css` (or
similar, imported from the blog layout), the `metadata` exports of every page
in `src/app/(site)/**` (convert to `generateMetadata` using page-SEO
overrides), `src/lib/schema.ts` (add blog schema helpers), and one new
homepage section component `src/components/home/LatestPosts.tsx` inserted into
`src/app/(site)/page.tsx` (render nothing when there are no posts).

## Cross-agent contracts

**MediaPicker** (C builds, B consumes) — `src/components/admin/media/MediaPicker.tsx`:
```tsx
"use client";
export type PickedMedia = { id: string; url: string; alt: string; width: number | null; height: number | null };
export function MediaPicker(props: {
  open: boolean;
  onClose: () => void;
  onSelect: (m: PickedMedia) => void;
  /** Optional heading, e.g. "Choose cover image". */
  title?: string;
}): React.ReactElement | null;
```
Modal dialog: grid of library images (search), upload new (drag/drop + file
input) with required alt text, select → `onSelect` + close.

**Media API** (C builds): `POST /api/admin/media` (multipart `file`, `alt`) →
`201 { id, url, alt, width, height, filename, mimeType, size }`; images only
(jpeg/png/webp/avif/gif), max 8 MB. `GET /api/admin/media?q=&page=` →
`{ items: [...], total }`. Both `requireUser()`; return 401 JSON (not a
redirect) when signed out.

**Static routes list** (C builds, D may import) — `src/lib/cms/static-routes.ts`:
`export const STATIC_ROUTES: { path: string; label: string; defaultTitle: string; defaultDescription: string }[]`
covering `/`, `/work`, `/services`, `/about`, `/blog`, `/impact`,
`/social-hours`, `/careers`, `/contact`, `/privacy`, `/terms`. Take the default
title/description from each page's current `metadata` export verbatim.

**Page SEO overrides** (D applies): `src/lib/seo.ts` exports
`buildMetadata({ path, title, description, ogType?, images? })` which merges
`getPageSeo(path)` overrides (metaTitle → title, metaDescription →
description, ogImageUrl → og/twitter image, noindex → robots) over the page's
defaults and always sets `alternates.canonical`.

**Preview** (B builds the route, D consumes): `GET /api/admin/preview?id=`
→ requireUser → `(await draftMode()).enable()` → redirect `/blog/<slug>`.
`GET /api/admin/preview/disable` → disable + redirect back. D's post page
tries `getPreviewPost(slug)` first, falls back to `getPostBySlug(slug)`, and
shows a slim "Preview mode — exit" bar when previewing.

## SEO requirements (Agent B's editor + Agent D's pages)

- Post fields: title, slug (auto from title until edited, unique), excerpt,
  cover image + alt, category, tags, status, publish date/time (future =
  scheduled), meta title (50–60 chars target), meta description (120–160),
  focus keyword, canonical URL override, OG image override, noindex.
- Editor SEO panel: live Google SERP preview, social card preview, character
  counters, and a checklist score (`lib/cms/seo-analysis.ts`, pure function,
  unit-sized): keyword in title / meta description / slug / first paragraph /
  an H2; content length ≥ 300 words; meta lengths in range; every image has
  alt; at least one internal link; excerpt present; cover image present.
- Public post page: `generateMetadata` (title/description/canonical/OG
  `article` with publishedTime/modifiedTime/section/tags/authors, twitter
  large card, robots noindex when set), `BlogPosting` + `BreadcrumbList`
  JSON-LD, semantic `<article>`, one `<h1>`, `<time dateTime>`, author byline,
  table of contents from H2/H3, reading time, related posts, next/image for
  cover with real alt, per-post OG image route when no cover/og image.
- `/blog` index + `/blog/page/[page]` pagination (rel prev/next via links,
  canonical per page), `/blog/category/[slug]`, `/blog/tag/[slug]`
  (tag pages `noindex, follow` if < 2 posts), `/blog/feed.xml` RSS 2.0.
- `sitemap.ts`: static routes (minus page-SEO noindex), posts (lastModified =
  updatedAt, minus noindex), categories with posts. `robots.ts`: disallow
  `/admin`, `/api`.
