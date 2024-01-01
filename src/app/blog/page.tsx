import { PostListRSC } from "@/components/mdx/posts-list";
import { Suspense } from "react";

const Blog = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostListRSC paginate={true} />
    </Suspense>
  );
};

export default Blog;
