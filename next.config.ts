import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export for GitHub Pages (user site at the domain root)
  output: "export",
  // emits work/index.html rather than work.html, so GitHub Pages resolves
  // /work without relying on extension guessing
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
