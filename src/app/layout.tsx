import type { Metadata, Viewport } from "next";
import { Caveat } from "next/font/google";
import Script from "next/script";
import { lazy, Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import AdobeFonts from "@/components/adobe-fonts";
import SettingsFab from "@/components/settings-fab";
import { themeInitScript } from "@/lib/theme";

const Analytics = lazy(() => import("@/components/gtm"));

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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={caveat.variable}
    >
      <head>
        <link
          rel="ai-catalog"
          href="/.well-known/ai-catalog.json"
          type="application/ai-catalog+json"
        />
        <AdobeFonts />
      </head>
      <body>
        {/* Applies the saved theme before first paint. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
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
          <SettingsFab />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
