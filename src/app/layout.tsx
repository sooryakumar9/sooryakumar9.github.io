import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const description =
  "Full-stack software developer in Bengaluru. Complete products across frontend, backend, data and AI — simulation automation at DRDO, retrieval pipelines, secure messaging experiments.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sooryakumar.vercel.app"),
  title: {
    default: "Soorya Kumar — Full-Stack Software Developer",
    template: "%s — Soorya Kumar",
  },
  description,
  keywords: [
    "Soorya Kumar",
    "full-stack developer",
    "software developer",
    "Bengaluru",
    "AI engineering",
    "RAG",
    "automation",
    "post-quantum cryptography",
  ],
  openGraph: {
    title: "Soorya Kumar — Full-Stack Software Developer",
    description,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soorya Kumar — Full-Stack Software Developer",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
