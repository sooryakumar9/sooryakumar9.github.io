import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollRail from "@/components/motion/ScrollRail";
import RouteTransition from "@/components/motion/RouteTransition";
import Preloader from "@/components/chrome/Preloader";
import CursorDot from "@/components/chrome/CursorDot";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";

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
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{var skip=sessionStorage.getItem("sk-intro-played")!==null||matchMedia("(prefers-reduced-motion: reduce)").matches;if(skip){d.dataset.intro="skip";d.dataset.introDone="true"}else{sessionStorage.setItem("sk-intro-played","1")}}catch(e){d.dataset.intro="skip";d.dataset.introDone="true"}})();`,
          }}
        />
        {/* without scripting the panel could never lift, so never show it */}
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <Preloader />
        <RouteTransition />
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
