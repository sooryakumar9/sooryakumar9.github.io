import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Soorya Kumar · Software Developer, Bengaluru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f4f1ea";
const INK = "#16150f";
const SIGNAL = "#e8501a";
const PENCIL = "#a29b8b";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        {/* header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 2,
            color: PENCIL,
          }}
        >
          <span>SYSTEM DOCUMENT · REV A</span>
          <span>BENGALURU · 12.97°N 77.59°E</span>
        </div>

        {/* the trace */}
        <svg
          width="1072"
          height="130"
          viewBox="0 0 1072 130"
          style={{ marginTop: 48 }}
        >
          <path d="M 0 65 H 1072" stroke={SIGNAL} strokeWidth="3" fill="none" />
          <circle cx="200" cy="65" r="12" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <rect x="490" y="35" width="92" height="60" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <circle cx="880" cy="65" r="12" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 2,
            color: PENCIL,
            justifyContent: "space-between",
            width: 1010,
            marginLeft: 12,
          }}
        >
          <span>INPUT</span>
          <span>SYSTEM</span>
          <span>OUTPUT</span>
        </div>

        {/* name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontSize: 130,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: -3,
          }}
        >
          <span>SOORYA KUMAR</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 28,
            color: INK,
            alignItems: "center",
          }}
        >
          <span style={{ color: SIGNAL, marginRight: 14 }}>●</span>
          <span>Full stack software developer · Bengaluru</span>
        </div>
      </div>
    ),
    size,
  );
}
