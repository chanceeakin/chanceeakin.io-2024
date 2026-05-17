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
      <h1 className="text-4xl mb-10 font-light tracking-wide">Blog</h1>
      <ul className="space-y-4">
        {sorted.map((post) => (
          <li key={post?.slug}>
            <Link
              href={`/blog/${post?.slug}`}
              className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-3 border-b border-white/10 hover:border-white/30 transition-colors duration-200"
            >
              <span className="text-sm text-slate-400 shrink-0 tabular-nums">
                {post?.date}
              </span>
              <span className="text-lg text-amber-200 group-hover:text-amber-100 transition-colors duration-200">
                {post?.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
