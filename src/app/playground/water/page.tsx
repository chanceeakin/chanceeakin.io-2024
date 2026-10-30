import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WaterContent } from "@/components/content/water";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Water");
  return { title: t("title"), description: t("intro") };
}

export default function Water() {
  return (
    <div className="page-enter">
      <WaterContent />
    </div>
  );
}
