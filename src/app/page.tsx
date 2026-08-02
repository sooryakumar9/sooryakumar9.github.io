import Hero from "@/components/sections/Hero";
import Marquee from "@/components/motion/Marquee";
import Intro from "@/components/sections/Intro";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Experience from "@/components/sections/Experience";
import Bench from "@/components/sections/Bench";
import Foundations from "@/components/sections/Foundations";
import Collaborate from "@/components/chrome/Collaborate";
import { marqueeItems } from "@/content/profile";

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
