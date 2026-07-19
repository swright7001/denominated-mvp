import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#090806",
          border: "10px solid #c77742",
          borderRadius: 36,
          color: "#f0a36f",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: 128,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        D
      </div>
    ),
    size,
  );
}
