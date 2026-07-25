import { ImageResponse } from "next/og";

/**
 * Generated Open Graph image for the site. Uses next/og's ImageResponse with
 * only Satori's default system font — Fraunces is a Google Font served over
 * the network and is deliberately not loaded here, per DESIGN-BRIEF.
 */
export const alt = "Jeevan Productions — Media, Marketing & Events in San Diego";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            width: 64,
            height: 4,
            background: "#854488",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Jeevan Productions
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c9a6d2",
              fontFamily: "sans-serif",
              display: "flex",
            }}
          >
            Media · Marketing · Events
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#b5aca4",
            fontFamily: "sans-serif",
            display: "flex",
          }}
        >
          San Diego, California
        </div>
      </div>
    ),
    { ...size },
  );
}
