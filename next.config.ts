import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export for GitHub Pages (user site at the domain root)
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
