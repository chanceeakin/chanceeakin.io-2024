import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CubesContent } from "@/components/content/cubes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cubes");
  return { title: t("title"), description: t("intro") };
}

export default function Cubes() {
  return (
    <div className="page-enter">
      <CubesContent />
    </div>
  );
}
