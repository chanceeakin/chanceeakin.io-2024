import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales, type Locale } from "./config";

// Picks the first supported language from an Accept-Language header,
// honoring q-values and regional variants (es-MX -> es).
function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q.split("=")[1]) : 1 };
    })
    .filter(({ q }) => !Number.isNaN(q) && q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    const match = locales.find((l) => l === tag || l === base);
    if (match) return match;
  }
  return undefined;
}

export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(stored)
    ? stored
    : (fromAcceptLanguage((await headers()).get("accept-language")) ??
      defaultLocale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
