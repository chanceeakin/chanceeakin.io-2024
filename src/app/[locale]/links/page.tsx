import { setRequestLocale } from "next-intl/server";
import { LinksContent } from "@/components/content/links";

export default async function Links({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="page-enter">
      <LinksContent />
    </div>
  );
}
