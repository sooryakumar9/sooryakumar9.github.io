import dynamic from "next/dynamic";
import SmoothScroll from "@/components/motion/SmoothScroll";
import SignalRail from "@/components/chrome/SignalRail";
import SiteChrome from "@/components/chrome/SiteChrome";
import CursorLabel from "@/components/chrome/CursorLabel";
import SignalHero from "@/components/chapters/SignalHero";
import Operator from "@/components/chapters/Operator";

// below-fold chapters are code-split so the opening sequence hydrates first
const FieldRecords = dynamic(() => import("@/components/chapters/FieldRecords"));
const CaseFiles = dynamic(() => import("@/components/chapters/CaseFiles"));
const Bench = dynamic(() => import("@/components/chapters/Bench"));
const Graph = dynamic(() => import("@/components/chapters/Graph"));
const TitleBlock = dynamic(() => import("@/components/chapters/TitleBlock"));

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SignalRail />
      <SiteChrome />
      <CursorLabel />
      <main>
        <SignalHero />
        <Operator />
        <FieldRecords />
        <CaseFiles />
        <Bench />
        <Graph />
      </main>
      <TitleBlock />
    </>
  );
}
