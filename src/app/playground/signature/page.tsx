import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignatureContent } from "@/components/content/signature";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Signature");
  return { title: t("title"), description: t("intro") };
}

export default function Signature() {
  return (
    <div className="page-enter">
      <SignatureContent />
    </div>
  );
}
