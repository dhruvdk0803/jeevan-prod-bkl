import type { Metadata } from "next";

/**
 * Admin root layout — wraps every `/admin/*` route in its own clean shell,
 * deliberately disconnected from the public site chrome (no nav/footer/motion,
 * see `app/layout.tsx`). Never indexed: `proxy.ts` also sends `X-Robots-Tag`
 * as a belt-and-braces header on top of this metadata.
 */
export const metadata: Metadata = {
  title: { default: "JP Admin", template: "%s · JP Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-paper text-ink min-h-svh">{children}</div>;
}
