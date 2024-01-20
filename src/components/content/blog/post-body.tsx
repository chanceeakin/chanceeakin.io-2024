// app/(subpages)/blog/[slug]/components/post-body.tsx
import { MDXRemote } from "next-mdx-remote/rsc";

import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkUnwrapImages from "remark-unwrap-images";
import remarkMdxImages from "remark-mdx-images";

//@ts-ignore
import remarkA11yEmoji from "@fec/remark-a11y-emoji";
import remarkToc from "remark-toc";
import { mdxComponents } from "../../mdx/custom-mdx-components";

export function PostBody({ children }: { children: string }) {
  return (
    <MDXRemote
      source={children}
      options={{
        mdxOptions: {
          remarkPlugins: [
            // Adds support for GitHub Flavored Markdown
            remarkGfm,
            // Makes emojis more accessible
            remarkA11yEmoji,
            // generates a table of contents based on headings
            remarkToc,
            remarkUnwrapImages,
            remarkMdxImages,
          ],
          // These work together to add IDs and linkify headings
          rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        },
      }}
      components={mdxComponents}
    />
  );
}
