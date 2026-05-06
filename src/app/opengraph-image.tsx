import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Zen Lineage — an interactive encyclopedia of Zen Buddhism";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#faf9f7",
          color: "#3d3530",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#7a6a55",
          }}
        >
          Zen Lineage
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 220, lineHeight: 1, color: "#5a7a5a" }}>禅</div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.15,
              fontWeight: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>An interactive encyclopedia</span>
            <span>of Zen Buddhism.</span>
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#7a6a55" }}>
          Masters · Schools · Teachings · Lineage · 2,500 years
        </div>
      </div>
    ),
    { ...size }
  );
}
