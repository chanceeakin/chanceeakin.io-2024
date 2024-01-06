import { getPosts, getPost } from "@/lib/posts";
import { PostBody } from "@/components/content/blog/post-body";
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const post = await getPost(params.slug);
  // notFound is a Next.js utility
  if (!post) return notFound();
  // Pass the post contents to MDX
  return <PostBody>{post?.body}</PostBody>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  // The params to pre-render the page with.
  // Without this, the page will be rendered at runtime
  return posts.map((post) => ({ slug: post?.slug }));
}
