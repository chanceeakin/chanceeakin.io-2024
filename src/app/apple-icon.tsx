import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as icon.svg: a mustard "C" on moss.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#4f5d2a" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path
            d="M22.4 9.6A9.2 9.2 0 1 0 22.4 22.4"
            fill="none"
            stroke="#d9a521"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
