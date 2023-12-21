import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";

// `cache` is a React 18 feature that allows you to cache a function for the lifetime of a request.
// this means getPosts() will only be called once per page build, even though we may call it multiple times
// when rendering the page.
export const getPosts = cache(async () => {
  const posts = await fs.readdir("./posts/");

  return await Promise.all(
    posts
      .filter((file) => path.extname(file) === ".mdx")
      .map(async (file) => {
        const filePath = `./posts/${file}`;
        const postContent = await fs.readFile(filePath, "utf8");
        const { data, content } = matter(postContent);

        if (data.published === false) {
          return null;
        }

        return { frontMatter: data, body: content };
      })
  );
});

export async function getPost(slug: string) {
  const posts = await getPosts();
  const post = posts.find((post) => post?.frontMatter?.slug === slug);
  console.log(post);
  return post;
}
