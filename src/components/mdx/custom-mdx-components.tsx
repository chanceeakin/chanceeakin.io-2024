import { Code } from "bright";
import Image from "next/image";
import { MDXComponents } from "mdx/types";
import { MDXLink } from "./mdx-link";

export const mdxComponents: MDXComponents = {
  a: ({ children, ...props }) => {
    return <MDXLink {...props}>{children}</MDXLink>;
  },
  img: ({ src, alt, ...props }) => {
    if (!src || !alt) return null;
    const width: number = 600;
    const height: number = 400;
    return (
      <figure className="flex flex-col items-center mb-8" key={src}>
        <Image width={width} height={height} alt={alt} src={src} />
        <figcaption className="z-10 mt-4 text-sm italic text-center">
          {alt}
        </figcaption>
      </figure>
    );
  },
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl mb-12 text-emerald-200" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl mb-12 text-emerald-200" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl mb-12 text-emerald-200" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xl mb-10 text-emerald-200" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-lg mb-8 text-emerald-200" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-md mb-8 text-emerald-200" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-8" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-8" {...props}>
      {children}
    </ul>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text overflow-hidden border border-gray-400 px-8 pt-8 pb-0 mb-8"
      {...props}
    >
      {children}
    </blockquote>
  ),
  li: ({ children, ...props }) => (
    <li className="list-item list-disc ml-8 mr-4" {...props}>
      {children}
    </li>
  ),
  pre: ({
    children,
    ...props
  }: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLPreElement
  >) => {
    return (
      <Code {...props} theme="material-ocean">
        {children as any}
      </Code>
    );
  },
};
