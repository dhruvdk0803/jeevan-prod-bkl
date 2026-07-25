import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { MotionProvider } from "@/lib/motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/layout/Cursor";
import { organizationSchema } from "@/lib/schema";
import { site } from "@/content/site";
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

export const metadata: Metadata = {
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <a href="#main" className="skip-link t-label">
          Skip to content
        </a>
        <MotionProvider>
          <Navigation />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <Cursor />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </body>
    </html>
  );
}
