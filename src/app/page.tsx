import Hero from "@/components/sections/Hero";
import Marquee from "@/components/motion/Marquee";
import Intro from "@/components/sections/Intro";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Experience from "@/components/sections/Experience";
import Bench from "@/components/sections/Bench";
import Foundations from "@/components/sections/Foundations";
import Collaborate from "@/components/chrome/Collaborate";
import { marqueeItems } from "@/content/profile";

/*
 * Deliberately not code split.
 *
 * `next/dynamic` was tried on the four below-fold client sections and made the
 * page *larger*: 743KB to 814KB. Every one of them still server renders, so
 * their client chunks are preloaded for hydration regardless, and splitting
 * only bought a module wrapper per section. Lazy loading only pays when the
 * code can genuinely be skipped, and hydrating markup that is already in the
 * HTML is not that case.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeItems} />
      <Intro />
      <FeaturedWork />
      <Experience />
      <Bench />
      <Foundations />
      <Collaborate />
    </>
  );
}
