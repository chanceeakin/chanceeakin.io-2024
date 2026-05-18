import type { Metadata, Viewport } from "next";
import { lazy, Suspense } from "react";
import "./globals.css";
import "./styles.css";
import ConditionalBackground from "@/components/animations/conditional-background";

const Nav = lazy(() => import("@/components/nav"));
const Analytics = lazy(() => import("@/components/gtm"));

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
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Suspense fallback={<div></div>}>
          <Nav />
          {children}
        </Suspense>
        <ConditionalBackground />
      </body>
    </html>
  );
}
