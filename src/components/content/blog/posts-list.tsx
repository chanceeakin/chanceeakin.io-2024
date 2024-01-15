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
      <h1 className="text-4xl mb-10">Blog</h1>
      <ul>
        {sorted.map((post) => (
          <li key={post?.slug} className="my=4">
            <Link href={`/blog/${post?.slug}`}>
              <h3>
                <span>{post?.date}</span>&nbsp;&mdash;&nbsp;
                <span className="text-xl text-amber-200 hover:text-amber-300">
                  {post?.title}
                </span>
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
