import { getPosts } from "@/lib/posts";
import { Metadata } from "next";
import styles from "./layout.module.css";
import { PostNavigation } from "@/components/content/blog/post-nav";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p?.slug === slug);
  return {
    title: post?.title,
    description: post?.description,
    alternates: {
      canonical: `https://chanceeakin.io/blog/${slug}`,
    },
  };
};

async function getData({ slug }: { slug: string }) {
  const posts = await getPosts();
  const sorted = posts.sort((a, b) => {
    if (a?.publishDate && b?.publishDate) {
      const dateA = new Date(a?.publishDate).getTime();
      const dateB = new Date(b?.publishDate).getTime();
      return dateB - dateA;
    }
    return 0;
  });
  const postIndex = sorted.findIndex((p) => p?.slug === slug);
  if (postIndex === -1) {
    throw new Error(
      `${slug} not found in posts. Did you forget to rename the file?`
    );
  }

  const post = sorted[postIndex];

  const { ...rest } = post;

  return {
    previous: sorted[postIndex + 1] || undefined,
    next: sorted[postIndex - 1] || undefined,
    ...rest,
  };
}

export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const { previous, next } = await getData({ slug });

  return (
    <>
      <article className={styles.blog}>{children}</article>
      <PostNavigation previous={previous} next={next} />
    </>
  );
}
