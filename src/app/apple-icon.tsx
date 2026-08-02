import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS needs a raster touch icon with an opaque background — it does not use
 * the SVG favicon and it does not composite transparency, so a transparent
 * icon comes out as a black square on a dark home screen.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090b",
          color: "#5eead4",
          fontSize: 84,
          fontWeight: 600,
          letterSpacing: -2,
          fontFamily: "sans-serif",
        }}
      >
        SK
      </div>
    ),
    size,
  );
}
