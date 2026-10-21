import { setRequestLocale } from "next-intl/server";
import { AboutContent } from "@/components/content/about";

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="page-enter">
      <AboutContent />
    </div>
  );
}
