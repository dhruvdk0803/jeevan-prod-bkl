import { MotionProvider } from "@/lib/motion";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/layout/Cursor";

/**
 * The public site's chrome — motion runtime, nav, footer and custom cursor.
 *
 * Lives outside the root layout so `/admin` renders in a clean shell without
 * Lenis smooth-scroll, the custom cursor or the marketing navigation. Used by
 * `app/(site)/layout.tsx` and by the root `not-found.tsx`, which Next renders
 * directly under the root layout for unmatched URLs.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
