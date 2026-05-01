
## Relations
@project/overview

The blog section is built using Next.js's App Router. The main blog page at `/blog` displays a list of all blog posts. This is handled by `src/app/blog/page.tsx`, which uses the `PostListRSC` component to render the list.

---

Individual blog posts are dynamically routed using the `[slug]` convention. The page at `src/app/blog/[slug]/page.tsx` is responsible for rendering a single post. It fetches the post data using `getPost(params.slug)` and then passes the post body to the `PostBody` component.

---

The `getPosts` function in `src/lib/posts.ts` is responsible for fetching all blog posts from the `src/posts` directory. It reads all `.mdx` files, parses the frontmatter using `gray-matter`, and returns an array of post objects. The `getPost` function then filters this array to find the post with the matching slug.

---

The `generateStaticParams` function in `src/app/blog/[slug]/page.tsx` is used to pre-render all blog posts at build time. This is a performance optimization that allows Next.js to generate static HTML files for each blog post.
