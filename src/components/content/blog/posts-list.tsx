import { getPosts } from "@/lib/posts";
import Link from "next/link";

export async function PostListRSC({ paginate }: { paginate?: boolean }) {
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
      <p className="eyebrow mb-6">Journal</p>
      <h1 className="display mb-12 text-4xl sm:text-6xl">Blog</h1>
      <ul className="border-t border-sand">
        {sorted.map((post) => (
          <li key={post?.slug}>
            <Link
              href={`/blog/${post?.slug}`}
              className="group flex flex-col gap-1 border-b border-sand py-5 transition-colors hover:bg-cream-deep sm:flex-row sm:items-baseline sm:gap-6 sm:px-3"
            >
              <span className="shrink-0 text-sm tabular-nums text-oak">
                {post?.date}
              </span>
              <span className="text-lg text-rosewood group-hover:text-teak">
                {post?.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
