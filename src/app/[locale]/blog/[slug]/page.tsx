import { getPosts, getPost } from "@/lib/posts";
import { PostBody } from "@/components/content/blog/post-body";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default async function PostPage({
  params,
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPost(slug);
  // notFound is a Next.js utility
  if (!post) return notFound();
  // Pass the post contents to MDX
  return <PostBody>{post?.body}</PostBody>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  // The params to pre-render the page with.
  // Without this, the page will be rendered at runtime
  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug })),
  );
}
