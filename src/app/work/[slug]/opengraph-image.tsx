import { ImageResponse } from "next/og";
import { categoryLabels, getProject, projects } from "@/content/work";
import { profile } from "@/content/profile";

// required for image routes under `output: "export"`
export const dynamic = "force-static";

export const alt = "Project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * A card per case study, so a shared link carries the project's own title and
 * stack rather than the generic site image.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

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
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
          <div style={{ color: "#5eead4" }}>
            {project ? categoryLabels[project.category] : "Work"}
          </div>
          <div style={{ color: "#8b949e" }}>{project?.period ?? ""}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: project && project.title.length > 34 ? 76 : 96,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {project?.title ?? "Case study"}
          </div>
          <div style={{ marginTop: 22, fontSize: 30, color: "#8b949e", maxWidth: 940 }}>
            {project?.blurb ?? ""}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14, fontSize: 20, color: "#8b949e" }}>
            {(project?.tech ?? []).slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  border: "1px solid rgba(242,245,247,0.18)",
                  borderRadius: 999,
                  padding: "8px 18px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 22, color: "#f2f5f7" }}>{profile.name}</div>
        </div>
      </div>
    ),
    size,
  );
}
