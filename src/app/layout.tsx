import type { Metadata } from "next";
import { Suspense } from "react";
import { BackgroundAnimation } from "@/components/animations/background";
import "./globals.css";
import "./styles.css";
import Nav from "@/components/nav";
import Analytics from "@/components/gtm";

export const metadata: Metadata = {
  title: "Chance Eakin",
  description: "I write code sometimes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense>
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
