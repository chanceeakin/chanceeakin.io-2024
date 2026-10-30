"use client";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { getExperiment } from "@/lib/playground/experiments";
import { SignaturePlayer } from "@/components/playground/signature/signature-player";

export const SignatureContent = () => {
  const t = useTranslations("Signature");
  const format = useFormatter();
  const created = getExperiment("signature")?.created;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-24">
      <Link
        href="/playground"
        className="eyebrow mb-6 inline-block hover:text-accent"
      >
        ← {t("back")}
      </Link>
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">{t("intro")}</p>
      {created ? (
        <p className="mt-3 text-base text-muted">
          <time dateTime={created}>
            {t("createdOn", {
              date: format.dateTime(new Date(`${created}-01T00:00:00Z`), {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }),
            })}
          </time>
        </p>
      ) : null}

      <div className="mt-10">
        <SignaturePlayer />
      </div>

      <div className="mt-12 grid max-w-3xl gap-4 text-lg text-ink-soft">
        <p>{t("howItWorks")}</p>
        <p>{t("swapIt")}</p>
      </div>
    </div>
  );
};
