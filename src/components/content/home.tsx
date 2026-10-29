import { useTranslations } from "next-intl";
import Link from "next/link";
import { Arc, Lamp, Shelf, Starburst } from "@/components/glyphs";

type Cell = {
  key: "software" | "austin" | "music" | "writing" | "fishing";
  glyph: React.ReactNode;
  tone: string;
  span: string;
  href?: string;
};

const GLYPH = "h-24 w-24";

const CELLS: Cell[] = [
  { key: "software", glyph: <Shelf className={GLYPH} />, tone: "bg-mustard text-on-mustard", span: "sm:col-span-2", href: "/about" },
  { key: "austin", glyph: <Lamp className={GLYPH} />, tone: "bg-moss text-on-moss", span: "" },
  { key: "music", glyph: <Arc className={GLYPH} />, tone: "bg-paper-deep text-ink", span: "" },
  { key: "writing", glyph: <Starburst className={GLYPH} />, tone: "bg-sage text-on-sage", span: "sm:col-span-2", href: "/blog" },
  { key: "fishing", glyph: <Arc className={`${GLYPH} -scale-y-100`} />, tone: "bg-paper text-ink", span: "sm:col-span-2" },
];

const HomeContent = () => {
  const t = useTranslations("Home");

  return (
    <div className="page-enter">
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24">
        <p className="eyebrow mb-6">{t("eyebrow")}</p>
        <h1 className="display max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
          {t("hello")}
          <br />
          <span className="text-accent">{t("tagline")}</span>
        </h1>
        <div className="mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-sm text-ink-soft">{t("intro")}</p>
          <span aria-hidden className="font-hand text-2xl text-accent -rotate-3">
            {t("note")}
          </span>
        </div>
      </section>

      <section aria-label={t("gridLabel")} className="mx-auto max-w-6xl px-6">
        <ul className="grid grid-cols-1 border-t border-l border-line sm:grid-cols-4">
          {CELLS.map((cell) => {
            const title = t(`cells.${cell.key}.title`);
            const note = t(`cells.${cell.key}.note`);
            const body = (
              <>
                <div aria-hidden className="flex justify-center transition-transform duration-500 group-hover:scale-105">
                  {cell.glyph}
                </div>
                <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
                  <div className="text-sm">
                    <div className="font-bold">{title}</div>
                    <div className="opacity-90">{note}</div>
                  </div>
                  {cell.key === "software" && (
                    <span className="inline-block rounded-full border border-current px-5 py-1.5 text-sm transition-colors group-hover:bg-on-mustard group-hover:text-mustard">
                      {t("cells.software.cta")}
                    </span>
                  )}
                </div>
              </>
            );
            const classes = `group flex min-h-56 flex-col justify-between border-r border-b border-line p-6 ${cell.tone} ${cell.span}`;
            return (
              <li key={cell.key} className={`${cell.span} flex`}>
                {cell.href ? (
                  <Link href={cell.href} className={`${classes} w-full on-fill hover:brightness-95`}>
                    {body}
                  </Link>
                ) : (
                  <div className={`${classes} w-full`}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="on-dark mt-24 bg-inverse text-inverse-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <h2 className="display text-3xl sm:text-5xl">
            {t("bandTitle")}
            <br />
            <span className="text-mustard">{t("bandTitleSoft")}</span>
          </h2>
          <p className="self-end text-inverse-soft">{t("bandBody")}</p>
        </div>
      </section>
    </div>
  );
};

export default HomeContent;
