import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Caveat } from "next/font/google";
import { lazy, Suspense } from "react";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

const Analytics = lazy(() => import("@/components/gtm"));

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Chance Eakin",
    default: "Chance Eakin",
  },
  description: "Software Engineer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrument.variable} ${caveat.variable}`}>
      <body>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
