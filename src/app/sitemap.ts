import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { EXPERIMENTS } from "@/lib/playground/experiments";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    ...["", "/about", "/links", "/playground", "/blog"].map((path) => ({
      url: `${SITE_URL}${path}`,
    })),
    ...EXPERIMENTS.map(({ slug }) => ({
      url: `${SITE_URL}/playground/${slug}`,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.lastModified ?? post.publishDate),
    })),
  ];
}
