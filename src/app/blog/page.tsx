import { PostListRSC } from "@/components/content/blog/posts-list";
import { Suspense } from "react";

const Blog = async () => {
  return (
    <Suspense fallback={<div role="status">Loading...</div>}>
      <PostListRSC paginate={true} />
    </Suspense>
  );
};

export default Blog;
