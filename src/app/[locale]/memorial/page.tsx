import { setRequestLocale } from "next-intl/server";
import { MemorialContent } from "@/components/content/memorial";

export default async function Memorial({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="page-enter">
      <MemorialContent />
    </div>
  );
}
