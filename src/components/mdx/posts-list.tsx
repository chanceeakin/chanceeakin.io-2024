import { getPosts } from "@/lib/posts";

export async function PostListRSC({ paginate }: { paginate?: boolean }) {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post?.slug}>{post?.title}</li>
      ))}
    </ul>
  );
}
