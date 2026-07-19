import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#090806",
          border: "2px solid #c77742",
          borderRadius: 7,
          color: "#f0a36f",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: 23,
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
