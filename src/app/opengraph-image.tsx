import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

// required for image routes under `output: "export"`
export const dynamic = "force-static";

export const alt = "Soorya Kumar · Full Stack Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090b",
          padding: 72,
          color: "#f2f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#5eead4" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#5eead4" }} />
          Available for work — {profile.location}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            {profile.name}
          </div>
          <div style={{ marginTop: 24, fontSize: 34, color: "#8b949e" }}>{profile.role}</div>
        </div>

        <div style={{ display: "flex", gap: 18, fontSize: 22, color: "#8b949e" }}>
          {["Full Stack", "Systems", "AI & Retrieval", "Android"].map((tag) => (
            <div
              key={tag}
              style={{
                border: "1px solid rgba(242,245,247,0.18)",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
