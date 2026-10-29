import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlaygroundContent } from "@/components/content/playground";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Playground");
  return { title: t("title"), description: t("intro") };
}

export default function Playground() {
  return (
    <div className="page-enter">
      <PlaygroundContent />
    </div>
  );
}
