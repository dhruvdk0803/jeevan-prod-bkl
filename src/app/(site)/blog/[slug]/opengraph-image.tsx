import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/cms/public";

/**
 * Branded fallback OG card for posts without a cover/OG image override.
 * Matches the style of the site-wide `app/opengraph-image.tsx` — same dark
 * ink background, ember rule, Satori's default system font only (Fraunces is
 * a network font and deliberately not loaded here).
 */
export const runtime = "nodejs";
export const alt = "Jeevan Productions — Journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? "Jeevan Productions — Journal";
  const category = post?.category?.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#131319",
          padding: "80px 96px",
          color: "#f4f1ec",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 4, background: "#854488", display: "flex" }} />
          <div
            style={{
              fontSize: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#b5aca4",
              fontFamily: "sans-serif",
              display: "flex",
            }}
          >
            Jeevan Productions — Journal
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {category ? (
            <div
              style={{
                fontSize: 24,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#c9a6d2",
                fontFamily: "sans-serif",
                marginBottom: 24,
                display: "flex",
              }}
            >
              {category}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              display: "flex",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
