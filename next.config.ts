import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export for GitHub Pages (user site at the domain root)
  output: "export",
  // emits work/index.html rather than work.html, so GitHub Pages resolves
  // /work without relying on extension guessing
  trailingSlash: true,
  images: { unoptimized: true },
  // the floating N in the corner of the dev server. It never shipped, since it
  // is not part of a production build, but it sits on top of the hero while
  // the site is being looked at, which is when the hero matters most
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
