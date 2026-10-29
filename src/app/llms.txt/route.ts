import { getPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// llms.txt (https://llmstxt.org): a Markdown index for language-model agents.
export async function GET() {
  const posts = (await getPosts()).sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );

  const postLines = posts.map(
    (p) =>
      `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description ?? ""}`.trimEnd(),
  );

  const body = `# Chance Eakin

> Personal site of Chance Eakin, a software engineer in Austin, Texas with about a decade of experience across robotics, financial transactions, web animation, and skyscraper construction. Classically trained singer (DMA, UT Austin).

The site is a small Next.js app: a handful of pages plus a blog of long-form posts written in Markdown/MDX. Pages are available in English and Spanish; the language is chosen per request from the NEXT_LOCALE cookie or the Accept-Language header, so the URLs are the same in both languages. Blog posts are English only.

## Pages

- [Home](${SITE_URL}/): Introduction and the things Chance cares about
- [About](${SITE_URL}/about): Work, life, and education
- [Links](${SITE_URL}/links): Instagram, LinkedIn, and GitHub profiles
- [Blog](${SITE_URL}/blog): Index of all posts, newest first

## Blog posts

${postLines.join("\n")}

## Machine-readable

- [AI catalog](${SITE_URL}/.well-known/ai-catalog.json): Discovery catalog listing this site's agent-readable resources
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
