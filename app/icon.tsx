import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#7427D0",
          color: "#F87D05",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        CT
      </div>
    ),
    { ...size },
  );
}
