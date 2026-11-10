import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const SIZES = [192, 512];

// Same mark as icon.svg. `?maskable=1` shrinks the glyph into the safe zone
// so OS icon masks never crop it.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ size: string }> },
) {
  const { size: raw } = await ctx.params;
  const size = Number(raw);
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });
  const glyph = req.nextUrl.searchParams.has("maskable") ? size * 0.6 : size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f5d2a",
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 32 32">
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
    { width: size, height: size },
  );
}
