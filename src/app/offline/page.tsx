import { getTranslations } from "next-intl/server";

export default async function OfflinePage() {
  const t = await getTranslations("Pwa");
  return (
    <section className="mx-auto max-w-2xl px-4 py-24">
      <h1 className="text-3xl font-bold">{t("offlineTitle")}</h1>
      <p className="mt-4 text-ink-soft">{t("offlineBody")}</p>
    </section>
  );
}
