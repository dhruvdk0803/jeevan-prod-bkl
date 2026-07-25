# Next.js 16 API Cheat-Sheet (this repo: Next 16.2.11, React 19.2, Tailwind v4, TS)

Source of truth: `node_modules/next/dist/docs/`. Every section below cites the doc file it came from. If something isn't stated in the docs, it's flagged "docs silent — verify at build".

---

## 0. TL;DR — breaking changes vs what you remember

- **`params` and `searchParams` are ALWAYS Promises now — sync access fully removed** (was soft-deprecated in 15, hard-removed in 16). Same for `cookies()`, `headers()`, `draftMode()`. [`upgrading/version-16.md`]
- **`next/image` `priority` prop is DEPRECATED** → use `preload` instead (same purpose, clearer name). [`components/image.md` v16.0.0 changelog]
- **`images.qualities` now defaults to `[75]` only** (was unrestricted). Any `quality` prop not in the allowlist gets coerced to nearest allowed value. Must explicitly list qualities you use. [`upgrading/version-16.md`, `config/next-config-js/images.md`]
- **`images.minimumCacheTTL` default changed 60s → 14400s (4h)**. [`upgrading/version-16.md`]
- **`images.imageSizes` default dropped `16`** (now `[32,48,64,96,128,256,384]`). [`upgrading/version-16.md`]
- **Local image `src` with a query string requires `images.localPatterns[].search` config** or it 400s (enumeration-attack protection). [`upgrading/version-16.md`]
- **`images.maximumRedirects` now defaults to 3** (was unlimited). [`upgrading/version-16.md`]
- **Local IP image optimization blocked by default** — needs `images.dangerouslyAllowLocalIP: true`. [`upgrading/version-16.md`]
- **`middleware.ts` → `proxy.ts`**, export renamed `middleware` → `proxy`. Edge runtime NOT supported in proxy (nodejs only). `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`. [`upgrading/version-16.md`]
- **Turbopack is the default bundler** for `next dev` and `next build` (no more `--turbopack` flag needed). Custom webpack config + `next build` now **fails the build** unless you pass `--webpack` or `--turbopack`. [`upgrading/version-16.md`]
- **`experimental.turbopack` config → top-level `turbopack` key** in `next.config.ts`. [`upgrading/version-16.md`, `config/next-config-js/turbopack.md`]
- **Partial Prerendering (PPR) experimental flag removed** (`experimental_ppr`, `experimental.ppr`) → replaced by `cacheComponents: true` top-level config (different semantics, not a drop-in swap). [`upgrading/version-16.md`]
- **`experimental.dynamicIO` / `experimental.useCache` removed** → use `cacheComponents: true`. [`upgrading/version-16.md`]
- **`revalidateTag(tag)` single-arg form deprecated** → now requires `revalidateTag(tag, cacheLifeProfile)`, e.g. `revalidateTag('posts', 'max')`. New `updateTag()` API added for read-your-writes semantics; new `refresh()` API to refresh router from a Server Action. [`upgrading/version-16.md`]
- **`unstable_cacheLife`/`unstable_cacheTag` → stable `cacheLife`/`cacheTag`** (drop the prefix). [`upgrading/version-16.md`]
- **`next lint` command removed** — use ESLint/Biome CLI directly; `next build` no longer lints. `eslint` key removed from `next.config`. [`upgrading/version-16.md`]
- **AMP support fully removed** (`next/amp`, `useAmp`, `config.amp`). [`upgrading/version-16.md`]
- **`serverRuntimeConfig`/`publicRuntimeConfig` removed** — use env vars (`NEXT_PUBLIC_` prefix for client) or `connection()` for runtime reads. [`upgrading/version-16.md`]
- **Parallel route slots now REQUIRE a `default.js`** or the build fails. [`upgrading/version-16.md`]
- **`devIndicators.appIsrStatus/buildActivity/buildActivityPosition` removed.** [`upgrading/version-16.md`]
- **`unstable_rootParams` removed**, no replacement yet. [`upgrading/version-16.md`]
- **`next/legacy/image` deprecated** → use `next/image`. **`images.domains` deprecated** → use `images.remotePatterns`. [`upgrading/version-16.md`, `components/image.md`]
- **Scroll-behavior override removed by default** — Next no longer force-resets `scroll-behavior: smooth` during navigation unless you opt in via `<html data-scroll-behavior="smooth">`. [`upgrading/version-16.md`]
- **`sitemap`'s `generateSitemaps` `id` param is now a Promise** (`await props.id`). [`upgrading/version-16.md`, `metadata/sitemap.md`]
- **`opengraph-image`/`twitter-image`/`icon`/`apple-icon` generator functions now receive `params` and `id` as Promises** (only `generateImageMetadata` itself stays sync). [`upgrading/version-16.md`]
- **`error.js` gets a new `unstable_retry()` prop** (v16.2.0) — prefer over `reset()` since it re-fetches/re-renders instead of just clearing state. [`file-conventions/error.md`]
- **`next dev`/`next build` now use separate output dirs** (`.next/dev` vs `.next`), can run concurrently; lockfile prevents double-starts.
- Node.js 20.9+ required (18 dropped); TypeScript 5.1+ required.

---

## 1. `next/font/google` — fonts

Source: `docs/01-app/03-api-reference/02-components/font.md`

```tsx
// app/layout.tsx
import { Inter, Fraunces } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',       // 'auto'|'block'|'swap'|'fallback'|'optional', default 'swap'
  variable: '--font-inter',
  preload: true,          // default true; set false for fonts not used on first paint
})

// Variable font with extra axes (Fraunces has optical size + weight axes)
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz'],         // additional variable axes beyond weight; check Google Fonts variable-fonts page for valid axes per family
  // weight: '9..144' style ranges are handled automatically for variable fonts — omit `weight` for variable fonts
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* app/globals.css */
@import 'tailwindcss';

@theme inline {
  --font-sans: var(--font-inter);
  --font-display: var(--font-fraunces);
}
```

Key options (Google + local): `weight` (required if not variable; `'400'` | `'100 900'` range | array), `style`, `subsets` (required if `preload` true — else build warning), `axes` (variable-font-only extra axes, e.g. Inter's `slnt`), `display`, `preload` (default `true`), `fallback`, `adjustFontFallback`, `variable` (CSS var name for use with Tailwind `@theme inline`), `declarations` (local fonts only).

Local fonts: `import localFont from 'next/font/local'` with `src` (string or array of `{path, weight, style}`).

No import renaming required — `next/font` has been stable, no install step, since v13.2.0.

---

## 2. Metadata / `generateMetadata`

Source: `docs/01-app/03-api-reference/04-functions/generate-metadata.md`, `generate-viewport.md`

### Static metadata

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: { default: 'Acme', template: '%s | Acme' },
  description: 'Site description',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Acme',
    description: 'Site description',
    url: 'https://example.com',
    siteName: 'Acme',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acme',
    images: ['/og-image.png'],
  },
}
```

### Dynamic metadata in `app/blog/[slug]/page.tsx`

```tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const product = await fetch(`https://api/${slug}`).then((r) => r.json())
  const previousImages = (await parent).openGraph?.images || []
  return {
    title: product.title,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { images: [`/og/${slug}.png`, ...previousImages] },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <h1>{slug}</h1>
}
```

Or with the generated helper type (after `next dev`/`next typegen` runs once): `export async function generateMetadata(props: PageProps<'/blog/[slug]'>)`.

### Breaking / deprecated fields

- **`viewport`, `themeColor`, `colorScheme` inside the `metadata` object are deprecated since v13.2.0** — must use a separate `export const viewport: Viewport = {...}` or `generateViewport()`:

```tsx
// app/layout.tsx
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: 'black', // or array of { media, color }
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
}
```

- `metadata`/`generateMetadata`/`viewport`/`generateViewport` are **Server Components only**; can't export both the static object and the generate-function from the same segment.
- Metadata streams by default (resolves after initial HTML for JS-executing bots); HTML-limited bots (e.g. facebookexternalhit) still block until metadata resolves. Configurable via `htmlLimitedBots` in `next.config.ts`.
- Ordering: root layout → nested layouts → page; shallow-merged, duplicate keys replaced by the most specific segment (nested objects like `openGraph` are fully overwritten, not deep-merged, when redefined at a lower segment).

---

## 3. Dynamic route params — Promises everywhere

Source: `file-conventions/page.md`, `file-conventions/layout.md`, `file-conventions/route.md`, `file-conventions/dynamic-routes.md`

### `app/blog/[slug]/page.tsx`

```tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const query = await searchParams
  return <h1>{slug}</h1>
}
```

Or with the global `PageProps` helper (generated by `next dev`/`next build`/`next typegen`, no import needed):

```tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const query = await props.searchParams
  return <h1>{slug}</h1>
}
```

### `app/blog/[slug]/layout.tsx`

```tsx
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <section>{children}</section>
}
```

Or `LayoutProps<'/blog/[slug]'>` helper — also types named parallel-route slots (e.g. `props.analytics` if `app/blog/@analytics` exists).

### `generateMetadata` in `[slug]`

```tsx
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}
```

### Client Components (can't be `async`) — use React's `use()`

```tsx
'use client'
import { use } from 'react'

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <p>{slug}</p>
}
```

### Route Handlers — `RouteContext` helper

```ts
// app/users/[id]/route.ts
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}
```

No synchronous fallback exists anymore in v16 — accessing `params`/`searchParams` without `await` will not work (unlike v15 which kept a deprecated sync path).

---

## 4. `generateStaticParams`

Source: `functions/generate-static-params.md`

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://.../posts').then((r) => r.json())
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

- Works with `page.tsx`, `layout.tsx`, and `route.ts`.
- Return `[]` (empty array) or `export const dynamic = 'force-static'` to render all paths at runtime/ISR instead of build time — you must always return an array, never `undefined`.
- `export const dynamicParams = false` 404s any param not in the generated list.
- Multi-segment routes: child `generateStaticParams` receives parent's resolved `params` synchronously as `options.params` — bottom-up (child generates both) or top-down (parent generates its own, child reads parent's) patterns both supported.
- **With `cacheComponents: true`**: `generateStaticParams` must return **at least one param** — empty arrays are now a **build error** (this is new/stricter behavior for Cache Components specifically, not vanilla ISR).

---

## 5. `next/image`

Source: `components/image.md`, `config/next-config-js/images.md`

```tsx
import Image from 'next/image'
import hero from '@/public/hero.jpg' // static import — no width/height needed, blurDataURL auto-generated

export default function Page() {
  return (
    <>
      {/* Fixed-size, LCP/hero image */}
      <Image src={hero} alt="Hero" preload placeholder="blur" />

      {/* fill mode — parent needs position:relative and a defined size */}
      <div style={{ position: 'relative', width: '100%', height: 400 }}>
        <Image
          src="/banner.jpg"
          alt="Banner"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Remote image — width/height required (no build-time file access) */}
      <Image src="https://cdn.example.com/x.jpg" alt="x" width={500} height={300} />
    </>
  )
}
```

Required props: `src`, `alt`. `width`+`height` required unless `fill` or static import. `sizes` required whenever using `fill` or CSS-responsive layouts (otherwise browser assumes 100vw and over-fetches).

**Breaking in v16**: `priority` prop **deprecated → use `preload`** (boolean, same purpose: insert `<link rel="preload">` for LCP images). Doc's explicit guidance: prefer `loading="eager"` or `fetchPriority="high"` over `preload` in most cases; use `preload` mainly for a single clear LCP hero image.

`placeholder`: `'empty'` (default) | `'blur'` (needs `blurDataURL`, auto for static imports of jpg/png/webp/avif) | `data:image/...` URL.

`next.config.ts` images config:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // order = preference; AVIF preferred, WebP fallback
    qualities: [75],        // REQUIRED allowlist in v16 default [75] — add more if you use quality=90 etc.
    minimumCacheTTL: 14400, // v16 default (was 60s)
    imageSizes: [32, 48, 64, 96, 128, 256, 384], // v16 default, no 16
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/assets/**' },
    ],
    localPatterns: [
      { pathname: '/assets/**', search: '' }, // required if using local src with query strings
    ],
    dangerouslyAllowLocalIP: false, // default; true only for private-network self-hosting
    maximumRedirects: 3,            // v16 default
  },
}

export default nextConfig
```

Deprecated: `images.domains` (use `remotePatterns`), `next/legacy/image` import, `onLoadingComplete` prop (use `onLoad`).

---

## 6. `next/link`

Source: `components/link.md`

```tsx
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
<Link href={{ pathname: '/about', query: { name: 'test' } }}>About</Link>
<Link href="/dashboard" replace scroll={false} prefetch={false}>Dashboard</Link>
```

- No child `<a>` tag needed since v13 (already old news, but worth confirming: `legacyBehavior` prop for wrapping a custom `<a>` is gone from docs — don't reach for it).
- `prefetch` prop values in App Router: `"auto"`/`null` (default: full prefetch for static routes, partial down to nearest `loading.js` for dynamic routes), `true` (always full), `false` (never). Prefetching is production-only.
- New in v16.2.0: `transitionTypes` prop (array of strings) — feeds React's `addTransitionType` for `<ViewTransition>`-based navigation animations.
- `onNavigate` (added 15.3.0) only fires for same-origin client-side nav (not new tabs / external URLs / `download` links) — different from `onClick`.
- Next.js 16 overhauled prefetching internals: layout dedup + incremental prefetch — no code change required, but expect more, smaller prefetch requests.

---

## 7. Route Handlers & Server Actions

Source: `file-conventions/route.md`, `guides/forms.md`, `upgrading/version-16.md`

### `app/api/items/route.ts`

```ts
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  return NextResponse.json({ query })
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')
  return Response.json({ name, email })
}

// Dynamic segment context — params is a Promise
export async function GET2(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
}

// Segment config
export const dynamic = 'auto'
export const revalidate = false
export const runtime = 'nodejs' // 'edge' still exists for route.ts (unlike proxy.ts)
```

Supported methods: `GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS`. `OPTIONS` auto-implemented with correct `Allow` header if you don't define it. `GET` handlers default to **dynamic** caching since v15.0.0-RC (not static like pre-15).

### Server Actions (`"use server"`) + `useActionState`

```tsx
// app/actions.ts
'use server'
import { z } from 'zod'

const schema = z.object({ email: z.string() })

export async function createUser(prevState: any, formData: FormData) {
  const validated = schema.safeParse({ email: formData.get('email') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }
  // mutate + revalidate
  return { message: 'ok' }
}
```

```tsx
// app/ui/signup.tsx
'use client'
import { useActionState } from 'react'
import { createUser } from '@/app/actions'

export function Signup() {
  const [state, formAction, pending] = useActionState(createUser, { message: '' })
  return (
    <form action={formAction}>
      <input name="email" required />
      <p aria-live="polite">{state?.message}</p>
      <button disabled={pending}>Sign up</button>
    </form>
  )
}
```

Notes: with `useActionState`, the server function's first param becomes `prevState`/`initialState`, `formData` shifts to 2nd param. Inline (non-hook) server actions defined directly in a Server Component page also work (`async function createInvoice(formData: FormData) { 'use server'; ... }`), passed via `<form action={createInvoice}>`.

New cache-mutation primitives (v16): `revalidateTag(tag, cacheLifeProfile)` (2-arg now required), `updateTag(tag)` (Server-Action-only, immediate read-your-writes), `refresh()` (refresh client router from a Server Action without expiring cache).

---

## 8. Special files: sitemap / robots / not-found / error / loading / template

Source: `file-conventions/metadata/sitemap.md`, `robots.md`, `not-found.md`, `error.md`, `loading.md`, `template.md`

### `app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://acme.com', lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: 'https://acme.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
```

Multi-sitemap via `generateSitemaps` — **`id` is now a Promise in v16**:

```ts
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }]
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id
  // ...
}
```

`sitemap.ts` is a special cached Route Handler by default (cached unless it uses a request-time API or dynamic config).

### `app/robots.ts`

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/private/' },
    sitemap: 'https://acme.com/sitemap.xml',
  }
}
```

### `app/not-found.tsx` (per-segment; triggered by `notFound()`)

```tsx
export default function NotFound() {
  return <div><h2>Not Found</h2></div>
}
```

Can be `async` (Server Component by default) to fetch data. Also `app/global-not-found.tsx` (experimental, needs `experimental.globalNotFound: true`) for a true app-wide 404 that bypasses layouts entirely and must include its own `<html>`/`<body>`.

### `app/error.tsx` (must be Client Component)

```tsx
'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => unstable_retry()}>Try again</button>
    </div>
  )
}
```

New in v16.2.0: `unstable_retry()` prop — prefer over `reset()` (retry re-fetches/re-renders the boundary's children; `reset()` just clears error state without refetching). `error.js` does NOT wrap the `layout.js`/`template.js` in its own segment — use `app/global-error.tsx` (must define `<html>`/`<body>`, no `metadata`/`generateMetadata` support since it's a Client Component) for root-layout errors.

### `app/loading.tsx`

```tsx
export default function Loading() {
  return <p>Loading...</p>
}
```

Wraps `page.js` + nested `layout.js`/`not-found.js` in a `<Suspense>` boundary automatically. Does NOT cover uncached/runtime data access (`cookies()`, `headers()`) in the *layout* itself — that blocks navigation unless separately wrapped in `<Suspense>` (or under Cache Components, causes a build-time error until you do).

### `app/template.tsx`

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

Like layout but remounts (fresh key) on navigation within its segment — resets Client Component state / re-runs `useEffect`. Wraps `error.js`/`loading.js`/`not-found.js`/`page.js` but not the `layout.js` in the same segment.

`MetadataRoute` types: `MetadataRoute.Sitemap`, `MetadataRoute.Robots` — imported from `'next'`.

---

## 9. `next.config.ts` shape in v16

Source: `config/next-config-js/index.md`, `upgrading/version-16.md`, `config/next-config-js/turbopack.md`

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {          // TOP-LEVEL now (was experimental.turbopack in v15)
    resolveAlias: { fs: { browser: './empty.ts' } },
  },
  cacheComponents: true,       // replaces experimental.ppr / dynamicIO / useCache
  reactCompiler: true,         // stable in v16, opt-in, not default
  skipProxyUrlNormalize: true, // renamed from skipMiddlewareUrlNormalize
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 100],
  },
  htmlLimitedBots: /.*/, // to fully disable streaming metadata
}

export default nextConfig
```

- `.ts` config file is fully supported; `.cjs`/`.cts` are NOT.
- Can export a function `(phase, { defaultConfig }) => config`, sync or async, using `PHASE_DEVELOPMENT_SERVER` etc. from `next/constants`.
- `eslint` key removed (no more lint-during-build config).
- `serverRuntimeConfig`/`publicRuntimeConfig` removed.
- No more `next dev` argv check working the old way — `process.argv.includes('dev')` returns false now inside config when run via `next dev` (config loaded once, not twice); use `NODE_ENV === 'development'` or the `phase` param instead.

---

## 10. Removed / deprecated APIs — reach-for-habit list

| Old habit | Status in v16 | Replacement |
|---|---|---|
| Sync `params`/`searchParams` access in page/layout | Removed | `await params` / `use(params)` |
| Sync `cookies()`/`headers()`/`draftMode()` | Removed | `await cookies()` etc. |
| `next/image` `priority` prop | Deprecated | `preload` prop |
| `next/legacy/image` | Deprecated | `next/image` |
| `images.domains` config | Deprecated | `images.remotePatterns` |
| `middleware.ts` / `export function middleware` | Deprecated | `proxy.ts` / `export function proxy` |
| `experimental.turbopack` config | Moved | top-level `turbopack` |
| `experimental_ppr` / `experimental.ppr` | Removed | `cacheComponents: true` |
| `experimental.dynamicIO`, `experimental.useCache` | Deprecated | `cacheComponents: true` |
| `unstable_cacheLife` / `unstable_cacheTag` | Renamed (stable) | `cacheLife` / `cacheTag` (no prefix) |
| `revalidateTag(tag)` single-arg | Deprecated | `revalidateTag(tag, cacheLifeProfile)` |
| `next lint` CLI command | Removed | ESLint/Biome CLI directly |
| `next.config` `eslint` key | Removed | n/a |
| `serverRuntimeConfig` / `publicRuntimeConfig` | Removed | env vars (`NEXT_PUBLIC_*` for client) |
| AMP (`next/amp`, `useAmp`, config.amp) | Removed | n/a |
| `devIndicators.appIsrStatus/buildActivity/buildActivityPosition` | Removed | n/a (indicator itself remains) |
| `unstable_rootParams` | Removed | none yet |
| Parallel route slot without `default.js` | Now a build error | add `default.js` (return `null` or call `notFound()`) |
| `metadata.viewport`/`themeColor`/`colorScheme` | Deprecated since v13.2 | `export const viewport` / `generateViewport` |
| `onLoadingComplete` (Image) | Deprecated since v14 | `onLoad` |

---

## 11. Client-only libs (GSAP, Lenis) + caching/`"use client"` boundary

Docs confirm (via `directives/use-client.md`, `guides/lazy-loading.md`, general Server/Client Components guidance — see `getting-started/server-and-client-components.md`):

- `metadata`/`generateMetadata`/`generateViewport`/`generateStaticParams` all require **Server Components** — never put `"use client"` in a file that exports these.
- GSAP/Lenis (window/DOM-dependent) must live in a `"use client"` component. Standard pattern for this repo:

```tsx
// components/SmoothScrollProvider.tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])
  return <>{children}</>
}
```

- `dynamic(() => import(...), { ssr: false })` from `next/dynamic` — **still available in the App Router**, confirmed by `docs/01-app/02-guides/lazy-loading.md`, but with a hard restriction: **`ssr: false` is NOT allowed when the `dynamic()` call is written directly inside a Server Component — Next.js throws a build error.** The doc's own words: "`ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component." So for GSAP/Lenis: put the `dynamic(..., { ssr: false })` call inside a `"use client"` wrapper file, then import *that* wrapper from your Server Component page/layout — never call `dynamic(..., { ssr: false })` straight from `app/page.tsx` or `app/layout.tsx` unless that file itself is `"use client"`.

```tsx
// components/GsapWidget.tsx
'use client'
import dynamic from 'next/dynamic'

const HeavyGsapScene = dynamic(() => import('./HeavyGsapScene'), { ssr: false })
export default HeavyGsapScene
```
- Root layout is still the right place to mount a global smooth-scroll/GSAP provider, imported into `app/layout.tsx` (a Server Component) as a child Client Component — this composition (Server importing Client) is standard and always allowed; it's only Server-Component-only exports (`metadata`, etc.) that can't live in the Client file.
- Cache Components (`cacheComponents: true`) changes how `loading.js` and Suspense boundaries interact with runtime data (`cookies()`, `headers()`, uncached fetches) — if this repo turns on `cacheComponents`, any layout/page using GSAP-driven data fetching that touches request-time APIs needs an explicit `<Suspense>` wrapper or it's a **build-time error**, not just a runtime slowdown. Docs: `file-conventions/layout.md` "Interaction with loading.js", `file-conventions/loading.md`.
- No special Next 16 restriction found on `useEffect`/`useLayoutEffect` DOM libraries beyond the standard Client Component boundary — docs silent on GSAP/Lenis specifically; the above is a synthesis of the general Client/Server Components + lazy-loading docs, verify `ssr:false` behavior at build if used from a Server Component.
