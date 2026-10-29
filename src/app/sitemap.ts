import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    ...["", "/about", "/links", "/blog"].map((path) => ({
      url: `${SITE_URL}${path}`,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.lastModified ?? post.publishDate),
    })),
  ];
}
