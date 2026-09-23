import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import Script from "next/script";
import { organizationSchema } from "@/lib/schema";
import { site } from "@/content/site";
import { getSiteSettings } from "@/lib/cms/public";
import "./globals.css";

/* Display: Fraunces — an editorial serif with optical sizing, so large
   headlines get tight, high-contrast display cuts while small text stays
   readable. `SOFT` takes the sharpest edges off to keep the brand warm. */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
});

/* UI: Instrument Sans — a clean contemporary grotesk with just enough
   character to avoid the default-system look. */
const grotesk = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk",
});

const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Media, Marketing & Events in San Diego`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  applicationName: site.name,
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "creative agency San Diego",
    "video production San Diego",
    "photography San Diego",
    "event production San Diego",
    "brand strategy",
    "social media marketing",
    "Jeevan Productions",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Media, Marketing & Events`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Media, Marketing & Events`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/**
 * Base metadata merged with Admin → Settings: default title/description,
 * default share image and search-engine verification tokens all come from
 * the CMS so they can change without a deploy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.seoTitleDefault || (baseMetadata.title as { default: string }).default;
  const description = s.seoDescriptionDefault || site.description;
  const images = s.defaultOgImageUrl ? [{ url: s.defaultOgImageUrl }] : undefined;
  return {
    ...baseMetadata,
    title: { default: title, template: `%s — ${site.name}` },
    description,
    openGraph: { ...baseMetadata.openGraph, description, ...(images ? { images } : {}) },
    twitter: { ...baseMetadata.twitter, description, ...(images ? { images } : {}) },
    alternates: {
      ...baseMetadata.alternates,
      types: { "application/rss+xml": [{ url: "/blog/feed.xml", title: `${site.name} — Blog` }] },
    },
    verification: {
      ...(s.googleSiteVerification ? { google: s.googleSiteVerification } : {}),
      ...(s.bingSiteVerification ? { other: { "msvalidate.01": s.bingSiteVerification } } : {}),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1ec",
  colorScheme: "light",
};

/**
 * Applies `.js-motion` before first paint so reveal elements are never seen in
 * their final state and then re-hidden. A 2.5s failsafe strips the class again
 * if the motion runtime never boots, so a JS failure can't leave content
 * permanently invisible.
 */
const MOTION_BOOTSTRAP = `(function(){try{
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var d=document.documentElement;d.classList.add("js-motion");
window.__jpMotionFailsafe=setTimeout(function(){d.classList.remove("js-motion")},2500);
}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { ga4MeasurementId } = await getSiteSettings();
  const gaId = ga4MeasurementId && /^G-[A-Z0-9]+$/.test(ga4MeasurementId) ? ga4MeasurementId : null;
  return (
    /* suppressHydrationWarning: MOTION_BOOTSTRAP intentionally adds
       `.js-motion` to <html> before React hydrates, so the class list is
       expected to differ from the server render. */
    <html
      lang="en"
      className={`${fraunces.variable} ${grotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }} />
      </head>
      <body>
        {/* Site chrome (nav, footer, motion) lives in app/(site)/layout.tsx so
            /admin renders in its own clean shell. */}
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
