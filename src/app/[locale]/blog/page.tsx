import { PostListRSC } from "@/components/content/blog/posts-list";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

const Blog = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <PostListRSC paginate={true} />
    </Suspense>
  );
};

export default Blog;
