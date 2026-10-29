import { getTranslations } from "next-intl/server";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Blog");
  return (
    <div className="page-enter mx-auto w-full max-w-2xl px-6 pt-16 md:pt-24">
      <p className="mb-8 border-l-4 border-mustard bg-paper-deep px-4 py-2 text-base text-ink-soft hidden [html[lang=es]_&]:block">
        {t("englishOnly")}
      </p>
      {/* Post content is written in English. */}
      <div lang="en">{children}</div>
    </div>
  );
}
