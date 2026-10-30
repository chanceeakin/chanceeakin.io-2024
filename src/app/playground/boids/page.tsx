import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BoidsContent } from "@/components/content/boids";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Boids");
  return { title: t("title"), description: t("intro") };
}

export default function Boids() {
  return (
    <div className="page-enter">
      <BoidsContent />
    </div>
  );
}
