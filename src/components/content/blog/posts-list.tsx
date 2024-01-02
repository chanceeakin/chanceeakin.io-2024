import { getPosts } from "@/lib/posts";
import Link from "next/link";

export async function PostListRSC({ paginate }: { paginate?: boolean }) {
  const posts = await getPosts();
  return (
    <>
      <h1 className="text-4xl mb-10">Blog</h1>
      <ul>
        {posts.map((post) => (
          <Link key={post?.slug} href={`/blog/${post?.slug}`}>
            <li>{post?.title}</li>
          </Link>
        ))}
      </ul>
    </>
  );
}
