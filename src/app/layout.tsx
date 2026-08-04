import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import MotionEffects from "@/components/motion/MotionEffects";
import ScrollRail from "@/components/motion/ScrollRail";
import Preloader from "@/components/chrome/Preloader";
import CursorDot from "@/components/chrome/CursorDot";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import { PersonSchema } from "@/components/chrome/StructuredData";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description =
  "Full stack software developer in Bengaluru. I build complete products across frontend, backend, data and AI, from simulation automation at DRDO to retrieval pipelines and secure messaging.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sooryakumar9.github.io"),
  title: {
    default: "Soorya Kumar · Full Stack Software Developer",
    template: "%s · Soorya Kumar",
  },
  description,
  keywords: [
    "Soorya Kumar",
    "full stack developer",
    "software developer",
    "Bengaluru",
    "AI engineering",
    "RAG",
    "automation",
    "quantum resistant cryptography",
  ],
  openGraph: {
    title: "Soorya Kumar · Full Stack Software Developer",
    description,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soorya Kumar · Full Stack Software Developer",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // the font variables must live on the same element the theme resolves
    // against. Tailwind declares --font-display and friends on :root, and a
    // custom property is substituted where it is declared — so if
    // --font-bricolage were only on <body>, :root would see it as undefined
    // and the whole stack would collapse to the browser default.
    // suppressHydrationWarning is required, not cosmetic: the head script below
    // writes data-intro onto this element before React hydrates, so the server
    // markup and the live DOM legitimately differ on it. This is the escape
    // hatch React provides for exactly that case, and it only silences the
    // check one level deep — mismatches inside <body> still surface.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${bricolage.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <head>
        {/*
          Runs before first paint, so the opening panel is either already
          hidden or already on screen — never swapped after the fact. Doing
          this in React would mean a frame of the wrong state.

          The gate is a timestamp on a five minute window, not a once-per-visit
          flag: refreshing during a session stays quiet, coming back later gets
          the full opening. It lives in localStorage rather than sessionStorage
          because a window that resets every time a tab opens is not a window —
          a new tab thirty seconds later would replay it.

          The stamp is written only when the intro actually plays, so a run of
          refreshes inside the window cannot keep pushing the next one away.

          The same pass resolves `data-motion`, which is the single runtime
          truth for whether the site animates: the stored choice from the footer
          toggle if there is one, the OS setting otherwise. It has to be decided
          here, not in React, or a visitor who asked for stillness would still
          catch a frame of it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;var off=false;try{off=matchMedia("(prefers-reduced-motion: reduce)").matches;var m=localStorage.getItem("sk-motion");if(m==="on")off=false;else if(m==="off")off=true}catch(e){}d.dataset.motion=off?"off":"on";try{var n=Date.now(),k="sk-intro-at",last=parseInt(localStorage.getItem(k)||"0",10)||0;var skip=n-last<300000||off;if(skip){d.dataset.intro="skip";d.dataset.introDone="true"}else{localStorage.setItem(k,String(n))}}catch(e){d.dataset.intro="skip";d.dataset.introDone="true"}})();`,
          }}
        />
        {/* without scripting the panel could never lift, so never show it */}
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <PersonSchema />
        <MotionEffects />
        <SmoothScroll />
        <Preloader />
        <ScrollRail />
        <CursorDot />
        <a
          href="#main"
          className="bg-accent text-bg focus:ring-accent sr-only rounded-full px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
