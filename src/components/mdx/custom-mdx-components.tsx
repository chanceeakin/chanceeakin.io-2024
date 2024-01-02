import { Code } from "bright";
import { MDXImage } from "./mdx-image";
import { MDXComponents } from "mdx/types";
import { MDXLink } from "./mdx-link";

export const mdxComponents: MDXComponents = {
  a: ({ children, ...props }) => {
    return <MDXLink {...props}>{children}</MDXLink>;
  },
  img: ({ src, alt }) => {
    if (!src || !alt) return null;
    return <MDXImage src={src} alt={alt} />;
  },
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl mb-10" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xl" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-lg" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-md" {...props}>
      {children}
    </h6>
  ),
  pre: Code,
};
