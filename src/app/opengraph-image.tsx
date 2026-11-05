import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "Blog — stories worth sharing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background:
          "linear-gradient(135deg, #0c1020 0%, #171b2b 55%, #312e81 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        <span>{siteConfig.name}</span>
        <span style={{ color: "#818cf8" }}>.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <span
          style={{
            color: "#a5b4fc",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Stories from the community
        </span>
        <span
          style={{
            maxWidth: "950px",
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 1.08,
          }}
        >
          Ideas worth sharing.
        </span>
        <span style={{ color: "#cbd5e1", fontSize: 26 }}>
          {siteConfig.description}
        </span>
      </div>
    </div>,
    size
  );
}
