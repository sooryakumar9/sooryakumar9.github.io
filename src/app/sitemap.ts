import type { MetadataRoute } from "next";
import { projects } from "@/content/work";

const base = "https://sooryakumar9.github.io";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/work", "/about"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    priority: path === "" ? 1 : 0.8,
  }));

  const work = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  return [...routes, ...work];
}
