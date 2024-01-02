import type { Metadata } from "next";
import { lazy, Suspense } from "react";
import { BackgroundAnimation } from "@/components/animations/background";
import "./globals.css";
import "./styles.css";

const Nav = lazy(() => import("@/components/nav"));
const Analytics = lazy(() => import("@/components/gtm"));

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
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Suspense fallback={<div></div>}>
          <BackgroundAnimation />
        </Suspense>
        <Suspense fallback={<div></div>}>
          <Nav />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
