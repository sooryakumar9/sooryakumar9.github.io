import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS needs a raster touch icon with an opaque background — it does not use
 * the SVG favicon and it does not composite transparency, so a transparent
 * icon comes out as a black square on a dark home screen. There are no rounded
 * corners here either: iOS applies its own mask, and baking one in shows up as
 * a dark ring inside it.
 *
 * The letterforms are the same paths as `icon.svg` rather than type, so the two
 * are the same mark. Setting text here would resolve to whatever face the
 * renderer happens to have, which is not the one the favicon draws.
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
        }}
      >
        {/* the offset viewBox optically centres the pair; see icon.svg */}
        <svg width="132" height="132" viewBox="1.35 -1.25 32 32" fill="#5eead4">
          <path d="M6.4 12.2c0-2.3 2-3.7 4.7-3.7 1.8 0 3.3.5 4.3 1.4l-1.4 2.2c-.8-.6-1.8-1-2.9-1-1.1 0-1.9.4-1.9 1.1 0 .7.8 1 2.4 1.3 2.4.5 4 1.4 4 3.6 0 2.4-2.1 3.8-4.9 3.8-2 0-3.7-.6-4.9-1.7l1.5-2.1c.9.8 2.2 1.3 3.4 1.3 1.3 0 2.1-.4 2.1-1.2 0-.7-.7-1-2.5-1.3-2.3-.5-3.9-1.4-3.9-3.7z" />
          <path d="M17.7 8.7h2.9v5l4.3-5h3.4l-4.6 5.2 4.8 6.8h-3.4l-3.3-4.8-1.2 1.4v3.4h-2.9z" />
        </svg>
      </div>
    ),
    size,
  );
}
