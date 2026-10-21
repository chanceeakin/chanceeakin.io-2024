import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Post } from "@/lib/types";

export const PostNavigation = ({
  previous,
  next,
}: {
  previous?: Post;
  next?: Post;
}) => {
  const t = useTranslations("Blog");
  return (
    <nav aria-label={t("postNav")} className={Container}>
      <div className={PostNavBefore}>
        {previous ? (
          <Link className={PostNavLink} lang="en" href={`/blog/${previous.slug}`}>
            <div>← {t("olderLabel")}</div>
            {previous.title}
          </Link>
        ) : null}
      </div>

      <div className={PostNavAfter}>
        {next ? (
          <Link className={PostNavLink} lang="en" href={`/blog/${next.slug}`}>
            <div>{t("newerLabel")} →</div>
            {next.title}
          </Link>
        ) : null}
      </div>
    </nav>
  );
};

const Container = `flex justify-between gap-4 w-full mt-16`;

const PostNavBefore = `flex mr-2 text-left`;
const PostNavAfter = `flex ml-2 text-right`;

const PostNavLink = `border border-line-strong hover:border-accent hover:text-accent px-6 py-4 mb-4 text-sm`;
