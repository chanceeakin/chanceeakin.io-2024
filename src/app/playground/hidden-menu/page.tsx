import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HiddenMenuContent } from "@/components/content/hidden-menu";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HiddenMenu");
  return { title: t("title"), description: t("intro") };
}

export default function HiddenMenu() {
  return (
    <div className="page-enter">
      <HiddenMenuContent />
    </div>
  );
}
