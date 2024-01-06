import { getPosts } from "@/lib/posts";
import Link from "next/link";

export async function PostListRSC({ paginate }: { paginate?: boolean }) {
  const posts = await getPosts();
  return (
    <>
      <h1 className="text-4xl mb-10">Blog</h1>
      <ul>
        {posts.map((post) => (
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
