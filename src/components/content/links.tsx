import { useTranslations } from "next-intl";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const LINKS = [
  { label: "Instagram", handle: "@chanceeakin", href: "https://www.instagram.com/chanceeakin/", icon: FaInstagram, tone: "bg-mustard text-on-mustard" },
  { label: "LinkedIn", handle: "in/chanceeakin", href: "https://www.linkedin.com/in/chanceeakin/", icon: FaLinkedin, tone: "bg-moss text-on-moss" },
  { label: "GitHub", handle: "chanceeakin", href: "https://github.com/chanceeakin/", icon: FaGithub, tone: "bg-sage text-on-sage" },
];

export const LinksContent = () => {
  const t = useTranslations("Links");
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <p className="eyebrow mb-6">{t("eyebrow")}</p>
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <ul className="mt-12 grid border-t border-l border-line sm:grid-cols-3">
        {LINKS.map(({ label, handle, href, icon: Icon, tone }) => (
          <li key={label} className="flex">
            <a
              href={href}
              className={`on-fill flex min-h-56 w-full flex-col justify-between border-r border-b border-line p-6 transition-colors hover:brightness-95 ${tone}`}
            >
              <Icon size="3em" aria-hidden />
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-bold">{label}</span>
                <span>{handle}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
