import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// AI Catalog (https://github.com/Agent-Card/ai-catalog), served at the
// well-known path. This site has no MCP servers, agents, or APIs, so the
// catalog lists only the knowledge resources that actually exist.
export function GET() {
  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: "Chance Eakin",
      documentationUrl: SITE_URL,
    },
    entries: [
      {
        identifier: "urn:air:chanceeakin.io:knowledge:llms-txt",
        type: "text/markdown",
        displayName: "llms.txt",
        description:
          "Markdown index of the site's pages and blog posts for language-model agents.",
        tags: ["llms-txt", "site-index", "blog"],
        url: `${SITE_URL}/llms.txt`,
      },
    ],
  };

  return new Response(JSON.stringify(catalog, null, 2) + "\n", {
    headers: {
      "Content-Type": "application/ai-catalog+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
