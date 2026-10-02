import { ImageResponse } from "next/og";

export const alt = "Fuente CT-X800, keyboard setup and learning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0C0A12",
          color: "#F7F3FF",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#F87D05",
            fontSize: 28,
            letterSpacing: 6,
          }}
        >
          FUENTE CT-X800
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1 }}>
          <div style={{ display: "flex" }}>Set up, play,</div>
          <div style={{ display: "flex", color: "#C9A6FF" }}>and learn.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#D2C7E6" }}>
          600 tones · 195 rhythms · 160 songs
        </div>
      </div>
    ),
    { ...size },
  );
}
