import { getPosts } from "@/lib/posts";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function PostListRSC({ paginate }: { paginate?: boolean }) {
  const t = await getTranslations("Blog");
  const posts = await getPosts();
  const sorted = posts.sort((a, b) => {
    if (a?.publishDate && b?.publishDate) {
      const dateA = new Date(a?.publishDate).getTime();
      const dateB = new Date(b?.publishDate).getTime();
      return dateB - dateA;
    }
    return 0;
  });
  return (
    <>
      <p className="eyebrow mb-6">{t("eyebrow")}</p>
      <h1 className="display mb-12 text-4xl sm:text-6xl">{t("title")}</h1>
      <ul className="border-t border-line">
        {sorted.map((post) => (
          <li key={post?.slug}>
            <Link
              href={`/blog/${post?.slug}`}
              className="group flex flex-col gap-1 border-b border-line py-5 transition-colors hover:bg-paper-deep sm:flex-row sm:items-baseline sm:gap-6 sm:px-3"
            >
              <span className="shrink-0 text-base tabular-nums text-muted">
                {post?.date}
              </span>
              <span className="text-xl text-ink group-hover:text-accent">
                {post?.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
