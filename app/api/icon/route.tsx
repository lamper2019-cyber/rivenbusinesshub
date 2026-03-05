import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get("size") || "512");

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.15,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: size * 0.02,
          }}
        >
          <div
            style={{
              fontSize: size * 0.28,
              fontWeight: 900,
              color: "#C8A951",
              letterSpacing: size * 0.02,
              lineHeight: 1,
            }}
          >
            R
          </div>
          <div
            style={{
              width: size * 0.35,
              height: size * 0.02,
              background: "#C8A951",
              borderRadius: size * 0.01,
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
