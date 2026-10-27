import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Caveat } from "next/font/google";
import { lazy, Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { themeInitScript } from "@/lib/theme";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    title: {
      template: "%s | Chance Eakin",
      default: "Chance Eakin",
    },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslations("A11y");

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${instrument.variable} ${caveat.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">
            {t("skipToContent")}
          </a>
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <Nav />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
