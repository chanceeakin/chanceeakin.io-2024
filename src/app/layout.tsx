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
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WWR789GK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <Suspense fallback={null}>
          <BackgroundAnimation />
        </Suspense>
        <Nav />
        <Suspense>
          <Analytics />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
